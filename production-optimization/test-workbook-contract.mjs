import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
const source = await readFile('production-optimization/office-scripts/CompareWorkbookContract.ts', 'utf8');
const runtime = source.slice(source.indexOf('function compare('))
  .replace('path: string, expected: unknown, actual: unknown,', 'path, expected, actual,')
  .replace('differences: Difference[]', 'differences')
  .replaceAll(' as { [key: string]: unknown }', '')
  .replaceAll(': unknown[]', '')
  .replace('value: unknown): string', 'value)');
const compare = runInNewContext(`${runtime}\ncompare;`);
function differences(expected, actual) {
  const result = []; compare('$', expected, actual, result); return result;
}
let checks = 0;
function check(fn) { fn(); checks++; }
const baseline = JSON.parse(await readFile('production-optimization/baselines/management-workbook-baseline.json', 'utf8'));
const clone = value => structuredClone(value);
check(() => assert.equal(differences(baseline, clone(baseline)).length, 0));
check(() => {
  const actual = clone(baseline); actual.sheets[2].pivotTables.reverse();
  assert.equal(differences(baseline, actual).length, 0);
  assert.deepEqual(baseline.sheets[2].pivotTables, ['90%', 'Weight by Period', '75%']);
});
check(() => {
  const actual = clone(baseline); actual.sheets[2].pivotTables[0] = 'Renamed pivot';
  assert.ok(differences(baseline, actual).length > 0);
});
check(() => {
  const actual = clone(baseline); actual.sheets[2].pivotTables.pop();
  assert.ok(differences(baseline, actual).length > 0);
});
check(() => {
  const actual = clone(baseline); actual.sheets[2].pivotTables[0] = '75%';
  assert.ok(differences(baseline, actual).length > 0);
});
for (const mutate of [
  value => value.sheetNames.reverse(),
  value => value.sheets.reverse(),
  value => value.tables[0].headers.reverse(),
  value => { value.tables[0].formulaPatterns[9] = ['=1']; },
  value => { value.tables[0].numberFormatPatterns[0] = ['General']; },
  value => { value.sheets[0].protected = false; },
  value => { value.sheets[0].protectionPaused = true; },
  value => { value.sheets[0].print.orientation = 'Landscape'; },
  value => { value.sheets[1].charts[0].type = 'Pie'; },
  value => { value.names[0].formula = '=1'; }
]) check(() => {
  const actual = clone(baseline); mutate(actual);
  assert.ok(differences(baseline, actual).length > 0);
});
console.log(JSON.stringify({status: 'pass', checks,
  scope: 'contract comparator only; pivot-name inventory order canonicalized, not layout acceptance'}));
