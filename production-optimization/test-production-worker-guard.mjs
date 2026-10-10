import assert from 'node:assert/strict';
import { productionSourceMatchesJob as matches, productionWorkerGuard,
  productionClaimGuard, productionReaderFilter, productionJobCanBeClaimed as claim }
  from './production-worker-guard.mjs';
const source = { ID: 170, Revision: 3, QuoteNo: 'MSOL2620',
  ClientRequestId: 'real-request', ExcelRowKey: 'APP-real-request',
  ProjectName: 'Real project', Title: 'MSOL2620' };
const job = { Title: '170-2', OpportunityId: 170, TargetRevision: 2 };
const cases = [
  [source, job, true],
  [source, { ...job, Title: '170-3', TargetRevision: 3 }, true],
  [source, { ...job, Title: '170-4', TargetRevision: 4 }, false],
  [source, { ...job, OpportunityId: 171 }, false],
  [source, { ...job, Title: '171-2' }, false],
  [source, { ...job, TargetRevision: 0 }, false],
  [source, { ...job, TargetRevision: '2' }, false],
  [{ ...source, ExcelRowKey: '' }, job, false],
  [{ ...source, ClientRequestId: '' }, job, false],
  [{ ...source, QuoteNo: '' }, job, false],
  [{ ...source, ClientRequestId: 'performance-test-hidden' }, job, false],
  [{ ...source, ExcelRowKey: 'APP-performance-test-hidden' }, job, false],
  [{ ...source, ProjectName: 'TEST ONLY fixture' }, job, false],
  [{ ...source, Title: 'MSOL2620 — TEST ONLY' }, job, false],
  [{ ...source, ID: 163 }, { ...job, Title: '163-2', OpportunityId: 163 }, false]
];
for (const [s, j, expected] of cases) assert.equal(matches(s, j), expected);
assert.ok(!productionWorkerGuard.includes('triggerBody()'));
assert.ok(!productionWorkerGuard.includes('MSOL2614'));
assert.ok(productionWorkerGuard.includes("?['OpportunityId']"));
assert.ok(productionWorkerGuard.includes("?['Title']"));
let depth = 0, quoted = false;
for (const c of productionWorkerGuard) {
  if (c === "'") quoted = !quoted;
  else if (!quoted && c === '(') depth++;
  else if (!quoted && c === ')') { depth--; assert.ok(depth >= 0); }
}
assert.equal(depth, 0); assert.equal(quoted, false);
const now = '2026-10-10T19:00:00Z';
const ready = { ...job, State: 'Pending', AttemptCount: 0, NextAttemptAt: null };
const claimCases = [
  [ready, true],
  [{ ...ready, State: 'Retry', AttemptCount: 7, NextAttemptAt: now }, true],
  [{ ...ready, NextAttemptAt: '2026-10-10T19:00:01Z' }, false],
  [{ ...ready, AttemptCount: 8 }, false],
  [{ ...ready, State: 'Running' }, false],
  [{ ...ready, State: 'Succeeded' }, false],
  [{ ...ready, State: 'DeadLetter' }, false],
  [{ ...ready, Title: 'bad' }, false],
  [{ ...ready, OpportunityId: 163, Title: '163-2' }, false],
  [{ ...ready, TargetRevision: 0 }, false],
  [{ ...ready, NextAttemptAt: 'invalid' }, false]
];
for (const [row, expected] of claimCases) assert.equal(claim(row, now), expected);
assert.ok(productionClaimGuard.includes("['State'],'Retry'"));
assert.ok(productionReaderFilter.includes('OpportunityId ne 163'));
assert.ok(!productionReaderFilter.includes('OpportunityId eq 163'));
console.log(JSON.stringify({ status: 'pass', scenarios: cases.length,
  claimScenarios: claimCases.length, scope: 'offline worker identity/claim guards; no Excel execution' }));
