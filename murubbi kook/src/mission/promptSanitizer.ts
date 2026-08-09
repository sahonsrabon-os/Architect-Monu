/**
 * promptSanitizer — the "dālāli" (middleman) stripper.
 *
 * VS Code injects a huge Microsoft/Copilot system prompt ahead of the user's
 * real request: identity forcing ("respond with GitHub Copilot"), content
 * policies, and a pile of `<instructions>`, `<toolUseInstructions>`,
 * `<notebookInstructions>`, `<outputFormatting>`, `<memoryInstructions>`,
 * `<skills>`, `<agents>` and `<modeInstructions>` blocks.
 *
 * None of that must reach Mission Barisal agents. This module detects the
 * boilerplate message(s) by signature and drops them, and strips any
 * embedded instruction blocks from surviving user messages.
 *
 * Phase 2 — Prompt Sanitizer.
 */

import { OpenAIMessage } from '../api/types';

type Logger = (message: string) => void;

/**
 * Signatures that identify the Microsoft/Copilot middleman prompt. A message
 * must hit at least {@link MIN_SIGNATURE_HITS} signatures AND exceed
 * {@link MIN_BOILERPLATE_LENGTH} characters to count — a short user message
 * that merely mentions "GitHub Copilot" must never be stripped.
 */
const BOILERPLATE_SIGNATURES: readonly RegExp[] = [
    /GitHub Copilot/i,
    /Microsoft content polic/i,
    /expert AI programming assistant/i,
    /Follow Microsoft/i,
    /When asked for your name/i,
    /violates copyrights/i,
    /highly sophisticated automated coding agent/i,
    /notebookInstructions/i,
    /toolUseInstructions/i,
    /modeInstructions/i,
];

const MIN_BOILERPLATE_LENGTH = 300;
const MIN_SIGNATURE_HITS = 2;

/**
 * Instruction-block tags the middleman wraps around its rules.
 *
 * NOTE: `userRequest` is intentionally EXCLUDED. VS Code wraps the user's
 * real input in `<userRequest>…</userRequest>` tags inside Copilot Chat
 * messages. Stripping it silently blanked the user's prompt — the model
 * received zero input text and responded with only the Mission context.
 */
const INSTRUCTION_BLOCK_TAGS: readonly string[] = [
    'instructions',
    'toolUseInstructions',
    'notebookInstructions',
    'outputFormatting',
    'memoryInstructions',
    'skills',
    'agents',
    'modeInstructions',
    'context',
    'reminderInstructions',
];

/** Extract the plain text of a wire-format message (string or parts array). */
export function getMessageText(message: OpenAIMessage): string {
    const content = message.content;
    if (typeof content === 'string') {
        return content;
    }
    if (Array.isArray(content)) {
        return content
            .map((part) => {
                if (typeof part === 'string') {
                    return part;
                }
                if (part && typeof part === 'object') {
                    const record = part as Record<string, unknown>;
                    if (typeof record.text === 'string') {
                        return record.text;
                    }
                }
                return '';
            })
            .join('\n');
    }
    return '';
}

/** True when the text looks like the big Microsoft/Copilot system prompt. */
export function hasBoilerplateSignature(text: string): boolean {
    if (text.length < MIN_BOILERPLATE_LENGTH) {
        return false;
    }
    let hits = 0;
    for (const signature of BOILERPLATE_SIGNATURES) {
        signature.lastIndex = 0;
        if (signature.test(text)) {
            hits++;
        }
    }
    return hits >= MIN_SIGNATURE_HITS;
}

export function isCopilotBoilerplate(message: OpenAIMessage): boolean {
    return hasBoilerplateSignature(getMessageText(message));
}

/** Remove `<tag>…</tag>` blocks (and stray open/close tags) from text. */
export function stripInstructionBlocks(text: string): string {
    let result = text;
    for (const tag of INSTRUCTION_BLOCK_TAGS) {
        result = result.replace(new RegExp(`<${tag}[^>]*>[\\s\\S]*?<\\/${tag}>`, 'gi'), '');
        result = result.replace(new RegExp(`<${tag}[^>]*>`, 'gi'), '');
        result = result.replace(new RegExp(`<\\/${tag}>`, 'gi'), '');
    }
    return result.trim();
}

/** Sanitize a single message: strip embedded instruction blocks in place. */
export function sanitizeMessage(message: OpenAIMessage): OpenAIMessage {
    const text = getMessageText(message);
    if (text.length === 0) {
        return message;
    }
    const cleaned = stripInstructionBlocks(text);
    if (cleaned !== text) {
        return { ...message, content: cleaned };
    }
    return message;
}

