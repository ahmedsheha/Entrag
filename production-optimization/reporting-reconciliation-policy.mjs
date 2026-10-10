// Offline reference for the enqueue-only reconciliation flow. No connector calls.
import {jobKey, queueJobConfirmed} from './reporting-recovery-policy.mjs';
import { eligibleForProductionQueue } from './production-reporting-trigger.mjs';

const fixtureIds = new Set([154,155,156,157,158,159,160,163]);
const states = new Set(['Pending','Running','Retry','Succeeded','DeadLetter','Superseded']);

export function reconciliationDecision(source, receipts, scope = 'production') {
  const title = jobKey(source.ID, source.Revision);
  if (typeof source.ExcelRowKey !== 'string' || !source.ExcelRowKey.trim()
    || typeof source.ClientRequestId !== 'string' || !source.ClientRequestId.trim()) {
    throw new Error('Missing stable source identity');
  }
  const synthetic = fixtureIds.has(source.ID)
    || /^(?:APP-)?performance-test-/i.test(source.ExcelRowKey)
    || /^performance-test-/i.test(source.ClientRequestId);
  if (!['production','pilot163'].includes(scope)) throw new Error('Invalid scope');
  if (scope === 'pilot163') {
    if (source.ID !== 163
      || source.ExcelRowKey !== 'APP-performance-test-20261007-create-recovery-001') {
      return {action:'Excluded'};
    }
  } else if (synthetic || !eligibleForProductionQueue(source)) return {action:'Excluded'};
  if (!Array.isArray(receipts)) throw new Error('Queue read failed');
  if (receipts.length) {
    if (!queueJobConfirmed(receipts, source.ID, source.Revision)
      || !states.has(receipts[0].State)) throw new Error('Invalid queue receipt');
    // Never reset Running, completed, superseded or dead-letter jobs.
    return {action:'Preserve', title, state:receipts[0].State};
  }
  return {
    action:'Create',
    job:{Title:title, OpportunityId:source.ID, TargetRevision:source.Revision,
      State:'Pending', AttemptCount:0},
    // This is a decision annotation, NOT a new management workbook/list column.
    // The reconciler never sends email; create eligibility uses a separate receipt.
    notification:/^MIGRATION[:-]/i.test(source.ClientRequestId)
      || synthetic ? 'Suppressed' : 'SeparateCreateReceiptRequired'
  };
}

export function advanceScanPage(rows, afterId, upperId, pageSize) {
  for (const n of [afterId,upperId]) {
    if (!Number.isSafeInteger(n) || n < 0) throw new Error('Invalid cursor');
  }
  if (afterId > upperId || !Number.isSafeInteger(pageSize) || pageSize < 1
    || !Array.isArray(rows) || rows.length > pageSize) throw new Error('Invalid page');
  let cursor = afterId;
  for (const row of rows) {
    if (!Number.isSafeInteger(row.ID) || row.ID <= cursor || row.ID > upperId) {
      throw new Error('Page is not strictly ID-ascending within snapshot bound');
    }
    cursor = row.ID;
  }
  // Empty page or reaching the bound ends this sweep. Do NOT use Modified time
  // as a permanent watermark: edits to lower IDs must be seen in the next sweep.
  return {afterId:cursor, done:rows.length === 0 || cursor === upperId};
}
