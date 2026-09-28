# Power Automate build specification

All flows live in one solution and use connection references, environment
variables for the site, list names, workbook location, and notification address,
and secure inputs/outputs for the worksheet password.

## CreateOpportunity

1. Power Apps (V2) trigger. Inputs are `requestId` and the 18 business values.
2. Trigger concurrency: on, degree `1`.
3. Get items from `SalesOpportunities` with filter
   `ClientRequestId eq '<escaped requestId>'`, top count `1`.
4. If found, respond with the existing ID, quote, and revision and stop.
5. Get the one `SalesSequence` item whose Title is `MSOL26`.
6. Save `NextNumber` as the reserved integer. Update the sequence item with
   `NextNumber + 1`, using its ETag in `IF-MATCH`.
7. Create the opportunity with `Title=QuoteNo`, `QuoteNo=concat('MSOL26',
   reserved)`, `QuoteSeq=reserved`, `ClientRequestId=requestId`, `Revision=1`, and
   all typed business fields. Set `ExcelRowKey` in a following ETag-conditional
   update to `concat('SP-', item ID)`.
8. Respond to Power Apps immediately with `status=success`.
9. On failure, return `status=error`. Never allocate by querying `Max` from the
   opportunity list. Log an unrecoverable sequence gap and never reuse it.

The unique `ClientRequestId`, `QuoteNo`, and `QuoteSeq` constraints are the final
defense against duplicate creates.

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
     `ClientRequestId`.
4. Treat HTTP `412` as `status=conflict`; otherwise respond success immediately.

## SyncSalesReporting

1. Trigger when an opportunity is created or modified. Trigger concurrency is on,
   degree `1`.
2. Idempotency key is `<OpportunityId>:<Revision>`. If a successful
   `SalesIntegrationLog` row exists, stop.
3. Call `SyncSalesTrackerReporting` with the complete item and the protected
   password as a secure parameter. Set the action retry policy to exponential.
4. Record success or failure in `SalesIntegrationLog`; increment `AttemptCount`
   and retain the correlation ID and sanitized last error.
5. If Revision is `1` and EmailStatus is not already `Succeeded`, send the one
   create notification and mark it succeeded. Never send update emails.
6. Do not write back to a business field merely to mark integration progress;
   that would retrigger the worker. Store worker status only in the log list.

## Required flow tests

- Six parallel create calls return six distinct sequential quote numbers.
- Replaying every request ID returns the same six records.
- Two updates using one revision produce one success and one conflict.
- Simulated Office Script and email failures create retryable log records and do
  not alter the SharePoint success response.
