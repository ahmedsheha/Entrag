// Offline, operator-reviewed recovery plan. No Dataverse or connector calls.
// Operator evidence is an attestation, not an automatic run-history lookup.
import {canClaim, jobKey, MAX_ATTEMPTS} from './reporting-recovery-policy.mjs';

const terminal = new Set(['Succeeded', 'Failed', 'Cancelled', 'TimedOut']);
const guid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const run = /^[A-Za-z0-9_-]{1,100}$/;
function utc(value) {
  return typeof value === 'string' && /T.*(?:Z|[+-]\d\d:\d\d)$/.test(value)
    && Number.isFinite(Date.parse(value)) ? Date.parse(value) : NaN;
}
export function manualRecoveryPlan(job, evidence, config, now) {
  const reject = reason => Object.freeze({action:'ReviewRequired', reason});
  if (!job || !evidence || !config || !Number.isFinite(utc(now))) return reject('InvalidInput');
  if (!guid.test(config.workerFlowId ?? '') || !guid.test(config.queueListId ?? '')
    || !guid.test(config.environmentId ?? '')) return reject('InvalidConfiguration');
  if (!Number.isSafeInteger(job.ID) || job.ID < 1
    || !Number.isSafeInteger(job.OpportunityId) || job.OpportunityId < 1
    || !Number.isSafeInteger(job.TargetRevision) || job.TargetRevision < 1
    || job.Title !== jobKey(job.OpportunityId, job.TargetRevision)) return reject('InvalidJobIdentity');
  if (job.State !== 'Running') return reject('NotRunning');
  if (!Number.isSafeInteger(job.AttemptCount) || job.AttemptCount < 1
    || job.AttemptCount >= MAX_ATTEMPTS) return reject('AttemptLimitOrInvalid');
  if (!run.test(job.LeaseToken ?? '') || !Number.isFinite(utc(job.LeaseExpiresAt))) return reject('InvalidLease');
  if (typeof job.ETag !== 'string' || !/^(?:W\/)?"\d+"$/.test(job.ETag)) return reject('MissingExactETag');
  const expectedUrl = `https://make.powerautomate.com/environments/Default-${config.environmentId}/flows/${config.workerFlowId}/runs/${job.LeaseToken}`;
  if (evidence.runUrl !== expectedUrl || evidence.flowId !== config.workerFlowId
    || evidence.runId !== job.LeaseToken || !terminal.has(evidence.status)) return reject('ExactTerminalRunNotConfirmed');
  const reviewed = utc(evidence.reviewedAt), ended = utc(evidence.endedAt), clock = utc(now);
  if (![reviewed, ended].every(Number.isFinite) || ended > reviewed || reviewed > clock
    || clock - reviewed > 5 * 60_000) return reject('StaleOrInvalidReview');
  if (typeof evidence.reviewedBy !== 'string' || !evidence.reviewedBy.trim()
    || evidence.reviewedBy.length > 128) return reject('MissingReviewer');
  // Off alone does not cancel existing runs. Operator must inspect history and
  // verify the workbook request cannot still be executing before any queue reset.
  if (evidence.workerOff !== true || evidence.noActiveOrWaitingRuns !== true
    || evidence.otherWorkbookWritersQuiesced !== true
    || evidence.excelExecutionSettled !== true) return reject('WritersNotQuiesced');
  if (!canClaim(job, now, evidence, config.workerFlowId)) return reject('LeaseNotExpired');
  return Object.freeze({
    action:'ConditionalRetry', itemId:job.ID,
    // Re-read immediately before dispatch; never use IF-MATCH: * or auto-retry 412.
    expected:Object.freeze({etag:job.ETag, state:'Running', leaseToken:job.LeaseToken,
      attemptCount:job.AttemptCount, title:job.Title}),
    patch:Object.freeze({State:'Retry', NextAttemptAt:now, LeaseToken:null,
      LeaseExpiresAt:null, LastError:`ManualRecoveryApproved; run=${job.LeaseToken}`}),
    audit:Object.freeze({runUrl:expectedUrl, status:evidence.status,
      endedAt:evidence.endedAt, reviewedAt:evidence.reviewedAt, reviewedBy:evidence.reviewedBy})
  });
}

export function sameRecoverySnapshot(fresh, plan) {
  return plan?.action === 'ConditionalRetry' && fresh?.ID === plan.itemId
    && fresh?.ETag === plan.expected.etag && fresh?.State === plan.expected.state
    && fresh?.LeaseToken === plan.expected.leaseToken
    && fresh?.AttemptCount === plan.expected.attemptCount && fresh?.Title === plan.expected.title;
}
