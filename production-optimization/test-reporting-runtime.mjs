import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';

// Execute the actual script against a fault-injectable Excel API double.
// This verifies script logic, not Microsoft's live workbook/protection behavior.
const source = await readFile('production-optimization/office-scripts/SyncSalesTrackerReporting.ts', 'utf8');
const javascript = source.slice(source.indexOf('const BUSINESS_COLUMNS'))
  .replace('workbook: ExcelScript.Workbook, sheetPassword: string,', 'workbook, sheetPassword,')
  .replace('requestJson: string): string', 'requestJson)')
  .replace('JSON.parse(requestJson) as ReportingRequest', 'JSON.parse(requestJson)')
  .replaceAll(': (string | number | boolean)[]', '')
  .replace(': string[]', '')
  .replace('request: ReportingRequest', 'request')
  .replace('cell: ExcelScript.Range, value: string | number | boolean', 'cell, value');
const { main, names } = runInNewContext(`${javascript}\n({main, names: BUSINESS_COLUMNS});`);
const headers = [...names, 'Quote_No', 'Quote_Seq', '__PowerAppsId__', 'Calculated_Total'];
const customer = headers.indexOf('Customer Name');
const calculated = headers.indexOf('Calculated_Total');
const key = headers.indexOf('__PowerAppsId__');
const request = {
  opportunityId: 163, revision: 1, excelRowKey: 'APP-test', quoteNo: 'MSOL2614',
  quoteSeq: 14, excelDateSystem: '1900',
  fields: Object.fromEntries(names.map(name => [name, name === 'Opportunity_date' ? '2026-10-07' : name]))
};
request.fields['Customer Name'] = 'Separate customer';
request.fields.EndUser_Name = 'End user';

function fixture({ rows = 1, propagate = true, fault = '', duplicate = false } = {}) {
  let paused = false, faultUsed = false, writes = 0, resumes = 0;
  const data = Array.from({ length: rows }, (_, i) => headers.map((name, col) => ({
    value: col === key ? (duplicate || i === 0 ? 'APP-test' : `legacy-${i}`) : `old-${name}`,
    formula: col === customer ? '=CUSTOMER_LOOKUP(RC[-1])' : col === calculated ? '=RC[-1]*2' : ''
  })));
  function fail(point) {
    if (fault === point && !faultUsed) { faultUsed = true; throw new Error(`Injected ${point}`); }
  }
  function cell(row, column) {
    return {
      getValue: () => data[row][column].value,
      getFormula: () => data[row][column].formula || data[row][column].value,
      setValue(value) {
        assert.ok(paused, 'writes must occur only inside paused session');
        writes++;
        if (writes === 3) fail('write');
        data[row][column] = { value, formula: '' };
      },
      setFormula(formula) { data[row][column].formula = formula; },
      setFormulaR1C1(formula) { fail('formula'); data[row][column].formula = formula; }
    };
  }
  const protection = {
    getProtected: () => true, getCanPauseProtection: () => true,
    getIsPaused: () => paused, checkPassword: password => password === 'test-only',
    pauseProtection() { fail('pause'); paused = true; },
    resumeProtection() { paused = false; resumes++; }
  };
  const table = {
    getWorksheet: () => ({ getName: () => 'Master Sheet', getProtection: () => protection }),
    getHeaderRowRange: () => ({ getTexts: () => [headers] }),
    getRowCount: () => data.length,
    getRangeBetweenHeaderAndTotal: () => ({
      getFormulasR1C1: () => data.map(row => row.map(c => c.formula || c.value)),
      getColumn: col => ({ getTexts: () => data.map(row => [String(row[col].value)]) }),
      getRow: row => ({ getCell: (_, col) => cell(row, col),
        getFormulasR1C1: () => [data[row].map(c => c.formula || c.value)] })
    }),
    addRow() {
      fail('add');
      data.push(headers.map((_, col) => ({ value: '', formula:
        propagate && data.length ? data[data.length - 1][col].formula : '' })));
    },
    deleteRowsAt(row, count) { fail('rollback'); data.splice(row, count); }
  };
  return { data, protection, workbook: { getTable: () => table },
    state: () => ({ paused, writes, resumes }),
    run: (input = request, password = 'test-only') => JSON.parse(main({ getTable: () => table }, password, JSON.stringify(input))) };
}

