# Power Automate build specification

Target deployment configuration uses a solution, connection references and
environment variables. Actual saved-flow state and remaining release gates are
recorded in `deployment-state.md`; do not treat this specification as evidence
that every target has been implemented. Keep worksheet-password inputs/outputs
secure and production reporting Off until acceptance passes.

## CreateOpportunity

1. Power Apps (V2) trigger. One text JSON input contains `{requestId,fields}`.
2. Trigger concurrency: off (required for synchronous Power Apps responses).
   Atomic number allocation uses SharePoint ETag compare-and-swap, not trigger serialization.
3. Get items from `SalesOpportunities` with filter
   `ClientRequestId eq '<escaped requestId>'`, top count `1`.
4. If found, respond with the existing ID, quote, and revision and stop.
5. Get the one `SalesSequence` item whose Title is `MSOL26`.
6. Save `NextNumber` as the reserved integer. Update the sequence item with
   `NextNumber + 1`, using its ETag in `IF-MATCH`.
7. Create the opportunity with `Title=QuoteNo`, `QuoteNo=concat('MSOL26',
   reserved)`, `QuoteSeq=reserved`, `ClientRequestId=requestId`, `Revision=1`, and
   all typed business fields. Set `ExcelRowKey=concat('APP-', requestId)` in the
   same create body, so the reporting trigger cannot receive a committed item
   without its stable identifier.
8. Respond to Power Apps immediately with `status=success`.
9. On failure, return `status=error`. Never allocate by querying `Max` from the
   opportunity list. Log an unrecoverable sequence gap and never reuse it.

`ClientRequestId`, `ExcelRowKey` and populated `QuoteSeq` have unique constraints.
Legacy QuoteNo duplicates must be preserved; new QuoteNo values come from the
sequence reservation. Concurrent identical-request reservation recovery still
requires acceptance; uniqueness alone does not make sequence gaps impossible.

## UpdateOpportunity

1. Power Apps (V2) trigger. Inputs include `id`, `expectedRevision`, `requestId`,
   and all business values.
2. Get item plus ETag. If stored Revision does not equal `expectedRevision`,
   respond `status=conflict` without updating.
3. Send an HTTP request to SharePoint:
   - method `POST`
   - URI `_api/web/lists/getbytitle('SalesOpportunities')/items(<id>)`
   - headers `IF-MATCH: <ETag>`, `X-HTTP-Method: MERGE`, and
     `Content-Type: application/json;odata=nometadata`
   - body contains only approved business fields, `Revision + 1`, and the new
   `LastUpdateRequestId`. Never overwrite the original create ClientRequestId.
4. Treat HTTP `412` as `status=conflict`; otherwise respond success immediately.

## SyncSalesReporting

1. Trigger when an opportunity is created or modified. Trigger concurrency is on,
   degree `1`.
2. The currently saved correlation key is `<OpportunityId>-<Revision>`. If a successful
   `SalesIntegrationLog` row exists, stop.
3. The saved flow binds `SyncSalesTrackerReporting_Pilot_20261007` (the tested
   normal reporting implementation, not a temporary acceptance harness). Call it
   with the complete item and the protected
   password as a secure parameter. Set the action retry policy to exponential.
4. Record success or failure in `SalesIntegrationLog`; increment `AttemptCount`
   and retain the correlation ID and sanitized last error.
5. Send create notifications only for Revision 1 and a nonblank, non-migration
   create request ID. Record a pre-send receipt. Email states Sending/Unknown
   require administrative resolution; do not automatically resend them merely
   because they are not Succeeded. Never send update or migration emails.
6. Do not write back to a business field merely to mark integration progress;
   that would retrigger the worker. Store worker status only in the log list.

### Recovery still required before release

The saved worker has bounded exponential Excel action retries, not a durable
retry queue. Existing incomplete pre-send receipts stop with
`ReportingRecoveryRequired` to prevent uncertain email delivery being resent.
Failure logs have run-specific keys; the normal lookup checks the base key only.
Do not claim these logs alone provide automatic recovery after retry exhaustion.

Before release, implement and test durable Excel work records, a single
serialized writer, latest-revision ordering and bounded scheduled backoff.
Separate Excel retry decisions from create-email receipts. Email Sending/Unknown
must remain held for administration; Excel replay must not resend a notification.
Use the latest SharePoint business record rather than trusting stale queued
event data, and never modify business fields merely to trigger retry processing.

## Required flow tests

- Six parallel create calls return six distinct sequential quote numbers.
- Replaying every request ID returns the same six records.
- Two updates using one revision produce one success and one conflict.
- Simulated Office Script and email failures create retryable log records and do
  not alter the SharePoint success response.
