=Refresh(SalesTracker);
If(
    IsBlank(cmbSearchQuote.Selected) && IsBlank(cmbSearchRFQ.Selected) && IsBlank(cmbSearchPO.Selected),
    Notify("Please select a Quote, RFQ, or PO Number to search.", NotificationType.Warning),
    // Keep quote > project > PO priority and refresh-based record lookup.
    UpdateContext({
        varCurrentRecord: If(
            !IsBlank(cmbSearchQuote.Selected),
            LookUp(SalesTracker, Quote_No = cmbSearchQuote.Selected.Quote_No),
            !IsBlank(cmbSearchRFQ.Selected),
            LookUp(SalesTracker, Project_Name = cmbSearchRFQ.Selected.Project_Name),
            !IsBlank(cmbSearchPO.Selected),
            LookUp(SalesTracker, PO_Reference = cmbSearchPO.Selected.PO_Reference)
        )
    });
    If(
        !IsBlank(varCurrentRecord),
        UpdateContext({varShowForm: true}),
        Notify("No matching record found.", NotificationType.Error)
    )
)
