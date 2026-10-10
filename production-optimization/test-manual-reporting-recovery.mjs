import assert from 'node:assert/strict';
import {manualRecoveryPlan, sameRecoverySnapshot} from './manual-reporting-recovery.mjs';
const config = {environmentId:'98bc05b5-7079-429e-8fd8-86d53f3d9fda',
  workerFlowId:'5998de92-8e3a-47a2-b434-a71a9f4f1829', queueListId:'7e7792f9-8896-4e92-b1c6-3e2391140edc'};
// Synthetic fixtures only: no actual queue receipt is modified by these tests.
const job = {ID:999, Title:'163-4', OpportunityId:163, TargetRevision:4,
  State:'Running', AttemptCount:1, ETag:'"7"', LeaseToken:'synthetic-interruption-001',
  LeaseExpiresAt:'2026-10-10T08:00:00Z'};
const now = '2026-10-10T09:00:00Z';
const evidence = {flowId:config.workerFlowId, runId:job.LeaseToken, status:'Failed',
  runUrl:`https://make.powerautomate.com/environments/Default-${config.environmentId}/flows/${config.workerFlowId}/runs/${job.LeaseToken}`,
  endedAt:'2026-10-10T08:50:00Z', reviewedAt:'2026-10-10T08:59:00Z', reviewedBy:'Test reviewer',
  workerOff:true, noActiveOrWaitingRuns:true, otherWorkbookWritersQuiesced:true, excelExecutionSettled:true};
let count = 0;
function check(name, fn) { fn(); count++; console.log(`PASS ${name}`); }
const plan = () => manualRecoveryPlan(job, evidence, config, now);
const denied = (j=job, e=evidence, c=config, n=now) => assert.equal(manualRecoveryPlan(j,e,c,n).action,'ReviewRequired');
check('reviewed terminal run produces conditional plan, not a write', () => {
  assert.equal(plan().action,'ConditionalRetry');
  assert.equal(plan().expected.etag,'"7"');
  assert.equal(plan().patch.State,'Retry');
  assert.equal(plan().patch.LeaseToken,null);
  assert.equal('AttemptCount' in plan().patch,false);
  assert.equal('CompletedRevision' in plan().patch,false);
  assert.equal(job.State,'Running');
});
for (const status of ['Succeeded','Failed','Cancelled','TimedOut']) check(`known terminal ${status}`, () =>
  assert.equal(manualRecoveryPlan(job,{...evidence,status},config,now).action,'ConditionalRetry'));
for (const status of ['Running','Waiting','Cancelling','Unknown','Success',null]) check(`nonterminal/unknown ${status} denied`, () => denied(job,{...evidence,status}));
for (const flag of ['workerOff','noActiveOrWaitingRuns','otherWorkbookWritersQuiesced','excelExecutionSettled'])
  check(`missing ${flag} denied`, () => denied(job,{...evidence,[flag]:false}));
for (const State of ['Pending','Retry','Succeeded','DeadLetter','Superseded']) check(`${State} receipt preserved`, () => denied({...job,State}));
for (const AttemptCount of [0,8,9,-1,1.5,'1']) check(`attempt ${AttemptCount} denied`, () => denied({...job,AttemptCount}));
for (const ETag of ['*',null,'7','"7"\r\nIf-Match: *']) check(`unsafe ETag ${ETag} denied`, () => denied({...job,ETag}));
check('weak exact ETag accepted', () => assert.equal(manualRecoveryPlan({...job,ETag:'W/"7"'},evidence,config,now).action,'ConditionalRetry'));
check('different run ID denied', () => denied(job,{...evidence,runId:'other'}));
check('different flow denied', () => denied(job,{...evidence,flowId:config.queueListId}));
check('different exact URL denied', () => denied(job,{...evidence,runUrl:evidence.runUrl+'-other'}));
check('missing reviewer denied', () => denied(job,{...evidence,reviewedBy:''}));
check('stale review denied', () => denied(job,{...evidence,reviewedAt:'2026-10-10T08:51:00Z'}));
check('future review denied', () => denied(job,{...evidence,reviewedAt:'2026-10-10T09:01:00Z'}));
check('end later than review denied', () => denied(job,{...evidence,endedAt:now}));
check('local ambiguous timestamp denied', () => denied(job,{...evidence,endedAt:'2026-10-10T08:50:00'}));
check('unexpired lease denied', () => denied({...job,LeaseExpiresAt:'2026-10-10T10:00:00Z'}));
check('wrong title denied', () => denied({...job,Title:'163-3'}));
check('missing evidence denied', () => denied(job,null));
check('bad configuration denied', () => denied(job,evidence,{...config,workerFlowId:'bad'}));
check('fresh unchanged snapshot accepted', () => assert.equal(sameRecoverySnapshot(job,plan()),true));
for (const [field,value] of [['ID',1000],['ETag','"8"'],['State','Succeeded'],['LeaseToken','other'],['AttemptCount',2],['Title','163-3']])
  check(`changed ${field} blocks dispatch`, () => assert.equal(sameRecoverySnapshot({...job,[field]:value},plan()),false));
check('unknown plan blocks dispatch', () => assert.equal(sameRecoverySnapshot(job,{action:'ReviewRequired'}),false));
console.log(`${count} manual recovery checks passed (offline only).`);
