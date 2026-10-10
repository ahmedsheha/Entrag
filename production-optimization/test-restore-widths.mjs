import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
const baseline = JSON.parse(await readFile('production-optimization/baselines/management-workbook-baseline.json', 'utf8'));
const source = await readFile('production-optimization/office-scripts/RestoreApprovedReportingWidths.ts', 'utf8');
const runtime = source.replace('workbook: ExcelScript.Workbook, sheetPassword: string): string', 'workbook, sheetPassword)')
  .replace('const specs: [string, string, number, string, number, number][]', 'const specs');
const main = runInNewContext(runtime + '\nmain;', { console: { log() {} } });
const changed = { SalesTracker: [2,6,18,19,25,26,30,34,35], Table3:[1], Table4:[0], Table5:[0], Table11:[0], Table12:[1], Table14:[1] };
function fixture(options={}) {
  let writes=0, paused=false, resumes=0, failure=false;
  const widths = new Map();
  for (const t of baseline.tables) widths.set(t.name, t.columnWidths.map((w,i)=>
    options.already || !changed[t.name]?.includes(i) ? w : w-(t.name==='SalesTracker'||t.name==='Table11'?0.75:1.5)));
  const before = structuredClone([...widths]);
  const protection={getProtected:()=>true,getIsPaused:()=>paused,getCanPauseProtection:()=>true,
    checkPassword:()=>!options.badPassword,pauseProtection:()=>{paused=true;},resumeProtection:()=>{paused=false;resumes++;}};
  const workbook={getWorksheets:()=>baseline.sheetNames.map(name=>({getName:()=>options.badStructure&&name==='Lists'?'Other':name})),
    getWorksheet:name=>({getProtection:()=>name==='Master Sheet'?protection:{getProtected:()=>false,getIsPaused:()=>false}}),
    getTable:name=>{
      const t=baseline.tables.find(t=>t.name===name);
      return {getWorksheet:()=>({getName:()=>t.worksheet}),getHeaderRowRange:()=>({getTexts:()=>[options.badHeader?t.headers.map(()=>'?'):t.headers]}),
        getColumns:()=>t.headers.map((_,i)=>({getRange:()=>({getFormat:()=>({getColumnWidth:()=>options.badWidth?999:widths.get(name)[i],
          setColumnWidth:w=>{writes++;if(options.failWrite&&!failure&&writes===4){failure=true;throw Error('write failed');}widths.get(name)[i]=w;}})})}))};}};
  return {workbook,widths,before,state:()=>({writes,paused,resumes})};
}
let checks=0;
function check(fn){fn();checks++;}
check(()=>{const f=fixture();const r=JSON.parse(main(f.workbook,'test-only'));assert.equal(r.changed,15);assert.equal(f.state().paused,false);assert.equal(f.state().resumes,1);for(const t of baseline.tables)assert.deepEqual(f.widths.get(t.name),t.columnWidths);});
check(()=>{const f=fixture({already:true});assert.equal(JSON.parse(main(f.workbook,'test-only')).changed,0);assert.equal(f.state().writes,0);});
for(const option of ['badPassword','badStructure','badHeader','badWidth'])check(()=>{const f=fixture({[option]:true});assert.throws(()=>main(f.workbook,'test-only'));assert.equal(f.state().writes,0);assert.equal(f.state().paused,false);});
check(()=>{const f=fixture({failWrite:true});assert.throws(()=>main(f.workbook,'test-only'));assert.deepEqual([...f.widths],f.before);assert.equal(f.state().paused,false);assert.equal(f.state().resumes,1);});
check(()=>{for(const t of baseline.tables)assert.equal(changed[t.name]?.length||0,t.name==='SalesTracker'?9:changed[t.name]?1:0);assert.equal(Object.values(changed).flat().length,15);assert.ok(!source.includes('setValues('));assert.ok(!source.includes('setFormulas('));assert.ok(!source.includes('.unprotect('));});
console.log(JSON.stringify({status:'pass',checks,scope:'offline width repair mock only; no live workbook changed'}));
