import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';

// Unit-test the actual validator. This is not an Excel/protection integration test.
const source = await readFile('production-optimization/office-scripts/SyncSalesTrackerReporting.ts', 'utf8');
const columns = source.match(/const BUSINESS_COLUMNS = \[[\s\S]*?\];/)[0];
const validator = source.slice(source.indexOf('function validateRequest('), source.indexOf('\nfunction setLiteral('))
  .replace('request: ReportingRequest', 'request');
const validate = runInNewContext(`${columns}\n${validator}\nvalidateRequest;`);
const names = runInNewContext(`${columns}\nBUSINESS_COLUMNS;`);
const valid = {
  opportunityId: 154, revision: 3, excelRowKey: 'APP-test', quoteNo: 'MSOL265',
  quoteSeq: 5, excelDateSystem: '1900',
  fields: Object.fromEntries(names.map(name => [name, name === 'Opportunity_date' ? '2026-10-06' : '']))
};
let checks = 0;
function accepts(request) { assert.doesNotThrow(() => validate(request)); checks++; }
function rejects(request) { assert.throws(() => validate(request)); checks++; }
accepts(valid);
for (const date of [null, '', 46200, '2026-10-06T00:00:00Z']) {
  accepts({...valid, quoteSeq: null, fields: {...valid.fields, Opportunity_date: date}});
}
for (const quoteSeq of [0, -1, 1.5, '5', undefined]) rejects({...valid, quoteSeq});
for (const date of [true, {}, 'not-a-date', 'October 6, 2026', Infinity]) {
  rejects({...valid, fields: {...valid.fields, Opportunity_date: date}});
}
for (const value of [undefined, {}, [], NaN, Infinity]) {
  rejects({...valid, fields: {...valid.fields, Project_Name: value}});
}
rejects({...valid, excelRowKey: ' '});
const missing = {...valid.fields}; delete missing['Customer Name'];
rejects({...valid, fields: missing});
assert.ok(!source.includes('quotes.findIndex') && !source.includes('const quoteColumn'));
assert.ok(source.includes('matches.length > 1'));
assert.ok(source.includes('inserted && rowAdded'));
assert.ok(source.includes('Refusing to replace a formula'));
assert.ok(source.includes('finally') && source.includes('protection.resumeProtection()'));
checks += 5;
assert.ok(source.includes('const INPUT_COLUMNS = BUSINESS_COLUMNS.filter(name => name !== "Customer Name")'));
assert.ok(source.includes('const values = INPUT_COLUMNS.map'));
assert.ok(source.includes('const names = INPUT_COLUMNS.concat'));
assert.ok(source.includes('manualCustomerUpdateRequired'));
checks += 4;
console.log(JSON.stringify({status: 'pass', checks, scope: 'request-validator runtime and source guards only; live Excel acceptance pending'}));
