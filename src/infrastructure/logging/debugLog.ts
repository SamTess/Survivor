const enabled = (() => {
  if (process.env.SYNC_DEBUG === "1" || process.env.SYNC_DEBUG === "true") return true;
  const dbg = process.env.DEBUG || "";
  return /sync/i.test(dbg);
})();

export function debugLog(scope: string, message: string, extra?: Record<string, unknown>) {
  if (!enabled) return;
  const ts = new Date().toISOString();
  if (extra) {
    try {
      const safe: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(extra)) {
        if (typeof v === "object" && v !== null) {
          if (Array.isArray(v)) safe[k] = `[array len=${v.length}]`;
          else safe[k] = `[object keys=${Object.keys(v).length}]`;
        } else safe[k] = v;
      }
      console.log(`[SYNC][${scope}] ${ts} ${message} ::`, safe);
    } catch {
      console.log(`[SYNC][${scope}] ${ts} ${message}`);
    }
  } else {
    console.log(`[SYNC][${scope}] ${ts} ${message}`);
  }
}
