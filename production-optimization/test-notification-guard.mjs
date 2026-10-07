import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// Offline model of the deployed condition, not a Power Automate runtime test.
// The flow's int() rejects malformed revisions; this model rejects them too.
function shouldNotify(row) {
  const revision = row.Revision ?? 0;
  if (!/^-?\d+$/.test(String(revision))) throw new Error('Invalid revision');
  return Number(revision) === 1 &&
    row.ClientRequestId != null && row.ClientRequestId !== '' &&
    !/^MIGRATION[:-]/i.test(String(row.ClientRequestId));
}

const migration = JSON.parse(await readFile(new URL(
  './migration/sales-opportunities.json', import.meta.url), 'utf8'));
assert.equal(migration.records.length, 152);
for (const row of migration.records) {
  assert.match(row.ClientRequestId, /^MIGRATION:/i);
  assert.equal(shouldNotify(row), false);
}

const cases = [
  [{ Revision: 1, ClientRequestId: 'new-request-id' }, true],
  [{ Revision: '1', ClientRequestId: 'new-request-id' }, true],
  [{ Revision: 2, ClientRequestId: 'new-request-id' }, false],
  [{ Revision: 1, ClientRequestId: 'MIGRATION:legacy-id' }, false],
  [{ Revision: 1, ClientRequestId: 'migration:legacy-id' }, false],
  [{ Revision: 1, ClientRequestId: 'migration-legacy-id' }, false],
  [{ Revision: 1, ClientRequestId: 'MIGRATION-legacy-id' }, false],
  [{ Revision: 1, ClientRequestId: '' }, false],
  [{ Revision: 1, ClientRequestId: null }, false],
  [{ Revision: 1 }, false],
  [{ ClientRequestId: 'new-request-id' }, false]
];
for (const [row, expected] of cases) assert.equal(shouldNotify(row), expected);
assert.throws(() => shouldNotify({ Revision: 'invalid', ClientRequestId: 'id' }));

console.log(JSON.stringify({
  status: 'pass', scope: 'offline notification predicate only',
  migrationRecordsSuppressed: migration.records.length,
  scenarioChecks: cases.length + 1,
  liveFlowRuns: 0
}, null, 2));
