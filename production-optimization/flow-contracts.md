# Power Automate contracts

## CreateOpportunity

- Trigger: Power Apps (V2); trigger concurrency disabled to retain synchronous responses.
- Input: one text JSON payload `{requestId,fields}`, read through `triggerBody()['text']`.
- Idempotency: first query `ClientRequestId`. If found, return that existing item.
- Reserve `SalesSequence.NextNumber` with an ETag/IF-MATCH conditional MERGE, and create the
  `SalesOpportunities` item with `Revision=1`, `QuoteNo=MSOL26<sequence>`, and
  `ExcelRowKey=APP-<requestId>`.
- A failed reservation must return an error and stop before creating an item.
- Reservation loop exits on success or a non-412 failure; only HTTP 412 retries
  the compare-and-swap. Limit remains 10 attempts / PT1M. The unused post-loop
  `Read Sequence Attempt` action was removed on 7 October.
- Never decrement/reuse a reserved number after an ambiguous create failure.
  Durable request reservation/recovery and concurrent identical-request tests
  remain release requirements; a read-before-create check alone is insufficient.
- Return immediately after SharePoint commit:
  `{status,id,quoteNo,revision,message}`.

## UpdateOpportunity

- Trigger: Power Apps (V2); parallel execution is allowed.
- Inputs: `id`, `expectedRevision`, `requestId`, and all business fields.
- Read the current item and its ETag, including `LastUpdateRequestId`.
- A new write requires a nonblank request ID different from the last update
  receipt and `Revision=expectedRevision`.
- Perform an HTTP conditional update with `IF-MATCH` set to the ETag and increment
  `Revision`, atomically saving `LastUpdateRequestId` in that same body.
  HTTP 412 is returned to the app as a conflict.
- The no-write branch returns `success/Already processed` only when the nonblank
  request ID matches the receipt AND current revision equals expected revision
  plus one. Otherwise return conflict and require reload. This receipt recognizes
  the latest committed update only; historical receipt lookup and payload
  mismatch validation remain pending. Never report it as full ledger idempotency.
- Return `{status,id,quoteNo,revision,message}`.

## SyncSalesReporting

- Trigger: SharePoint item created or modified.
- Concurrency enabled with degree 1 so only one workbook session writes at once.
- The currently bound script is `SyncSalesTrackerReporting_Pilot_20261007`, saved
  with the normal reporting implementation; temporary acceptance harnesses are
  removed immediately after tests. Call it with the complete current item and the worksheet
  password supplied as a secure flow input/connection secret.
- Retry transient failures. The saved correlation key is
  `<OpportunityId>-<Revision>`. Failure rows include the flow run identifier to
  avoid colliding with pre-send/success receipts. A durable automatic recovery
  queue and latest-revision ordering are still required before release.
- Send the existing notification email only when `Revision=1`, request ID is
  present, and it does not start with `MIGRATION:` or `migration-` (case-insensitive); use the same
  idempotency key to prevent duplicate mail. Never automatically resend
  Sending/Unknown email states; resolve them administratively.
- Never change the SharePoint save result because Excel or email fails.