let checks = 0;
function check(label, fn) { fn(); checks++; console.log(`PASS ${label}`); }
check('existing-row upsert preserves formulas and manual customer override', () => {
  const f = fixture(); f.data[0][customer] = { value: 'Management correction', formula: '' };
  const result = f.run();
  assert.equal(result.inserted, false); assert.equal(result.manualCustomerUpdateRequired, true);
  assert.equal(f.data[0][customer].value, 'Management correction');
  assert.equal(f.data[0][calculated].formula, '=RC[-1]*2');
  assert.equal(f.state().paused, false);
});
check('identical replay does not append rows', () => {
  const f = fixture({ rows: 0 }); assert.equal(f.run().inserted, true);
  assert.equal(f.run().inserted, false); assert.equal(f.data.length, 1);
});
check('formula fallback restores calculated columns when Excel does not propagate', () => {
  const f = fixture({ propagate: false }); f.run({ ...request, excelRowKey: 'new-key' });
  assert.equal(f.data[1][customer].formula, '=CUSTOMER_LOOKUP(RC[-1])');
  assert.equal(f.data[1][calculated].formula, '=RC[-1]*2');
});
check('new row inherits customer formula even when preceding row has a manual exception', () => {
  const f = fixture({ rows: 2, propagate: false });
  f.data[1][customer] = { value: 'Management exception', formula: '' };
  f.run({ ...request, excelRowKey: 'new-key' });
  assert.equal(f.data[2][customer].formula, '=CUSTOMER_LOOKUP(RC[-1])');
  assert.equal(f.data[1][customer].value, 'Management exception');
});
check('existing-row write failure restores original business cells and protection', () => {
  const f = fixture({ fault: 'write' }), before = structuredClone(f.data);
  assert.throws(() => f.run(), /sync failed/); assert.deepEqual(f.data, before);
  assert.equal(f.state().paused, false); assert.equal(f.state().resumes, 1);
});
for (const fault of ['write', 'formula', 'add', 'pause']) check(`insert failure at ${fault} leaves no extra row or paused protection`, () => {
  const f = fixture({ fault, propagate: false }), before = structuredClone(f.data);
  assert.throws(() => f.run({ ...request, excelRowKey: 'new-key' }));
  assert.deepEqual(f.data, before); assert.equal(f.state().paused, false);
});
check('duplicate stable keys fail before any write', () => {
  const f = fixture({ rows: 2, duplicate: true }); assert.throws(() => f.run(), /Duplicate stable/);
  assert.equal(f.state().writes, 0); assert.equal(f.state().resumes, 0);
});
check('wrong protection password fails before any write', () => {
  const f = fixture(); assert.throws(() => f.run(request, 'invalid-test-only'), /password check/);
  assert.equal(f.state().writes, 0); assert.equal(f.state().paused, false);
});
check('calculated input guard fails before any write', () => {
  const f = fixture(); f.data[0][headers.indexOf('Project_Name')].formula = '=1';
  assert.throws(() => f.run(), /input column contains a formula/); assert.equal(f.state().writes, 0);
});
check('blank dates and formula-like input remain literal', () => {
  const f = fixture(); f.run({ ...request, fields: { ...request.fields, Opportunity_date: null, Project_Name: '=BAD()' } });
  assert.equal(f.data[0][0].value, ''); assert.equal(f.data[0][1].value, "'=BAD()");
});
check('date system offset and case-insensitive customer comparison', () => {
  const f = fixture(); const result = f.run({ ...request, excelDateSystem: '1904', fields: {
    ...request.fields, 'Customer Name': ' END USER ' } });
  assert.equal(f.data[0][0].value, Date.parse('2026-10-07') / 86400000 + 24107);
  assert.equal(result.manualCustomerUpdateRequired, false);
});
console.log(JSON.stringify({ status: 'pass', checks, scope: 'actual script with mock Excel API; live failure acceptance still required' }));
