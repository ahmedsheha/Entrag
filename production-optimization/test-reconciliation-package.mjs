import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const archive = process.argv[2];
if (!archive) throw new Error('Supply pilot package ZIP');
const paths = execFileSync('unzip',['-Z1',archive],{encoding:'utf8'}).trim().split('\n');
const flow = JSON.parse(execFileSync('unzip',['-p',archive,paths.find(p=>p.endsWith('/definition.json'))],{encoding:'utf8'}));
const d = flow.properties.definition;
let checks = 0;
function check(name,fn) { fn(); checks++; console.log(`PASS ${name}`); }
const guarded = d.actions.Pilot_identity_guard;
const missing = guarded.actions.Missing_job;
check('separate pilot name',()=>assert.equal(flow.properties.displayName,'ReconcileSalesReporting_Pilot_NoEmail_20261010'));
check('no unsupported export state property',()=>assert.equal(Object.hasOwn(flow.properties,'state'),false));
check('future recurrence, serialized',()=>{
  assert.equal(d.triggers.Recurrence.type,'Recurrence');
  assert.equal(d.triggers.Recurrence.recurrence.startTime,'2040-10-10T00:00:00Z');
  assert.equal(d.triggers.Recurrence.runtimeConfiguration.concurrency.runs,1);
});
check('only source 163 read',()=>assert.deepEqual(d.actions.Get_pilot_opportunity.inputs.parameters,
  {dataset:'https://entrag.sharepoint.com/sites/InsideSalesTeam',table:'111359ec-dcc4-495e-9922-77d4518b5093',id:163}));
check('source identity guarded before queue access',()=>{
  assert.deepEqual(guarded.runAfter,{Get_pilot_opportunity:['Succeeded']});
  assert.ok(guarded.expression.equals[0].includes("equals(body('Get_pilot_opportunity')?['ID'],163)"));
  assert.ok(guarded.expression.equals[0].includes('APP-performance-test-20261007-create-recovery-001'));
  assert.ok(guarded.expression.equals[0].includes("greaterOrEquals(int(coalesce(body('Get_pilot_opportunity')?['Revision'],0)),1)"));
});
check('read latest key with duplicate detection',()=>{
  const p=guarded.actions.Read_existing_job.inputs.parameters;
  assert.equal(p.table,'7e7792f9-8896-4e92-b1c6-3e2391140edc');
  assert.equal(p.$top,2);
  assert.equal(p.$filter,"Title eq '@{concat(string(body('Get_pilot_opportunity')?['ID']),'-',string(body('Get_pilot_opportunity')?['Revision']))}'");
});
check('create only after successful empty read',()=>{
  assert.deepEqual(missing.runAfter,{Read_existing_job:['Succeeded']});
  assert.deepEqual(missing.expression,{equals:["@length(body('Read_existing_job')?['value'])",0]});
});
check('queue initial state exact',()=>{
  const p=missing.actions.Create_item.inputs.parameters;
  assert.equal(p['item/AttemptCount'],0); assert.equal(p['item/State/Value'],'Pending');
  assert.equal(Object.keys(p).length,7);
});
check('single create, verified on all outcomes',()=>{
  assert.deepEqual(missing.actions.Create_item.inputs.retryPolicy,{type:'none'});
  assert.deepEqual(missing.actions.Get_items.runAfter,{Create_item:['Succeeded','Failed','TimedOut']});
});
check('both read-back conditions verify identities and valid state',()=>{
  for (const [c,n] of [[missing.actions.Condition,'Get_items'],[missing.else.actions.Verify_existing_job,'Read_existing_job']]) {
    const e=c.expression.equals[0];
    for(const term of ['length(',"?['Title']","?['OpportunityId']","?['TargetRevision']","?['State']?['Value']",'DeadLetter','Superseded']) assert.ok(e.includes(term),term);
    assert.ok(e.includes(`body('${n}')`));
    assert.deepEqual(c.actions,{});
    assert.equal(Object.values(c.else.actions)[0].inputs.runStatus,'Failed');
  }
});
check('no event-body dependence',()=>assert.equal(JSON.stringify(d).includes('triggerBody()'),false));
check('all action types remain supported after action-key rename',()=>{
  function visit(actions) {
    for(const a of Object.values(actions)) {
      assert.ok(['If','OpenApiConnection','Terminate'].includes(a.type),a.type);
      if(a.actions) visit(a.actions);
      if(a.else?.actions) visit(a.else.actions);
    }
  }
  visit(d.actions);
});
check('SharePoint read and queue-create operations only',()=>{
  const ops=[];
  function visit(v) { if(!v||typeof v!=='object')return; if(v.inputs?.host?.operationId) ops.push(v.inputs.host.operationId); for(const child of Object.values(v))visit(child); }
  visit(d);
  assert.deepEqual(ops.sort(),['GetItem','GetItems','GetItems','PostItem']);
  assert.deepEqual(Object.keys(flow.properties.connectionReferences),['shared_sharepointonline']);
});
const manifest=JSON.parse(execFileSync('unzip',['-p',archive,'manifest.json'],{encoding:'utf8'}));
check('import must create new not overwrite',()=>assert.equal(Object.values(manifest.resources).find(r=>r.type==='Microsoft.Flow/flows').suggestedCreationType,'New'));
console.log(`${checks} package audit checks passed; import/save/live replay remain required.`);
