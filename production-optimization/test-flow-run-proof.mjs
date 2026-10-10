import assert from 'node:assert/strict';
import {flowRunProof} from './flow-run-proof.mjs';
import {canClaim} from './reporting-recovery-policy.mjs';
const flowId = '5998de92-8e3a-47a2-b434-a71a9f4f1829';
const runId = '08584099605707719437455427481CU16';
const context = {querySucceeded:true, flowId, runId, now:'2026-10-10T16:00:00Z'};
// Synthetic fixture, NOT evidence of the corresponding live run's metadata.
const row = {workflowid:flowId, name:runId, status:'Failed',
  starttime:'2026-10-10T15:31:00Z', endtime:'2026-10-10T15:32:00Z'};
let count = 0;
function check(name, fn) { fn(); count++; console.log(`PASS ${name}`); }
for (const status of ['Succeeded','Failed','Cancelled','TimedOut']) {
  check(`${status} exact terminal proof`, () => assert.equal(flowRunProof([{...row,status}],context)?.status,status));
}
for (const status of ['Running','Waiting','Suspended','Success',null,'']) {
  check(`${status} unknown or active status blocked`, () => assert.equal(flowRunProof([{...row,status}],context),null));
}
for (const rows of [[],null,[row,row]]) check('missing/ambiguous result blocked',()=>assert.equal(flowRunProof(rows,context),null));
check('failed read blocked',()=>assert.equal(flowRunProof([row],{...context,querySucceeded:false}),null));
check('wrong flow blocked',()=>assert.equal(flowRunProof([{...row,workflowid:'4296523e-b120-a914-c9dc-a24d5cd5c348'}],context),null));
check('wrong run blocked',()=>assert.equal(flowRunProof([{...row,name:'other-run'}],context),null));
for (const endtime of [null,'bad','2026-10-10T17:00:00Z','2026-10-10T15:30:00Z','2026-10-10T15:32:00']) {
  check('invalid/unended/future/inverted/local-only end blocked',()=>assert.equal(flowRunProof([{...row,endtime}],context),null));
}
check('unsafe configured run blocked',()=>assert.equal(flowRunProof([row],{...context,runId:"x' or true"}),null));
check('proof redacts payload',()=>assert.deepEqual(Object.keys(flowRunProof([{...row,errormessage:'private'}],context)),['flowId','runId','status','endedAt']));
const job = {State:'Running',AttemptCount:1,LeaseToken:runId,LeaseExpiresAt:'2026-10-10T15:59:00Z'};
check('exact proof and expired lease compose',()=>assert.equal(canClaim(job,context.now,flowRunProof([row],context),flowId),true));
check('missing proof cannot reclaim',()=>assert.equal(canClaim(job,context.now,flowRunProof([],context),flowId),false));
check('unexpired lease remains blocked',()=>assert.equal(canClaim({...job,LeaseExpiresAt:'2026-10-10T16:01:00Z'},context.now,flowRunProof([row],context),flowId),false));
console.log(`${count} flow-run proof checks passed (offline only).`);
