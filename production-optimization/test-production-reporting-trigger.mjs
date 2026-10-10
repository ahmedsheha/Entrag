import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { eligibleForLiveReport, eligibleForProductionQueue, knownFixtureIds }
  from './production-reporting-trigger.mjs';

const migration = JSON.parse(await readFile(new URL(
  './migration/sales-opportunities.json', import.meta.url), 'utf8'));
assert.equal(migration.records.length, 152);
for (const row of migration.records) assert.equal(eligibleForLiveReport(row), true);
const real = { ClientRequestId: 'real-request', ExcelRowKey: 'APP-real-request',
  ProjectName: 'Real project', Title: 'MSOL2615' };
const cases = [
  [real, true],
  [{ ...real, ClientRequestId: 'performance-test-20261007-create-recovery-001' }, false],
  [{ ...real, ClientRequestId: 'PERFORMANCE-TEST-other' }, false],
  [{ ...real, ProjectName: 'test only — fixture' }, false],
  [{ ...real, Title: 'MSOL2614 — TEST ONLY reporting pilot' }, false],
  [{ ...real, ClientRequestId: '' }, false],
  [{ ...real, ClientRequestId: null }, false],
  [{ ...real, ExcelRowKey: '' }, false],
  [{ ...real, ExcelRowKey: null }, false],
  [{}, false],
  [{ ...real, Title: null, ProjectName: null }, true]
];
for (const [row, expected] of cases) assert.equal(eligibleForLiveReport(row), expected);
const queueSource = { ...real, ID: 170, Revision: 1 };
assert.equal(eligibleForProductionQueue(queueSource), true);
for (const ID of knownFixtureIds) {
  assert.equal(eligibleForProductionQueue({ ...queueSource, ID }), false);
}
for (const fields of [{ ID: 0 }, { ID: '170' }, { Revision: 0 },
  { Revision: '1' }, { ExcelRowKey: 'APP-performance-test-renamed' }]) {
  assert.equal(eligibleForProductionQueue({ ...queueSource, ...fields }), false);
}
console.log(JSON.stringify({ status: 'pass', migrationRowsEligible: 152,
  scenarioChecks: cases.length, queueChecks: 14,
  scope: 'offline trigger eligibility only' }));
