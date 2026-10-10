# Reporting recovery without Dataverse

Status: synthetic-only manual recovery pilot deployed; no-write rejection path
passed. Positive recovery/conflict/interruption tests remain pending. No general
production recovery enabled. See deployment-state.md for exact evidence.
No Dataverse, premium run-history connector, custom connector, trial or purchase.
SharePoint is the operational store; Excel remains the immutable management report.

## Synthetic pilot package

`RecoverSalesReporting_Manual_Pilot_NoEmail_20261010_v2.zip` is the corrected
SharePoint-only manual-trigger pilot. The original unversioned package was
rejected by import validation for duplicate nested Reject action names; do not
deploy it. v2 uses globally unique action names and passes 21 package audits.
Import/run acceptance is recorded separately in deployment-state.md.

The pilot accepts one `RecoveryReviewJson` text input, parsed against a strict
schema. Required fields: itemId (queue ID), expectedAttempt (1–7), expectedEtag,
leaseToken, runUrl, status, endedAt, reviewedAt, reviewedBy and four Boolean
attestations: workerOff, noActiveOrWaitingRuns, otherWorkbookWritersQuiesced,
excelExecutionSettled. Timestamps must be UTC ending in Z. These are operator
statements, NOT automatic verification of run history or writer state.

It can write only queue Title 163-4 for opportunity 163, target revision 4,
Running and expired, with the exact reviewed ETag/attempt/lease. It verifies the
synthetic source stable key, request ID, quote MSOL2614 and source Revision 4,
re-reads the queue and rechecks all gates before a no-retry IF-MATCH MERGE.
It cannot create a queue item or modify source, workbook or email receipts.
Only the owner should execute this administrative pilot; it is not connected to
the team Power App. Do not broaden the identity guard before acceptance.

## Ordinary failures versus interrupted runs

The existing COPY worker already records ordinary unconfirmed Excel outcomes as
Retry, with durable backoff and a maximum of eight worker attempts. Pending/Retry
jobs use a fresh ETag claim. Completed receipts must never be reset.

An interrupted worker may leave Running behind. Time expiry is not evidence that
the previous Excel request stopped. Without an independently verified run-history
reader, Running jobs require administrator review, not automatic reclamation.
Turning a flow Off does not itself cancel pending/running executions.
See [Microsoft flow lifecycle guidance](https://learn.microsoft.com/en-us/power-automate/disable-flow).

## Operator procedure

1. Identify the exact queue item and worker. Read its Title, OpportunityId,
   TargetRevision, State, AttemptCount, LeaseToken, LeaseExpiresAt and exact ETag.
   State must be Running, lease expired in UTC, attempts 1–7. Eight attempts
   require investigation; do not reset counts to bypass the limit.
2. Ensure the writer is Off and every other flow capable of writing this workbook
   is quiesced. Inspect active and waiting runs: Off alone is insufficient.
   Do not blindly resubmit a worker run or change unrelated flows.
3. Open the worker's exact run from LeaseToken. Verify the environment and flow
   GUID, terminal status and completed time. Missing history, Cancelling, Running,
   Waiting or an unknown status must block recovery. Do not open password-bearing
   Run script inputs or export its secure definition.
4. Confirm any workbook-side script/request has settled. A terminal flow summary
   alone does not establish this after a connector timeout or cancellation.
   If completion is uncertain, leave the job blocked and investigate; never
   weaken this check to a fixed delay or assume lease expiry guarantees safety.
5. Record a timestamped reviewer attestation with exact run URL and status/end
   time, and quiescence/Excel checks. Review must be no older than five minutes.
   Store this in an operational audit location, never the management workbook.
6. Re-read the queue item immediately before a conditional write. Require the
   same exact ETag, Running state, LeaseToken, attempt count and Title. POST/MERGE
   using this ETag, never IF-MATCH `*`; disable automatic action retries. A 412
   ends the attempt and requires a new inspection/review, not a blind retry.
7. Only change State to Retry, NextAttemptAt to current UTC, clear LeaseToken and
   LeaseExpiresAt, and write safe LastError code `ManualRecoveryApproved; run=...`.
   Preserve Title, source identity, attempt count, completion and email receipts.
   This transition does not write Excel or send email.
8. Read back the queue item and verify Retry with the unchanged attempt count.
   Enable ONLY the intended serialized writer after checks; it increments the
   next attempt, fetches the latest source and idempotently upserts the stable row.
   Verify final receipt/business values and workbook contract, then return the
   pilot Off. Production enable remains subject to all release acceptance gates.

`manual-reporting-recovery.mjs` generates an offline conditional plan and rejects
changed snapshots. It trusts an operator attestation; it is not an API lookup,
authorization service or deployed flow. Its tests do not establish live recovery.

## Live acceptance still needed

- Use a new isolated synthetic job; never turn completed 163-1/2/3 into Running.
- Confirm unknown/active run evidence performs no write.
- Change queue ETag between review and write; verify conflict produces no recovery.
- Test an interrupted run with confirmed settled Excel execution, one conditional
  transition and one resulting stable-row upsert, without notification email.
- Confirm completed-job replay remains no-op and fixed workbook contract passes.

SharePoint is a [standard connector](https://learn.microsoft.com/en-us/connectors/sharepoint/).
Existing Microsoft 365 and Office Scripts entitlements still require verification;
standard does not mean every account has every required feature at no cost.
