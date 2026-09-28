# Power Automate contracts

## CreateOpportunity

- Trigger: Power Apps (V2); concurrency enabled with degree 1.
- Inputs: `requestId` plus the 18 business fields defined by the SharePoint schema.
- Idempotency: first query `ClientRequestId`. If found, return that existing item.
- Reserve `SalesSequence.NextNumber`, update the sequence, and create the
  `SalesOpportunities` item with `Revision=1`, `QuoteNo=MSOL26<sequence>`, and
  `ExcelRowKey=SP-<SharePoint item ID>`.
- If creation fails after reservation, restore the sequence only when it still
  equals the reserved number plus one; otherwise log the gap and never reuse a
  potentially issued number.
- Return immediately after SharePoint commit:
  `{status,id,quoteNo,revision,message}`.

## UpdateOpportunity

- Trigger: Power Apps (V2); parallel execution is allowed.
- Inputs: `id`, `expectedRevision`, `requestId`, and all business fields.
- Read the current item and its ETag. If `Revision` differs from
  `expectedRevision`, return `status=conflict` without writing.
- Perform an HTTP conditional update with `IF-MATCH` set to the ETag and increment
  `Revision`. HTTP 412 is returned to the app as a conflict.
- Return `{status,id,quoteNo,revision,message}`.

## SyncSalesReporting

- Trigger: SharePoint item created or modified.
- Concurrency enabled with degree 1 so only one workbook session writes at once.
- Call `SyncSalesTrackerReporting` with the complete current item and the worksheet
  password supplied as a secure flow input/connection secret.
- Retry transient failures. Write the result to `SalesIntegrationLog` using
  `OpportunityId + Revision` as the idempotency key.
- Send the existing notification email only when `Revision=1`; use the same
  idempotency key to prevent duplicate mail.
- Never change the SharePoint save result because Excel or email fails.
