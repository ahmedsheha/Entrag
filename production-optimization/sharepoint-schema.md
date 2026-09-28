# SharePoint schema

All lists belong on the approved team site and inherit the site's existing team
permissions.

## SalesOpportunities

| Display name | Type | Required | Indexed/unique |
| --- | --- | --- | --- |
| Title | Single line text | Yes | No; set to QuoteNo |
| QuoteNo | Single line text | Yes | Indexed; new `MSOL26` values are unique by flow |
| QuoteSeq | Number, 0 decimals | Yes | Indexed, unique |
| ClientRequestId | Single line text | Yes | Indexed, unique |
| Revision | Number, 0 decimals | Yes | Indexed; default 1 |
| ExcelRowKey | Single line text | Yes | Indexed, unique |
| OpportunityDate | Date and time | No for legacy compatibility; required by create/update flows | Indexed |
| ProjectName | Single line text | Yes | Indexed |
| Application | Single line text | No for legacy compatibility; required by create/update flows | No |
| BU | Single line text | Yes | No |
| EndUserName | Single line text | Yes | No |
| CustomerName | Single line text | Yes | No |
| SubBU | Single line text | No | No |
| Probability | Number | No | No |
| ScopeRecommendation | Single line text | No | No |
| ScopeDetails | Multiple lines, plain text | No | No |
| SpecsModel | Single line text | No | No |
| OrderValue | Currency | Yes | No |
| BookPeriod | Single line text | No | No |
| Discount | Number | No for legacy compatibility; required by create/update flows | No |
| LeadType | Single line text | No | No |
| TechnicalContact | Single line text | No | No |
| CommercialContact | Single line text | No | No |
| POReference | Single line text | No | Indexed |

Index the built-in `Modified` column. The app queries QuoteNo with equality and
QuoteNo, ProjectName, and POReference with delegable prefix filters. It never
downloads the complete list.

The management workbook contains duplicate legacy QuoteNo values and legacy rows
without OpportunityDate, Application, or Discount. The migration must preserve
those values exactly. Column-level QuoteNo uniqueness and those three required
flags therefore apply through the create/update flows for new operational records,
not retroactively to legacy rows. QuoteSeq remains unique when populated, and
ExcelRowKey/ClientRequestId remain unique for every migrated row.

## SalesSequence

Exactly one row: `Title=MSOL26`, `NextNumber=<highest imported QuoteSeq + 1>`, and
`Revision=1`. Only the create flow may edit this row.

## SalesCustomers

`Title` (customer/end-user name, unique), `AccountManager`, `Active` (Yes/No), and
`SortOrder` (Number).

## SalesOptions

`Title` (value), `Category` (indexed text), `ParentValue`, `Active` (Yes/No), and
`SortOrder` (Number). Categories replace the current Excel lookup tables.

## SalesIntegrationLog

`Title` (QuoteNo), `OpportunityId`, `Revision`, `Operation` (Create/Update),
`ExcelStatus`, `EmailStatus`, `AttemptCount`, `LastError`, `ProcessedAt`, and
`CorrelationId` (unique). This list contains operational metadata only and is not
copied to Excel.
