# Deployment state

## Live resources created

- SharePoint site: `https://entrag.sharepoint.com/sites/InsideSalesTeam`
- `SalesOpportunities` list ID:
  `111359ec-dcc4-495e-9922-77d4518b5093`
- `SalesOpportunities` contains every field in `sharepoint-schema.md`.
- Active indexes: ClientRequestId, ExcelRowKey, Modified, OpportunityDate,
  POReference, ProjectName, QuoteNo, QuoteSeq, and Revision.
- Empty support lists created: SalesSequence, SalesCustomers, SalesOptions, and
  SalesIntegrationLog.
- SalesSequence has required whole-number `NextNumber` and required whole-number
  `Revision` (default 1). It is deliberately not seeded before migration.

## Deliberately not changed

- The published canvas app still uses its existing Excel connection.
- The management workbook has not been edited, unprotected, or structurally
  changed.
- No flow has sent an email.
- No records have been migrated or deleted.
- No production cutover has occurred.

## Required before cutover

1. Complete support-list columns from `sharepoint-schema.md`.
2. Completed: the workbook contract was captured, validated, and stored in
   `baselines/management-workbook-baseline.json`. The unchanged pilot workbook
   returned `status=pass`, `differenceCount=0`.
3. Migrate and reconcile every current SalesTracker row.
4. Seed SalesSequence to the highest imported QuoteSeq plus one.
5. Build/test the three flows from `power-automate-build.md`.
6. Install/test the protected sync script. The workbook owner enters the password
   as a secure flow value; it is never stored in source or chat.
7. Wire the optimized Power Fx, run `acceptance.md`, obtain management sign-off,
   then publish.
