// Synthetic-only SharePoint recovery package; operator attestation, no API proof.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdtemp,readFile,writeFile,mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,dirname,resolve} from 'node:path';
import {randomUUID,createHash} from 'node:crypto';
const archive=process.argv[2];
assert.ok(archive,'Supply audited enqueue ZIP');
const entries=execFileSync('unzip',['-Z1',archive],{encoding:'utf8'}).trim().split('\n');
const read=p=>JSON.parse(execFileSync('unzip',['-p',archive,p],{encoding:'utf8'}));
const path=entries.find(p=>/^Microsoft.Flow\/flows\/[^/]+\/definition.json$/.test(p));
const flow=read(path);
assert.equal(flow.name,'82499d0a-4068-4be6-9eee-5d1074701e45');
assert.deepEqual(Object.keys(flow.properties.connectionReferences),['shared_sharepointonline']);
const name='RecoverSalesReporting_Manual_Pilot_NoEmail_20261010';
const id=randomUUID(); flow.name=id; flow.id=`/providers/Microsoft.Flow/flows/${id}`;
flow.properties.displayName=name;
const d=flow.properties.definition;
d.metadata={provisioningMethod:'FromDefinition'};
const site=d.actions.Create_item.inputs.parameters.dataset;
const queue=d.actions.Create_item.inputs.parameters.table;
const source=d.triggers.When_an_item_is_created_or_modified.inputs.parameters.table;
const worker='5998de92-8e3a-47a2-b434-a71a9f4f1829';
const env='Default-98bc05b5-7079-429e-8fd8-86d53f3d9fda';
const prop={};
for(const k of ['expectedEtag','leaseToken','runUrl','status','endedAt','reviewedAt','reviewedBy']) prop[k]={type:'string',minLength:1};
prop.itemId={type:'integer',minimum:1};
prop.expectedAttempt={type:'integer',minimum:1,maximum:7};
for(const k of ['workerOff','noActiveOrWaitingRuns','otherWorkbookWritersQuiesced','excelExecutionSettled']) prop[k]={type:'boolean'};
const schema={type:'object',additionalProperties:false,properties:prop,required:Object.keys(prop)};
d.triggers={manual:{type:'Request',kind:'Button',inputs:{schema:{type:'object',properties:{text:{title:'RecoveryReviewJson',type:'string','x-ms-content-hint':'TEXT','x-ms-dynamically-added':true}},required:['text']}}}};
const auth="@parameters('$authentication')";
const host=operationId=>({apiId:'/providers/Microsoft.PowerApps/apis/shared_sharepointonline',connectionName:'shared_sharepointonline',operationId});
const http=(method,uri,headers,body,runAfter={})=>({type:'OpenApiConnection',runAfter,inputs:{host:host('HttpRequest'),parameters:{dataset:site,'parameters/method':method,'parameters/uri':uri,'parameters/headers':headers,...(body?{'parameters/body':body}:{})},retryPolicy:{type:'none'},authentication:auth}});
const fail=(code,message)=>({type:'Terminate',runAfter:{},inputs:{runStatus:'Failed',runError:{code,message}}});
const condition=(expression,actions,runAfter,code)=>({type:'If',expression:{equals:[expression,'@true']},actions,runAfter,else:{actions:{[`Reject_${code}`]:fail(code,'Recovery not authorized; no reporting write. Inspect this exact queue item and run.')}}});
const p="body('Parse_review')";
const q="body('Read_queue')?['d']";
const s="body('Get_source')";
const f="body('Fresh_queue')?['d']";
const endpoint=`@concat('_api/web/lists(guid''${queue}'')/items(',string(${p}?['itemId']),')')`;
const headers={Accept:'application/json;odata=verbose'};
const inputGuard=`@and(contains(createArray('Succeeded','Failed','Cancelled','TimedOut'),${p}?['status']),equals(${p}?['runUrl'],concat('https://make.powerautomate.com/environments/${env}/flows/${worker}/runs/',${p}?['leaseToken'])),lessOrEquals(length(${p}?['leaseToken']),100),not(contains(${p}?['leaseToken'],'/')),not(contains(${p}?['leaseToken'],'?')),not(contains(${p}?['leaseToken'],'#')),not(contains(${p}?['leaseToken'],decodeUriComponent('%0A'))),not(contains(${p}?['leaseToken'],decodeUriComponent('%0D'))),not(equals(${p}?['expectedEtag'],'*')),endsWith(${p}?['endedAt'],'Z'),endsWith(${p}?['reviewedAt'],'Z'),lessOrEquals(ticks(${p}?['endedAt']),ticks(${p}?['reviewedAt'])),lessOrEquals(ticks(${p}?['reviewedAt']),ticks(utcNow())),greaterOrEquals(ticks(${p}?['reviewedAt']),ticks(addMinutes(utcNow(),-5))),greater(length(trim(${p}?['reviewedBy'])),0),lessOrEquals(length(${p}?['reviewedBy']),128),${p}?['workerOff'],${p}?['noActiveOrWaitingRuns'],${p}?['otherWorkbookWritersQuiesced'],${p}?['excelExecutionSettled'])`;
const identity=(row)=>`equals(${row}?['Title'],'163-4'),equals(${row}?['OpportunityId'],163),equals(${row}?['TargetRevision'],4),equals(${row}?['State'],'Running'),equals(${row}?['AttemptCount'],${p}?['expectedAttempt']),equals(${row}?['LeaseToken'],${p}?['leaseToken']),not(empty(${row}?['LeaseExpiresAt'])),lessOrEquals(ticks(${row}?['LeaseExpiresAt']),ticks(utcNow())),equals(${row}?['__metadata']?['etag'],${p}?['expectedEtag'])`;
const patch=`@string(setProperty(setProperty(setProperty(setProperty(setProperty(json('{}'),'State','Retry'),'NextAttemptAt',utcNow()),'LeaseToken',null),'LeaseExpiresAt',null),'LastError',concat('ManualRecoveryApproved; run=',${p}?['leaseToken'])))`;
const patchHeaders={Accept:'application/json;odata=verbose','Content-Type':'application/json;odata=nometadata','IF-MATCH':`@${f}?['__metadata']?['etag']`,'X-HTTP-Method':'MERGE'};
const readback="body('Verify_queue')?['d']";
const verify=condition(`@and(equals(${readback}?['Title'],'163-4'),equals(${readback}?['OpportunityId'],163),equals(${readback}?['TargetRevision'],4),equals(${readback}?['State'],'Retry'),equals(${readback}?['AttemptCount'],${p}?['expectedAttempt']),empty(${readback}?['LeaseToken']),empty(${readback}?['LeaseExpiresAt']),equals(${readback}?['CompletedRevision'],${q}?['CompletedRevision']))`,{
  Recovery_receipt:{type:'Compose',runAfter:{},inputs:`@setProperty(setProperty(setProperty(setProperty(setProperty(json('{}'),'status','RecoveryQueued'),'queueId',${p}?['itemId']),'runUrl',${p}?['runUrl']),'reviewedBy',${p}?['reviewedBy']),'reviewedAt',${p}?['reviewedAt'])`}
},{Verify_queue:['Succeeded']},'RecoveryReadbackFailed');
const commit=condition(`@and(${identity(f)},equals(${f}?['CompletedRevision'],${q}?['CompletedRevision']),greaterOrEquals(ticks(${p}?['reviewedAt']),ticks(addMinutes(utcNow(),-5))))`,{
  Conditional_retry:http('POST',endpoint,patchHeaders,patch),
  Verify_queue:http('GET',endpoint,headers,null,{Conditional_retry:['Succeeded']}),
  Verify_result:verify
},{Fresh_queue:['Succeeded']},'QueueSnapshotChanged');
const getSource={type:'OpenApiConnection',runAfter:{},inputs:{host:host('GetItem'),parameters:{dataset:site,table:source,id:163},authentication:auth}};
const sourceGuard=condition(`@and(equals(${s}?['ID'],163),equals(${s}?['ExcelRowKey'],'APP-performance-test-20261007-create-recovery-001'),equals(${s}?['ClientRequestId'],'performance-test-20261007-create-recovery-001'),equals(${s}?['QuoteNo'],'MSOL2614'),equals(${s}?['Revision'],4))`,{
  Fresh_queue:http('GET',endpoint,headers), Confirm_fresh_snapshot:commit
},{Get_source:['Succeeded']},'PilotSourceRejected');
const jobGuard=condition(`@and(${identity(q)})`,{Get_source:getSource,Confirm_source:sourceGuard},{Read_queue:['Succeeded']},'PilotJobRejected');
d.actions={
  Parse_review:{type:'ParseJson',runAfter:{},inputs:{content:"@json(triggerBody()?['text'])",schema}},
  Confirm_review:condition(inputGuard,{Read_queue:http('GET',endpoint,headers),Confirm_job:jobGuard},{Parse_review:['Succeeded']},'ReviewRejected')
};
const json=JSON.stringify(d);
assert.equal(json.includes('shared_commondataservice'),false);
assert.equal(json.includes('shared_excel'),false);
assert.equal(json.includes('shared_office365'),false);
assert.equal(json.includes('PostItem'),false);
assert.equal(json.includes('Recurrence'),false);
assert.equal(d.actions.Confirm_review.actions.Confirm_job.actions.Get_source.inputs.parameters.id,163);
assert.equal(patchHeaders['IF-MATCH'],`@${f}?['__metadata']?['etag']`);
assert.equal(json.includes('CompletedRevision\":'),false); // read comparisons only, never a patch
const manifest=read('manifest.json');
manifest.details={displayName:name,description:'Operator-reviewed recovery ONLY for synthetic queue 163-4. SharePoint only; no Excel/email.',createdTime:new Date().toISOString(),packageTelemetryId:randomUUID(),creator:'N/A',sourceEnvironment:''};
const resource=Object.values(manifest.resources).find(r=>r.type==='Microsoft.Flow/flows');
resource.suggestedCreationType='New'; resource.details.displayName=name;
const stage=await mkdtemp(join(tmpdir(),'sales-manual-recovery-'));
for(const entry of entries){
  assert.ok(!entry.startsWith('/')&&!entry.split('/').includes('..'));
  await mkdir(dirname(join(stage,entry)),{recursive:true});
  await writeFile(join(stage,entry),JSON.stringify(entry===path?flow:entry==='manifest.json'?manifest:read(entry)));
}
const output=resolve(process.argv[3]||`production-optimization/${name}.zip`);
try{await readFile(output);throw new Error('Package already exists');}catch(e){if(e.code!=='ENOENT')throw e;}
execFileSync('zip',['-q',output,...entries],{cwd:stage});
console.log(JSON.stringify({output,flowId:id,displayName:name,sha256:createHash('sha256').update(await readFile(output)).digest('hex')}));
