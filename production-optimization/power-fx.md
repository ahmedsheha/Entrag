# Canvas app Power Fx changes

## Startup/reference data

Render the landing screen first. Load only the small reference lists:

```powerfx
Concurrent(
    ClearCollect(colCustomers, Filter(SalesCustomers, Active = true)),
    ClearCollect(colOptions, Filter(SalesOptions, Active = true))
)
```

Do not collect `SalesOpportunities`.

## Smart search

Set the search input `DelayOutput` to true. The results gallery uses indexed,
delegable predicates and does not call `Refresh`:

```powerfx
With(
    { q: Trim(txtOpportunitySearch.Text) },
    If(
        Len(q) < 2,
        Filter(SalesOpportunities, false),
        Filter(
            SalesOpportunities,
            StartsWith(QuoteNo, q) ||
            StartsWith(ProjectName, q) ||
            StartsWith(POReference, q)
        )
    )
)
```

Selecting a result stores the complete record and `Revision` in `varCurrentRecord`.

## Customer behavior

When the sync toggle is on, display and save End User as Customer Name. When it is
off, display and save the independently selected customer:

```powerfx
If(tglSyncCustomer.Value, cmbEndUser.Selected.Title, cmbCustomer.Selected.Title)
```

## Save state

Generate one request ID per submit attempt, disable Submit while `varSaving` is
true, and call `CreateOpportunity.Run(...)` or `UpdateOpportunity.Run(...)`.
Only clear the form after a `status=success` response. For `status=conflict`, keep
all inputs and ask the user to reload the current record. Excel and email are not
called from the canvas app.

Submit button `DisplayMode`:

```powerfx
If(varSaving, DisplayMode.Disabled, DisplayMode.Edit)
```

Submit button `OnSelect` pattern (map every named argument to the matching control):

```powerfx
If(
    varSaving,
    false,
    Set(varSaving, true);
    If(IsBlank(varRequestId), Set(varRequestId, Text(GUID())));
    Set(
        varSaveResult,
        IfError(
            If(
                varIsNewMode,
                CreateOpportunity.Run(
                    varRequestId,
                    Text(Now(), DateTimeFormat.UTC),
                    ProjName.Text,
                    Application.Text,
                    BU.Selected.BU,
                    ComboBox1.Selected.CutomerName,
                    If(tglSyncCustomer.Value,
                        ComboBox1.Selected.CutomerName,
                        ComboBox1_1.Selected.CutomerName),
                    Dropdown2.Selected.SubBU,
                    Value(Prob.Selected.Prob),
                    'Sales Recommendation'.Selected.'Scope Of Supply',
                    DataCardValue14.Text,
                    Dropdown6.Selected.'Specs or Model',
                    Value(DataCardValue10.Text),
                    Dropdown3.Selected.BookPeriod,
                    Value(DataCardValue15.Text),
                    Dropdown1.Selected.'Lead Type',
                    TechD.Text,
                    ComD.Text,
                    txtPOReference.Text
                ),
                UpdateOpportunity.Run(
                    varCurrentRecord.ID,
                    varCurrentRecord.Revision,
                    varRequestId,
                    Text(Now(), DateTimeFormat.UTC),
                    ProjName.Text,
                    Application.Text,
                    BU.Selected.BU,
                    ComboBox1.Selected.CutomerName,
                    If(tglSyncCustomer.Value,
                        ComboBox1.Selected.CutomerName,
                        ComboBox1_1.Selected.CutomerName),
                    Dropdown2.Selected.SubBU,
                    Value(Prob.Selected.Prob),
                    'Sales Recommendation'.Selected.'Scope Of Supply',
                    DataCardValue14.Text,
                    Dropdown6.Selected.'Specs or Model',
                    Value(DataCardValue10.Text),
                    Dropdown3.Selected.BookPeriod,
                    Value(DataCardValue15.Text),
                    Dropdown1.Selected.'Lead Type',
                    TechD.Text,
                    ComD.Text,
                    txtPOReference.Text
                )
            ),
            {status: "error", message: FirstError.Message}
        )
    );
    Switch(
        varSaveResult.status,
        "success",
            Set(varRequestId, Blank());
            Set(varCurrentRecord, Blank());
            UpdateContext({varShowForm: false, varShowSearch: false,
                varIsNewMode: false});
            Notify("Opportunity " & varSaveResult.quoteNo & " saved.",
                NotificationType.Success),
        "conflict",
            Notify("This opportunity changed after you opened it. Reload it before saving.",
                NotificationType.Warning),
        Notify(Coalesce(varSaveResult.message,
            "Save failed. Retry uses the same request and will not create a duplicate."),
            NotificationType.Error)
    );
    Set(varSaving, false)
)
```

Keep `varRequestId` after an error so a retry is idempotent. Clear it after success,
after an explicit cancel, or when starting a different record.

Add `txtPOReference` to the existing form and default it from
`varCurrentRecord.POReference`. This replaces the old search-only PO behavior and
ensures the indexed PO value is editable and survives synchronization.

## Loading and search states

- App `OnStart`: initialize `varSaving=false`, `varSearching=false`, and do only the
  two small `Concurrent` reference loads above.
- Search input `OnChange`: set `varSearching=true`, then set it false after the
  gallery query completes or a result is selected.
- Loading/searching/saving indicators are driven only from these variables.
- Remove every `Refresh(SalesTracker)`, `Max(SalesTracker, Quote_Seq)`, direct
  `Patch(SalesTracker, ...)`, and `Office365Outlook.SendEmailV2(...)` call.
