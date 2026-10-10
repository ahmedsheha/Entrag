# Reporting enqueue pilot — 9 October 2026

## Follow-up — 10 October 2026

New-revision creation and exact-event replay passed for synthetic item 163 at
Revision 2. The queue now contains `163-1` unchanged Succeeded and exactly one
new `163-2` Pending/AttemptCount 0. The pilot is Off again. See
`reporting-acceptance-2026-10-10.md` for run IDs, safeguards and limitations.
The acceptance gaps below are historical where superseded by this follow-up.

## Latest acceptance checkpoint: completed-job replay passed

At 16:55 Cairo the fresh synthetic event produced successful run
`08584100527814732389539525721CU06`. Trigger succeeded, Create_item failed with
HTTP 400 specifically because unique Title already existed, Get_items succeeded,
and Condition evaluated True. The flow reported success (about 1 second).

Resubmitted that exact trigger payload and observed a second successful run
`08584100525350168451995794408CU03`, again with duplicate creation rejected,
Get_items succeeded and Condition True. This proves completed-job duplicate
receipt handling for the designated synthetic item; it does not prove new-job
creation, all-source production delivery, interrupted-run recovery, or performance
acceptance. Earlier no-run observations below are historical, not current status.

After both executions, switched this pilot Off and verified Status Off. Final
SharePoint queue read showed exactly one unchanged row: `163-1`, OpportunityId
163, TargetRevision 1, AttemptCount 2, CompletedRevision 1, State Succeeded.
There were no Excel/email actions in the tested flow. Production sync was not
enabled and no workbook action was performed during these tests.

Saved flow: `EnqueueSalesReporting_Pilot_NoEmail_20261009`

Flow ID: `82499d0a-4068-4be6-9eee-5d1074701e45`

Environment: `Default-98bc05b5-7079-429e-8fd8-86d53f3d9fda`.

## Implemented configuration

- SharePoint created/modified trigger on InsideSalesTeam / SalesOpportunities.
- Trigger condition restricts execution to opportunity 163, stable ExcelRowKey
  `APP-performance-test-20261007-create-recovery-001`, and Revision >= 1.
- Create SalesReportingQueue item with unique Title `<ID>-<Revision>`, numeric
  OpportunityId / TargetRevision, AttemptCount 0, State Pending. Retry policy None.
- Get items queries exactly that Title, Top Count 2, after creation succeeds,
  fails, or times out. It does not update or reset existing queue items.
- Boolean condition checks exactly one matching Title / OpportunityId /
  TargetRevision. False terminates Failed with code QueueNotConfirmed and a
  generic non-sensitive message.
- No Excel actions, no email actions, no modifications to business records.

Observed Flow checker: Errors 0, Warnings 0 before save. Observed save message:
"Your flow is ready to go. We recommend you test it." This is configuration
validation, NOT live acceptance. Later live replay evidence is recorded above.

## Acceptance still required

Verified the saved pilot is Off. Queue read before testing showed exactly one
row: `163-1`, OpportunityId 163, TargetRevision 1, AttemptCount 2,
CompletedRevision 1, State Succeeded, with no lease/error values.

Completed-job duplicate-event replay and final queue invariance passed as
recorded above. Test a new synthetic revision and
an unavailable queue. Do not reset/delete completed jobs merely to obtain a test.

Production enqueue requires reconciliation for missed trigger events and explicit
exclusion of synthetic opportunities, without suppressing legacy Excel sync.
Production reporting remains Off and the app remains unpublished.

### Controlled event attempt — not passed

Temporarily enabled only this gated pilot. Changed only the synthetic item 163
Title to `MSOL2614 — TEST ONLY reporting pilot — enqueue replay 20261009 B`;
the stable identifier and business Revision remained unchanged. The first
attempt stopped before the polling interval. Read-only inspection of persisted
trigger code showed correct site/list GUID and recurrence every **5 minutes**.
Repeated the label-only event and monitored through a full interval; run history
still showed no recorded runs. This does not verify duplicate handling and is
an open trigger-delivery diagnosis, not an accepted test.

Switched the pilot back Off and observed Status Off. No Excel/email actions
were invoked. No business quote numbers or values were changed. A 5-minute
polling delay also needs resolution/acceptance before near-real-time rollout.

Final queue read confirmed exactly one unchanged `163-1` row: OpportunityId
163, TargetRevision 1, AttemptCount 2, CompletedRevision 1, State Succeeded.

## Export audit — 9 October 2026 follow-up

Downloaded the full saved package:
`/Users/sheha/Downloads/EnqueueReportingPilot_Audit_20261009_20261009134612.zip`

SHA-256: `a55abb773910c250b0a8c2c88db54487b3269bfbd1b8d51428f1bfbeb15f97ef`.

Read its definition.json and verified the exact flow ID, SharePoint site and
list GUIDs, five-minute recurrence, splitOn array, full synthetic-only trigger
condition, queue keys/types/defaults, None retry policy, Get_items runAfter
Succeeded/Failed/TimedOut, Top Count 2, and Boolean verification condition.

**Peek code omitted the trigger conditions, but the full export contains them.**
Do not conclude they were absent or remove the restriction based on Peek code.
No restriction repair was required. This confirms configuration, not delivery.

`test-enqueue-export.mjs` passes 14 checks against this exact ZIP, auditing the
persisted configuration rather than relying on the designer's current draft.

Guided Test while Off said the flow must be enabled. Temporarily enabled the
audited synthetic-only pilot; guided Test then reported "This flow cannot be
triggered for testing." No manual test execution was available through that UI.

All runs > Failed checks showed no failed checks. All runs > Checks (no new
data) revealed Skipped polls at 15:54, 15:58, 16:03, and 16:48 Cairo time. Thus
polling is occurring; ordinary run history alone hid these checks. The skipped
check details did not expose input/output bodies. No root cause is proven yet.

After the observed poll, changed only synthetic item 163 Title to
`MSOL2614 — TEST ONLY reporting pilot — enqueue replay 20261009 C`, leaving
Revision 1 and its exact stable identifier unchanged, for a fresh event test.

## Interrupted-run safety (not deployed)

An expired lease alone is not evidence that an Office Script call has stopped.
Automatic recovery must verify the exact prior LeaseToken/run is terminal before
ETag-conditional reclamation. A deployed run-status lookup has not been verified;
do not claim that automatic interrupted-job recovery is complete.

Offline policy now requires proof containing both the exact LeaseToken/runId
and the configured worker flowId, rather than accepting a bare terminal status.
39 offline checks pass, including wrong-run/wrong-worker/no-proof rejection.

Microsoft's documented Dataverse FlowRun route applies to solution cloud flows
and requires owner read access and retained run metadata. Missing metadata is
not proof that a run stopped. These prerequisites have not been verified in
this tenant, and no new permission/license has been configured:
https://learn.microsoft.com/en-us/power-automate/dataverse/cloud-flow-run-metadata
