// Read-only audit of the saved no-email pilot export, not live acceptance.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const archive = process.argv[2];
if (!archive) throw new Error('Supply the saved pilot export ZIP path');
const entries = execFileSync('unzip', ['-Z1', archive], {encoding:'utf8'})
  .trim().split('\n').filter(name => /^Microsoft\.Flow\/flows\/[^/]+\/definition\.json$/.test(name));
assert.equal(entries.length,1);
const flow = JSON.parse(execFileSync('unzip',['-p',archive,entries[0]],{encoding:'utf8'}));
const definition = flow.properties.definition;
const trigger = definition.triggers.When_an_item_is_created_or_modified;
const actions = definition.actions;
let checks = 0;
function check(name, test) { test(); checks++; console.log(`PASS ${name}`); }
const site = 'https://entrag.sharepoint.com/sites/InsideSalesTeam';
const opportunities = '111359ec-dcc4-495e-9922-77d4518b5093';
const queue = '7e7792f9-8896-4e92-b1c6-3e2391140edc';
const key = "concat(string(triggerBody()?['ID']),'-',string(triggerBody()?['Revision']))";
const guard = "@and(equals(triggerBody()?['ID'],163),equals(triggerBody()?['ExcelRowKey'],'APP-performance-test-20261007-create-recovery-001'),greaterOrEquals(int(coalesce(triggerBody()?['Revision'],0)),1))";
check('correct saved pilot',()=>assert.equal(flow.name,'82499d0a-4068-4be6-9eee-5d1074701e45'));
check('SharePoint trigger and exact source',()=>{
  assert.equal(trigger.inputs.host.operationId,'GetOnUpdatedItems');
  assert.equal(trigger.inputs.parameters.dataset,site);
  assert.equal(trigger.inputs.parameters.table,opportunities);
});
check('persisted synthetic-only restriction',()=>assert.deepEqual(trigger.conditions,[{expression:guard}]));
check('split-on and observed five-minute polling',()=>{
  assert.equal(trigger.splitOn,"@triggerOutputs()?['body/value']");
  assert.deepEqual(trigger.recurrence,{frequency:'Minute',interval:5});
});
const create = actions.Create_item.inputs;
check('unique per-revision key and queue location',()=>{
  assert.equal(create.parameters.dataset,site);
  assert.equal(create.parameters.table,queue);
  assert.equal(create.parameters['item/Title'],'@'+key);
});
check('typed queue fields',()=>{
  assert.equal(create.parameters['item/OpportunityId'],"@int(triggerBody()?['ID'])");
  assert.equal(create.parameters['item/TargetRevision'],"@int(triggerBody()?['Revision'])");
});
check('pending zero-attempt job only',()=>{
  assert.equal(create.parameters['item/AttemptCount'],0);
  assert.equal(create.parameters['item/State/Value'],'Pending');
  assert.equal(Object.keys(create.parameters).length,7);
});
check('single create attempt',()=>assert.deepEqual(create.retryPolicy,{type:'none'}));
check('verify after success failure or timeout',()=>assert.deepEqual(actions.Get_items.runAfter,{Create_item:['Succeeded','Failed','TimedOut']}));
check('exact queue lookup with duplicate detection',()=>{
  const params=actions.Get_items.inputs.parameters;
  assert.equal(params.dataset,site);
  assert.equal(params.table,queue);
  assert.equal(params.$filter,"Title eq '@{"+key+"}'");
  assert.equal(params.$top,2);
});
check('Boolean verification of count and all identity fields',()=>{
  const expected="@if(equals(length(body('Get_items')?['value']),1),and(equals(first(body('Get_items')?['value'])?['Title'],"+key+"),equals(int(first(body('Get_items')?['value'])?['OpportunityId']),int(triggerBody()?['ID'])),equals(int(first(body('Get_items')?['value'])?['TargetRevision']),int(triggerBody()?['Revision']))),false)";
  assert.deepEqual(actions.Condition.expression,{equals:[expected,'@true']});
});
check('completed jobs never reset',()=>assert.deepEqual(actions.Condition.actions,{}));
check('failed verification fails closed',()=>{
  const fail=actions.Condition.else.actions.Terminate.inputs;
  assert.equal(fail.runStatus,'Failed');
  assert.equal(fail.runError.code,'QueueNotConfirmed');
});
check('no Excel email or source-update actions',()=>{
  assert.deepEqual(Object.keys(actions).sort(),['Condition','Create_item','Get_items']);
  assert.deepEqual(Object.keys(flow.properties.connectionReferences),['shared_sharepointonline']);
  assert.equal(create.host.operationId,'PostItem');
  assert.equal(actions.Get_items.inputs.host.operationId,'GetItems');
});
console.log(`${checks} saved-export checks passed; trigger delivery and duplicate execution are not established by this audit.`);
