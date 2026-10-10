// Builds a separate synthetic-only import package from the audited enqueue ZIP.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdtemp,readFile,writeFile,mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,dirname,resolve} from 'node:path';
import {randomUUID} from 'node:crypto';
const archive = process.argv[2];
if (!archive) throw new Error('Supply audited enqueue ZIP');
const entries = execFileSync('unzip',['-Z1',archive],{encoding:'utf8'}).trim().split('\n');
const definitionPath = entries.find(p=>/^Microsoft.Flow\/flows\/[^/]+\/definition.json$/.test(p));
const read = p=>JSON.parse(execFileSync('unzip',['-p',archive,p],{encoding:'utf8'}));
const original = read(definitionPath);
assert.equal(original.name,'82499d0a-4068-4be6-9eee-5d1074701e45');
assert.deepEqual(Object.keys(original.properties.connectionReferences),['shared_sharepointonline']);
const flow = structuredClone(original);
const name = 'ReconcileSalesReporting_Pilot_NoEmail_20261010';
const flowId = randomUUID();
flow.name = flowId;
flow.id = `/providers/Microsoft.Flow/flows/${flowId}`;
flow.properties.displayName = name;
const definition = flow.properties.definition;
definition.metadata = {provisioningMethod:'FromDefinition'};
const source = "body('Get_pilot_opportunity')";
const existing = JSON.parse(JSON.stringify(definition.actions).replaceAll('triggerBody()',source));
const site = existing.Create_item.inputs.parameters.dataset;
const sourceList = definition.triggers.When_an_item_is_created_or_modified.inputs.parameters.table;
definition.triggers = {Recurrence:{type:'Recurrence',recurrence:{frequency:'Minute',interval:5,
  startTime:'2040-10-10T00:00:00Z'},runtimeConfiguration:{concurrency:{runs:1}}}};
const host = structuredClone(existing.Create_item.inputs.host);
host.operationId = 'GetItem';
const getSource = {type:'OpenApiConnection',runAfter:{},inputs:{host,
  parameters:{dataset:site,table:sourceList,id:163},authentication:"@parameters('$authentication')"}};
const readExisting = structuredClone(existing.Get_items);
readExisting.runAfter = {};
delete readExisting.metadata;
const verifyExisting = JSON.parse(JSON.stringify(existing.Condition)
  .replaceAll("body('Get_items')","body('Read_existing_job')"));
verifyExisting.else.actions = {Reject_existing_job:verifyExisting.else.actions.Terminate};
verifyExisting.runAfter = {};
// State is a SharePoint choice object. Reject corrupted/unknown receipts.
function addStateCheck(condition, actionName) {
  const expression = condition.expression.equals[0];
  const prefix = "@if(equals(length(body('"+actionName+"')?['value']),1),";
  assert.ok(expression.startsWith(prefix));
  condition.expression.equals[0] = prefix+"and("+expression.slice(prefix.length,-7)
    +",contains(createArray('Pending','Running','Retry','Succeeded','DeadLetter','Superseded'),"
    +"first(body('"+actionName+"')?['value'])?['State']?['Value'])),false)";
}
addStateCheck(verifyExisting,'Read_existing_job');
addStateCheck(existing.Condition,'Get_items');
definition.actions = {
  Get_pilot_opportunity:getSource,
  Pilot_identity_guard:{type:'If',runAfter:{Get_pilot_opportunity:['Succeeded']},
    expression:{equals:["@and(equals("+source+"?['ID'],163),equals("+source+"?['ExcelRowKey'],"
      +"'APP-performance-test-20261007-create-recovery-001'),greaterOrEquals(int(coalesce("+source+"?['Revision'],0)),1))",'@true']},
    actions:{Read_existing_job:readExisting,
      Missing_job:{type:'If',runAfter:{Read_existing_job:['Succeeded']},
        expression:{equals:["@length(body('Read_existing_job')?['value'])",0]},
        actions:existing,else:{actions:{Verify_existing_job:verifyExisting}}}},
    else:{actions:{Reject_source:{type:'Terminate',runAfter:{},inputs:{runStatus:'Failed',
      runError:{code:'PilotIdentityRejected',message:'Only synthetic opportunity 163 is permitted.'}}}}}}
};
// Metadata IDs are exporter/editor hints, not reused execution identities.
function stripMetadata(value) {
  if (!value || typeof value !== 'object') return;
  delete value.metadata;
  for (const child of Object.values(value)) stripMetadata(child);
}
stripMetadata(definition.actions);
const manifest = read('manifest.json');
manifest.details = {displayName:name,description:'Synthetic-only queue reconciliation; no Excel or email.',
  createdTime:new Date().toISOString(),packageTelemetryId:randomUUID(),creator:'N/A',sourceEnvironment:''};
const resource = Object.values(manifest.resources).find(r=>r.type==='Microsoft.Flow/flows');
resource.suggestedCreationType = 'New';
resource.details.displayName = name;
assert.equal(JSON.stringify(definition).includes('triggerBody()'),false);
assert.equal(JSON.stringify(definition).includes('GetOnUpdatedItems'),false);
assert.equal(getSource.inputs.parameters.id,163);
assert.equal(definition.triggers.Recurrence.recurrence.startTime,'2040-10-10T00:00:00Z');
const stage = await mkdtemp(join(tmpdir(),'sales-reconcile-pilot-'));
for (const entry of entries) {
  assert.ok(!entry.startsWith('/') && !entry.split('/').includes('..'));
  await mkdir(dirname(join(stage,entry)),{recursive:true});
  const value = entry===definitionPath ? flow : entry==='manifest.json' ? manifest : read(entry);
  await writeFile(join(stage,entry),JSON.stringify(value));
}
const output = resolve(process.argv[3] || 'production-optimization/ReconcileSalesReporting_Pilot_NoEmail_20261010.zip');
// Refuse to overwrite a previous generated package.
try { await readFile(output); throw new Error('Package already exists'); }
catch(error) { if(error.code!=='ENOENT') throw error; }
execFileSync('zip',['-q',output,...entries],{cwd:stage});
console.log(JSON.stringify({output,flowId,displayName:name,startTime:'2040-10-10T00:00:00Z'}));
