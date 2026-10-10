# Reporting acceptance — 10 October 2026

## Result: synthetic new-revision enqueue and replay passed

Final live queue read showed exactly two jobs, with no duplicates or resets:

| Title | OpportunityId | TargetRevision | AttemptCount | CompletedRevision | State |
| --- | --- | --- | --- | --- | --- |
| 163-1 | 163 | 1 | 2 | 1 | Succeeded |
| 163-2 | 163 | 2 | 0 | blank | Pending |

Lease, retry-time and error fields were blank. The enqueue pilot was switched
Off and Status Off verified. The Excel worker and production reporting were
verified Off before testing and were never enabled. No workbook write or email
was performed. Leave the pending revision-2 job for a later controlled COPY
worker test; do not reset the completed revision-1 job.

This proves new-job creation and exact-payload replay for the isolated synthetic
record only. It does not establish production delivery, app Update acceptance,
interrupted-run recovery, queue-outage handling or performance acceptance.

## Scope and safeguards

Continue only against synthetic opportunity 163, quote MSOL2614, stable key
`APP-performance-test-20261007-create-recovery-001`. Do not reimport the 152
legacy records, publish the app, enable production reporting, or send emails.
The new-revision enqueue test does not require any Excel write.

## Current observations

- SharePoint item 163 was read live: Revision 1, exact stable key above;
  Title `MSOL2614 — TEST ONLY reporting pilot — enqueue replay 20261009 C`.
- Worker `5998de92-8e3a-47a2-b434-a71a9f4f1829` was read live: Status Off.
- Production `SyncSalesReporting`, flow
  `0c4fc75e-f756-4110-85b1-e6be8c8bd81c`, was read live: Status Off.
- Re-ran the saved enqueue package audit: 14 checks passed.
- Re-ran the reference recovery policy: 39 checks passed. These are offline
  tests, not evidence of deployed interrupted-run recovery.
- Enabled only enqueue pilot `82499d0a-4068-4be6-9eee-5d1074701e45`;
  observed Status On. It contains no Excel/email actions and is restricted to
  synthetic item 163 and the exact stable key. Must switch Off after the test.
- Live pre-test queue read: exactly one `163-1` job, OpportunityId 163,
  TargetRevision 1, AttemptCount 2, CompletedRevision 1, State Succeeded,
  blank lease/error fields.
- Changed ONLY synthetic item 163 Revision from 1 to 2 using its SharePoint
  field editor. Observed Revision 2 and disappearance of the Saving indicator.
  This is an enqueue-only test; UpdateOpportunity/app update coverage is not
  established by this direct metadata edit. Do not roll Revision back to 1.
- Trigger history showed a skipped poll at 05:14 Cairo. After this observed poll,
  reloaded item 163 and verified Revision 2 persisted, then changed only its Title
  to `MSOL2614 — TEST ONLY reporting pilot — revision 2 enqueue 20261010` to
  generate a clearly labelled fresh post-poll event. This does not prove why
  the earlier poll was skipped or fix the five-minute delivery delay.
- Run history now shows a successful new run at 05:17 Cairo, duration 411 ms,
  `08584100082109973678351807747CU29`. Live action details show trigger,
  Create item and Get items Succeeded, and Condition result True. Resubmitted
  this exact run payload using the native confirmation.
- Exact replay `08584100080660400535660510657CU03` succeeded at 05:20 Cairo.
  Create item was rejected with HTTP 400 explicitly for duplicate Title `163-2`;
  Get items succeeded and Condition result was True. Replay duration 617 ms.
- Switched the enqueue pilot Off and observed saved Status Off. Final live queue
  invariants passed as recorded above.

## Executed new-revision test procedure

1. Verify production reporting Off and worker pilot Off, then read the queue.
2. Enable only the audited, synthetic-only enqueue pilot.
3. Advance synthetic item 163 to Revision 2, preferably through UpdateOpportunity
   with expectedRevision 1. If direct SharePoint revision editing is used, label
   this as enqueue-only coverage, not UpdateOpportunity acceptance.
4. Observe exactly one new `163-2` job with OpportunityId 163, TargetRevision 2,
   State Pending and AttemptCount 0. Existing `163-1` must remain Succeeded,
   AttemptCount 2 and CompletedRevision 1.
5. Replay the exact event; neither job may be duplicated or reset.
6. Switch the enqueue pilot Off and verify the saved status. Leave Revision 2
   in place and the new Pending job for the later reporting-COPY worker test.

## Interrupted-run recovery remains unimplemented

Do not reclaim a Running job based on lease expiry alone. Recovery requires
verified terminal status for the exact lease run and worker, followed by a fresh
ETag-conditional update. Missing metadata must leave the job unreclaimed.

## Reporting-COPY revision-2 worker test — sync and captured contract passed

Read the queue before execution: `163-2` was still Pending/AttemptCount 0;
`163-1` unchanged Succeeded/AttemptCount 2/CompletedRevision 1. Worker details
showed Off before temporary activation. Temporarily enabled only the guarded
no-email worker, then resubmitted its prior recurrence run through the native
confirmation. No script card, password field or secure action payload was
opened. Must verify the new run, switch the worker Off, read final queue state
and run the unchanged workbook contract comparison before declaring success.

New worker run `08584100078210717914290151572CU03` started at 05:24:24 Cairo
and reported Succeeded in 15 seconds. Overall success alone is not proof of an
Excel commit because this worker handles failures. Switched the pilot Off and
verified Status Off. Independent final SharePoint queue read confirmed exactly
two jobs:

| Title | OpportunityId | TargetRevision | AttemptCount | CompletedRevision | State |
| --- | --- | --- | --- | --- | --- |
| 163-1 | 163 | 1 | 2 | 1 | Succeeded |
| 163-2 | 163 | 2 | 1 | 2 | Succeeded |

Lease, retry-time and error fields were blank. Revision 1 remained unchanged;
revision 2 was classified as synchronized on its first attempt. No email was
sent. The worker is Off again. The earlier Pending checkpoint above describes
the enqueue phase, not current queue state.

Started the existing read-only CompareWorkbookContract against COPY sourcedoc
`2eb994dd-a0cb-4cc5-a3b4-ede017bf0977`. Supplied the unchanged approved baseline
(10,099 characters; FNV-1a 1,754,044,479). Post-write comparison output still
was verified in the editor's Output panel after a second read-only run (the
details view showed only an execution banner):

```json
{"status":"pass","differenceCount":0,"differences":[]}
```

Neither comparison script nor baseline was edited. This proves the captured
structural contract stayed unchanged after this isolated revision-2 upsert,
including its captured protection state. It does not prove full visual/report
refresh acceptance, all business-value reconciliation, production delivery or
six-user performance. The Manual Refresh Required banner was visible; Refresh
All was not clicked. Production and both pilots remain Off, and the app remains
unpublished. Next work: interrupted-run recovery with a reliable exact-run proof
source and reconciliation of missed reporting events before production rollout.