/** Check whether an OpenAI message carries any usable content. */
function hasContent(message: OpenAIMessage): boolean {
    // Assistant messages with tool_calls are valid even when content is null
    // (the model emits only tool calls, no text). Dropping them orphanes the
    // subsequent role:tool messages, which then fail upstream validation:
    // "Messages with role 'tool' must be a response to a preceding message
    // with 'tool_calls'".
    if (Array.isArray(message.tool_calls) && message.tool_calls.length > 0) {
        return true;
    }
    const content = message.content;
    if (content === null || content === undefined) {
        return false;
    }
    if (typeof content === 'string') {
        return content.length > 0;
    }
    if (Array.isArray(content)) {
        return content.length > 0;
    }
    return true;
}

/**
 * Drop middleman boilerplate messages, scrub instruction blocks from the
 * rest, and **discard any messages left empty** after sanitization.
 *
 * VS Code's Copilot Chat UI sometimes appends an extra `role=user` message
 * with empty content (hasContent=false). When this reaches the model it
 * produces confusing / empty responses.  Instruction blocks that consumed
 * the entire message body (e.g. `<context>…</context>`) can also leave an
 * empty string behind — those are useless and must be dropped too.
 *
 * Phase 2 — Prompt Sanitizer.
 */
export function sanitizeMessages(
    messages: readonly OpenAIMessage[],
    log?: Logger
): OpenAIMessage[] {
    let dropped = 0;
    let emptied = 0;
    const result: OpenAIMessage[] = [];

    for (const message of messages) {
        if (isCopilotBoilerplate(message)) {
            dropped++;
            log?.(
                `  [mission] Dropped Copilot boilerplate message (${getMessageText(message).length} chars)`
            );
            continue;
        }
        const cleaned = sanitizeMessage(message);
        if (!hasContent(cleaned)) {
            emptied++;
            log?.(
                `  [mission] Dropped empty message (role=${cleaned.role}, originally ${getMessageText(message).length} chars)`
            );
            continue;
        }
        result.push(cleaned);
    }

    // Phase 2b — consecutive user message dedup.
    //
    // VS Code's Copilot Chat UI sometimes sends an extra `role=user` message
    // right after the real user input (or even after an assistant reply). Two
    // consecutive user messages without an assistant message between them is
    // malformed in the OpenAI chat format — models get confused by it and may
    // return empty responses or ignore the second (real) user message.
    //
    // Strategy: walk the result array and whenever two `user` messages appear
    // back-to-back, drop the **second** one.  The first user message carries
    // the real typed input; the second is VS Code metadata / duplication.
    let deduped = 0;
    const deduplicated: OpenAIMessage[] = [];
    for (let i = 0; i < result.length; i++) {
        const msg = result[i];
        if (msg.role === 'user' && deduplicated.length > 0) {
            const prev = deduplicated[deduplicated.length - 1];
            if (prev.role === 'user') {
                deduped++;
                log?.(
                    `  [mission] Dropped consecutive user message (index ${i}, ${getMessageText(msg).length} chars) — duplicate of preceding user message`
                );
                continue;
            }
        }
        deduplicated.push(msg);
    }

    // Phase 2c — orphaned tool message removal.
    //
    // Every `role: 'tool'` message must be preceded by a `role: 'assistant'`
    // message with `tool_calls`.  Orphaned tool results (e.g. from a prior
    // conversation turn that was dropped) cause the upstream error:
    //   "Messages with role 'tool' must be a response to a preceding message
    //    with 'tool_calls'"
    let orphanedTools = 0;
    const validated: OpenAIMessage[] = [];
    let lastHadToolCalls = false;
    for (const msg of deduplicated) {
        if (msg.role === 'assistant' && Array.isArray(msg.tool_calls) && msg.tool_calls.length > 0) {
            lastHadToolCalls = true;
            validated.push(msg);
        } else if (msg.role === 'tool') {
            if (!lastHadToolCalls) {
                orphanedTools++;
                log?.(
                    `  [mission] Dropped orphaned tool message (tool_call_id=${(msg as any).tool_call_id ?? '?'} — no preceding assistant with tool_calls)`
                );
                continue;
            }
            validated.push(msg);
            // Multiple tool results can follow a single assistant with
            // multiple tool_calls — don't reset lastHadToolCalls.
        } else {
            if (msg.role === 'user' || msg.role === 'assistant') {
                lastHadToolCalls = false;
            }
            validated.push(msg);
        }
    }

    if (dropped > 0 || emptied > 0 || deduped > 0 || orphanedTools > 0) {
        const parts: string[] = [];
        if (dropped > 0) { parts.push(`${dropped} middleman`); }
        if (emptied > 0) { parts.push(`${emptied} empty`); }
        if (deduped > 0) { parts.push(`${deduped} consecutive user`); }
        if (orphanedTools > 0) { parts.push(`${orphanedTools} orphaned tool`); }
        log?.(
            `[mission] Sanitizer removed ${parts.join(' + ')} message(s) — agents see only clean input`
        );
    }
    return validated;
}
