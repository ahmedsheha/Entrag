# Missed-update reconciliation — isolated pilot deployed

Reference implementation: `reporting-reconciliation-policy.mjs`.
Regression suite: `node production-optimization/test-reporting-reconciliation.mjs`.
26 checks passed on 10 October 2026. These are offline tests, not live acceptance.

The separate synthetic-only `ReconcileSalesReporting_Pilot_NoEmail_20261010`
flow was imported on 10 October (ID `6584b40f-bfcd-4b31-b929-667e2cc96dc4`).
Manual completed-job replay `08584100048317492025223131698CU08` succeeded:
existing receipt verified, queue creation skipped, both completed rows unchanged
on independent SharePoint read. Pilot returned to Off. It accepts only source
163 and its exact stable key; no Excel or email actions. Missing-job creation
passed on synthetic revision 3: run `08584100041781888027680261266CU00`
created/read-back verified one Pending job; replay
`08584100041450753355687018443CU25` preserved it with creation skipped.
Independent queue read showed exactly three receipts, older completed jobs
unchanged and `163-3` Pending/AttemptCount 0. Pilot again Off; worker never ran.
This is direct synthetic-revision coverage, not app-update acceptance.
The paginated production contract below remains staged,
and interrupted-Running-job recovery remains undeployed.

## Enqueue-only flow contract

Build a separate scheduled reconciler with concurrency 1. It must have no Excel,
Office Script or email actions. All writes are new queue jobs, never updates to
existing jobs. Start with the exact synthetic-163 pilot guard before generalizing.

1. Capture the highest existing opportunity ID (ID descending, Top 1). An empty
   successful response means an empty sweep; failed reads must fail the sweep.
2. Set cursor 0. Read bounded pages using indexed `ID gt cursor and ID le upperId`,
   ID ascending, Top 200. Select only ID, Revision, ExcelRowKey, ClientRequestId.
   Validate strictly ascending IDs and bounds. Do not assume a short page is the
   end; continue until an empty successful page or reaching upperId.
3. Production excludes IDs 154–160 and 163, performance-test request IDs and
   APP-performance-test stable keys. Do not exclude legitimate records merely
   because a project name contains TEST. Pilot accepts ONLY ID 163 with exact key
   `APP-performance-test-20261007-create-recovery-001`.
4. Read each eligible opportunity again before deriving the latest job key,
   `ID-Revision`. Require positive integer Revision and stable nonblank identities.
   A source deletion is logged/skipped; permission/connector failure is an error,
   never proof that a source or queue job is missing.
5. Query queue Title equal to that key, Top 2. Exactly one matching Title,
   OpportunityId, TargetRevision and valid State means preserve unchanged.
   Running, Succeeded, Superseded and DeadLetter are NOT reset or recreated.
   Multiple/mismatched/unknown receipts block that record and alert administration.
6. Only a successful empty read permits Create item: Title, OpportunityId,
   TargetRevision, Pending, AttemptCount 0. Use the existing unique Title index.
   After create success, failure or timeout, read/verify exactly one matching job,
   just as the audited enqueue pilot does. Do not ignore every HTTP 400/409 as a
   duplicate: read-back identity must prove the result. Unverified result fails.
7. Advance the cursor only after record handling has a confirmed outcome. Persist
   safe IDs/error codes, not sensitive connector payloads. An interrupted sweep
   may restart from 0: unique queue keys make replay safe.
8. Each new sweep starts at 0 with a fresh upper bound. Do not retain Modified as
   a permanent watermark: edits to older IDs or missed trigger intervals would
   otherwise disappear. Updates during a sweep are caught by the fresh per-item
   read or the next complete sweep. Do not collect the full list in the app.

## Notifications and Excel

Reconciliation never sends notifications. Migration requests beginning
`MIGRATION:` or `MIGRATION-` remain suppressed for every revision. A missed create
at a later revision still needs independent original-create eligibility and a
durable unique email receipt; latest revision >1 alone must not lose or grant
that eligibility. Do not enable production notification until that receipt path
is implemented. This reference's notification annotation is not a proposed new
Excel column and is not part of the existing queue schema.

The serialized worker remains the only Excel writer. Reconciliation does not
change the fixed workbook format or reset the reporting-copy baseline.

## Required live acceptance

- Miss a synthetic event while enqueue is Off; reconcile creates exactly one
  latest-revision job. Replay preserves attempt/completion/lease/error fields.
- Reconcile the already-completed revision 2 without resetting it.
- Fail the queue read/create/read-back independently; failures must not claim
  successful delivery or delete/reset existing receipts.
- Test more than 2,000 opportunities across pages and edit a low ID between
  sweeps. Confirm it is found by the next sweep.
- Prove legacy and fixture exclusions and no email/Excel actions in export.
- Run the guarded COPY worker, verify business values and unchanged contract.

Automatic interrupted-run recovery is separate. It still requires a verified
terminal status for the exact worker/run plus expired lease and a fresh ETag
update. A reconciler must never reclaim Running jobs.
