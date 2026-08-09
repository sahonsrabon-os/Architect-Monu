import { GatewayConfig } from '../config/gatewayConfig';
import { TOKEN_CONSTANTS } from '../chat/tokenBudget';

export const DEFAULT_REQUEST_TIMEOUT_MS = 120000;
/** Maximum value for setTimeout (signed 32-bit integer). */
export const MAX_REQUEST_TIMEOUT_MS = 2147483647;
export const FALLBACK_SERVER_URL = 'http://localhost:9999';

/**
 * Accept a Server URL value for configuration. In addition to ordinary
 * `http(s)://`, `ws(s)://` and `unix://` URLs — which `new URL()` parses —
 * this also accepts a bare Unix socket path like `/tmp/zombiecoder/mcp.sock`.
 * `parseServerUrl()` in transport.ts understands that form, but `new URL()`
 * rejects it (no scheme), so validation previously reset the value to the
 * fallback URL and Linux UDS-from-path setups silently broke.
 */
export function isValidServerUrl(rawValue: string): boolean {
  const value = rawValue.trim();
  if (!value) {
    return false;
  }
  try {
    new URL(value);
    return true;
  } catch {
    // Bare Unix socket path: `/abs/path.sock` or `unix:///abs/path.sock`.
    return value.startsWith('/') && value.endsWith('.sock');
  }
}

/**
 * Problems found (and auto-corrected) while validating a raw config. The
 * config service maps these onto log lines and de-duplicated toasts; keeping
 * them as data makes the validation rules unit-testable without `vscode`.
 */
export type ConfigIssue =
  | { kind: 'invalidRequestTimeout'; value: number }
  | { kind: 'requestTimeoutClamped'; value: number }
  | { kind: 'invalidServerUrl'; url: string }
  | { kind: 'outputTokensAdjusted'; output: number; total: number; adjusted: number };

/**
 * Validate a raw config and auto-correct invalid values. Pure — returns the
 * corrected config plus the list of issues found so the caller can decide
 * how to surface them.
 */
export function validateGatewayConfig(raw: GatewayConfig): {
  config: GatewayConfig;
  issues: ConfigIssue[];
} {
  const cfg: GatewayConfig = { ...raw };
  const issues: ConfigIssue[] = [];

  if (cfg.requestTimeout <= 0) {
    issues.push({ kind: 'invalidRequestTimeout', value: cfg.requestTimeout });
    cfg.requestTimeout = DEFAULT_REQUEST_TIMEOUT_MS;
  } else if (cfg.requestTimeout > MAX_REQUEST_TIMEOUT_MS) {
    issues.push({ kind: 'requestTimeoutClamped', value: cfg.requestTimeout });
    cfg.requestTimeout = MAX_REQUEST_TIMEOUT_MS;
  }

  if (!isValidServerUrl(cfg.serverUrl)) {
    issues.push({ kind: 'invalidServerUrl', url: cfg.serverUrl });
    cfg.serverUrl = FALLBACK_SERVER_URL;
  }

  if (cfg.defaultMaxOutputTokens >= cfg.defaultMaxTokens) {
    const adjusted = Math.max(
      TOKEN_CONSTANTS.MIN_OUTPUT_TOKENS,
      cfg.defaultMaxTokens - TOKEN_CONSTANTS.ADJUST_TOKEN_BUFFER
    );
    issues.push({
      kind: 'outputTokensAdjusted',
      output: cfg.defaultMaxOutputTokens,
      total: cfg.defaultMaxTokens,
      adjusted,
    });
    cfg.defaultMaxOutputTokens = adjusted;
  }

  return { config: cfg, issues };
}
