# Pilot workbook migration assessment

Source checksum:
`1a09e967b78c860eda3bd3d8b91938d32548142d438069e5d13197b52cea59c1`

## Inventory

- SalesTracker range: `A2:AZ346`
- Fixed columns: 52
- Populated opportunity rows: 152
- Formula cells inside the table body: 5,290
- Excel date system: 1900

## Quote identifiers

- 72 distinct Quote_No values across 152 rows.
- Ten Quote_No values are repeated. These are genuine legacy records, not an
  extraction error.
- Three rows use the new generated sequence: MSOL261, MSOL262, and MSOL263.
- Highest populated Quote_Seq: 3; proposed next sequence: 4.
- 26 rows already have `__PowerAppsId__`; 126 require a deterministic migration
  key based on their source Excel row.

## Legacy missing values

- Opportunity_date: 148 rows
- Application: 60 rows
- Discount: 68 rows
- Quote_Seq: 149 rows

No placeholder business values should be invented. The SharePoint columns must
allow these legacy blanks, while the Power App and flows continue to require the
fields for every new or edited operational record.

## Compatibility decision

To preserve management reporting values exactly:

1. Keep QuoteNo indexed but not column-level unique. The create flow and unique
   QuoteSeq guarantee uniqueness for all new MSOL26 quotes.
2. Keep QuoteSeq unique when populated; legacy rows remain blank.
3. Keep ClientRequestId and ExcelRowKey unique for every row.
4. Allow legacy blanks in OpportunityDate, Application, and Discount at the list
   schema level, while enforcing them in the Power App and both save flows.

Importing under the original strict column constraints would either fail or force
changes to management data, so it is release-blocking until this compatibility
rule is accepted.
