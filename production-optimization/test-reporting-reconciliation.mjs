import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {reconciliationDecision as decide, advanceScanPage as page} from './reporting-reconciliation-policy.mjs';
let checks = 0;
function check(name, fn) { fn(); checks++; console.log(`PASS ${name}`); }
const source = {ID:153,Revision:2,ExcelRowKey:'APP-real-001',ClientRequestId:'real-001'};
const receipt = {Title:'153-2',OpportunityId:153,TargetRevision:2,AttemptCount:5};
check('missing latest job creates exact revision', () => assert.deepEqual(decide(source,[]).job,
  {Title:'153-2',OpportunityId:153,TargetRevision:2,State:'Pending',AttemptCount:0}));
for (const State of ['Pending','Running','Retry','Succeeded','DeadLetter','Superseded']) {
  check(`${State} preserved without mutation`, () => {
    const row = Object.freeze({...receipt,State});
    assert.equal(decide(source,[row]).action,'Preserve');
    assert.equal(row.AttemptCount,5);
  });
}
check('duplicate receipts block', () => assert.throws(() => decide(source,[receipt,receipt])));
check('wrong revision receipt blocks', () => assert.throws(() => decide(source,[{...receipt,State:'Pending',TargetRevision:1}])));
check('unknown state blocks', () => assert.throws(() => decide(source,[{...receipt,State:'Other'}])));
check('failed queue read is not absence', () => assert.throws(() => decide(source,null)));
check('missing stable key blocks', () => assert.throws(() => decide({...source,ExcelRowKey:''},[])));
check('invalid revision blocks', () => assert.throws(() => decide({...source,Revision:0},[])));
check('known fixture excluded from production', () => assert.equal(decide({...source,ID:163},[]).action,'Excluded'));
check('synthetic key excluded even under another ID', () => assert.equal(decide({...source,ExcelRowKey:'APP-performance-test-other'},[]).action,'Excluded'));
check('test project label excluded independently of key', () => assert.equal(decide({...source,ProjectName:'TEST ONLY renamed fixture'},[]).action,'Excluded'));
check('test title excluded independently of key', () => assert.equal(decide({...source,Title:'MSOL2620 — TEST ONLY'},[]).action,'Excluded'));
const pilot = {...source,ID:163,ExcelRowKey:'APP-performance-test-20261007-create-recovery-001'};
check('exact pilot permitted but email suppressed', () => assert.equal(decide(pilot,[],'pilot163').notification,'Suppressed'));
check('pilot does not admit real records', () => assert.equal(decide(source,[],'pilot163').action,'Excluded'));
check('missed create eligibility remains separate', () => assert.equal(decide({...source,Revision:5},[]).notification,'SeparateCreateReceiptRequired'));
check('empty scan ends safely', () => assert.equal(page([],0,10000,200).done,true));
check('scan advances beyond app row limit', () => assert.deepEqual(page([{ID:2001},{ID:5001}],2000,5001,200),{afterId:5001,done:true}));
check('short page does not skip higher IDs', () => assert.equal(page([{ID:5}],0,100,200).done,false));
for (const rows of [[{ID:3},{ID:2}],[{ID:2},{ID:2}],[{ID:101}]]) {
  check('invalid scan page blocks', () => assert.throws(() => page(rows,0,100,200)));
}
check('cursor regression blocks', () => assert.throws(() => page([{ID:2}],2,100,200)));
const migration = JSON.parse(await readFile(new URL('./migration/sales-opportunities.json',import.meta.url),'utf8'));
check('all prepared legacy records suppress notifications', () => {
  assert.equal(migration.records.length,152);
  migration.records.forEach((row,i) => assert.equal(decide({...row,ID:i+1,Revision:1},[]).notification,'Suppressed'));
});
console.log(`${checks} reconciliation policy checks passed (offline; not deployed).`);
