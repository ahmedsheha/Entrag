// Reference policy for the Power Automate queue worker. Not a deployed worker.
const minute = 60_000;
export const MAX_ATTEMPTS = 8;
const terminalRunStates = new Set(['Succeeded', 'Failed', 'Cancelled', 'TimedOut']);

function integer(value, name, min = 1) {
  if (!Number.isSafeInteger(value) || value < min) throw new Error(`Invalid ${name}`);
  return value;
}
function timestamp(value) {
  const time = Date.parse(value);
  if (!Number.isFinite(time)) throw new Error('Invalid timestamp');
  return time;
}
export function jobKey(opportunityId, revision) {
  return `${integer(opportunityId, 'OpportunityId')}-${integer(revision, 'TargetRevision')}`;
}
export function canClaim(job, now, priorRunState) {
  integer(job.AttemptCount, 'AttemptCount', 0);
  if (job.AttemptCount >= MAX_ATTEMPTS) return false;
  const currentTime = timestamp(now);
  if (job.State === 'Running') {
    // An expired lease does not prove a timed-out Excel request has stopped.
    return Boolean(job.LeaseExpiresAt) && timestamp(job.LeaseExpiresAt) <= currentTime
      && terminalRunStates.has(priorRunState);
  }
  if (!['Pending', 'Retry'].includes(job.State)) return false;
  return !job.NextAttemptAt || timestamp(job.NextAttemptAt) <= currentTime;
}
export function retryPatch(attemptCount, now, errorCode, runId) {
  integer(attemptCount, 'AttemptCount');
  // Persist safe codes only, never connector output or the secure script payload.
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(errorCode) || !/^[A-Za-z0-9_-]{1,128}$/.test(runId)) {
    throw new Error('Unsafe error metadata');
  }
  const delay = Math.min(2 ** (attemptCount - 1), 60) * minute;
  return {
    State: attemptCount >= MAX_ATTEMPTS ? 'DeadLetter' : 'Retry',
    NextAttemptAt: attemptCount >= MAX_ATTEMPTS ? null
      : new Date(timestamp(now) + delay).toISOString(),
    LeaseToken: null,
    LeaseExpiresAt: null,
    LastError: `${errorCode}; run=${runId}`
  };
}
export function revisionToSync(targetRevision, latestRevision) {
  integer(targetRevision, 'TargetRevision');
  integer(latestRevision, 'LatestRevision');
  if (latestRevision < targetRevision) throw new Error('Source revision behind queue');
  // Fetch the complete current SharePoint item immediately before Excel upsert.
  return latestRevision;
}
export function emailDecision({targetRevision, requestId, receiptStatus}) {
  integer(targetRevision, 'TargetRevision');
  if (typeof requestId !== 'string' || !requestId) throw new Error('Missing request ID');
  if (targetRevision !== 1 || /^MIGRATION[:-]/i.test(requestId)
    || /^performance-test-/i.test(requestId)) return 'NotApplicable';
  if (receiptStatus === 'Succeeded') return 'AlreadySent';
  if (receiptStatus === 'Sending' || receiptStatus === 'Unknown') return 'ReviewRequired';
  if (receiptStatus === 'Missing' || receiptStatus === 'NotSent') return 'ReserveBeforeSend';
  return 'ReviewRequired';
}
