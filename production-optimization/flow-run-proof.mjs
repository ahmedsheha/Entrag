// Fail-closed adapter for a successful, trusted Dataverse Flow Runs read.
// Offline reference only: no connector call, queue write or recovery deployment.
const terminal = new Set(['Succeeded', 'Failed', 'Cancelled', 'TimedOut']);
const guid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const runName = /^[A-Za-z0-9_-]{1,100}$/;
function utcTime(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return NaN;
  return Date.parse(value);
}

export function flowRunProof(rows, {querySucceeded, flowId, runId, now}) {
  // Missing history, failed reads and ambiguous receipts NEVER authorize reclaim.
  if (querySucceeded !== true || typeof flowId !== 'string' || !guid.test(flowId)
    || typeof runId !== 'string' || !runName.test(runId)
    || !Array.isArray(rows) || rows.length !== 1) return null;
  const row = rows[0];
  if (!row || typeof row.workflowid !== 'string'
    || row.workflowid.toLowerCase() !== flowId.toLowerCase()
    || row.name !== runId || !terminal.has(row.status)) return null;
  const start = utcTime(row.starttime), end = utcTime(row.endtime), current = utcTime(now);
  if (![start, end, current].every(Number.isFinite) || end < start || end > current) return null;
  // Do not return raw errors, owners, credentials or connector payloads.
  return Object.freeze({flowId, runId, status: row.status, endedAt: row.endtime});
}
