/**
 * MemoryManager — client-side `.zombiecoder/agents/memory.json` store.
 *
 * Mirrors the server's three-file memory layout (SSOT.md → syllabus.md →
 * memory.json) so the extension keeps session context even against a remote
 * Mission Barisal server. The memory file is bounded to the most recent 200
 * entries to keep it small and cheap to inject.
 *
 * Phase 1 — Mission Foundation.
 */

import * as fs from 'fs';
import * as path from 'path';

export interface SessionMemoryEntry {
    sessionId: string;
    timestamp: string;
    agent: string;
    summary: string;
}

const MAX_MEMORY_ENTRIES = 200;

/**
 * Server-compatible memory.json structure.
 * The Mission Barisal server's readMemory() expects current_session,
 * recent_context and session_index keys — writing ONLY `{ entries: [] }`
 * made the server crash in archiveSession (session_index was undefined).
 * Keep this shape in sync with the server defaults.
 */
function createDefaultMemory(): Record<string, unknown> {
    return {
        current_session: {
            id: null,
            started_at: null,
            message_count: 0,
            summary: null,
        },
        recent_context: [],
        session_index: {
            last_accessed: null,
            total_sessions: 0,
            total_archived: 0,
        },
        entries: [],
    };
}

export class MemoryManager {
    private readonly agentsDir: string;

    constructor(
        private readonly workspaceRoot: string,
        private readonly log: (message: string) => void
    ) {
        this.agentsDir = path.join(workspaceRoot, '.zombiecoder', 'agents');
    }

    public ensureDirs(): void {
        fs.mkdirSync(path.join(this.workspaceRoot, '.zombiecoder'), { recursive: true });
        fs.mkdirSync(this.agentsDir, { recursive: true });
        fs.mkdirSync(path.join(this.agentsDir, 'sessions'), { recursive: true });
        // Create memory.json UPFRONT with the FULL server-compatible structure
        // so session memory exists from the very first run AND the server's
        // readMemory()/archiveSession() never crash on missing keys.
        if (!fs.existsSync(this.getMemoryPath())) {
            try {
                fs.writeFileSync(
                    this.getMemoryPath(),
                    JSON.stringify(createDefaultMemory(), null, 2),
                    'utf8'
                );
                this.log(`Memory file created: ${this.getMemoryPath()}`);
            } catch (error) {
                this.log(
                    `Memory file create failed: ${error instanceof Error ? error.message : String(error)}`
                );
            }
        }
    }

    public getMemoryPath(): string {
        return path.join(this.agentsDir, 'memory.json');
    }

    public getSessionsDir(): string {
        return path.join(this.agentsDir, 'sessions');
    }

    public readMemory(): SessionMemoryEntry[] {
        try {
            const raw = fs.readFileSync(this.getMemoryPath(), 'utf8');
            const parsed = JSON.parse(raw) as { entries?: SessionMemoryEntry[] };
            return Array.isArray(parsed.entries) ? parsed.entries : [];
        } catch {
            return [];
        }
    }

    public appendSession(entry: Omit<SessionMemoryEntry, 'timestamp'>): void {
        // Preserve the FULL server-compatible structure — never replace the
        // whole file with just `{ entries: [...] }` (that would drop
        // current_session / recent_context / session_index again).
        let memory: Record<string, unknown> = createDefaultMemory();
        try {
            const raw = fs.readFileSync(this.getMemoryPath(), 'utf8');
            const parsed = JSON.parse(raw) as Record<string, unknown>;
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                memory = { ...memory, ...parsed };
            }
        } catch {
            // fall back to defaults
        }

        const current = Array.isArray(memory.entries)
            ? (memory.entries as SessionMemoryEntry[])
            : [];
        current.push({ ...entry, timestamp: new Date().toISOString() });
        memory.entries = current.slice(-MAX_MEMORY_ENTRIES);

        try {
            fs.writeFileSync(
                this.getMemoryPath(),
                JSON.stringify(memory, null, 2),
                'utf8'
            );
            this.log(`Memory appended for ${entry.agent} (${entry.sessionId})`);
        } catch (error) {
            this.log(
                `Memory write failed: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }
}
