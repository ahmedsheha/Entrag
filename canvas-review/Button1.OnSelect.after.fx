=If(
    // 1. VALIDATION
    varIsNewMode && (
        IsBlank(ProjName.Text) || IsBlank(Application.Text) || 
        IsBlank(BU.Selected.BU) || IsBlank(ComboBox1.Selected.CutomerName) || 
        IsBlank(DataCardValue10.Text) || IsBlank(DataCardValue15.Text)
    ), 

    Notify("Please fill in all required fields marked with an asterisk (*) before submitting.", NotificationType.Error),

    // Keep timestamp and payload local to this submission.
    With(
        { submissionTime: DateAdd(Now(), 3, TimeUnit.Hours), isNewSubmission: varIsNewMode },
        With(
            // Preserve create-only sequence calculation before reading the payload.
            { NextNumber: If(isNewSubmission, Coalesce(Max(SalesTracker, Quote_Seq), 400) + 1) },
            With(
                { submission: {
                    Opportunity_date: submissionTime,
                    Project_Name: ProjName.Text,
                    Application: Application.Text,
                    BU: BU.Selected.BU,
                    EndUser_Name: ComboBox1.Selected.CutomerName,
                    Sub_BU: Dropdown2.Selected.SubBU,
                    'Prob %': Prob.Selected.Prob,
                    'Scope Of Supply Sales Recommendation': 'Sales Recommendation'.Selected.'Scope Of Supply',
                    'Scope of Supply Details': DataCardValue14.Text,
                    'Specs or Model': Dropdown6.Selected.'Specs or Model',
                    'Order Value': DataCardValue10.Text,
                    'Book Period': Dropdown3.Selected.BookPeriod,
                    Discount: DataCardValue15.Text,
                    'Lead Type': Dropdown1.Selected.'Lead Type',
                    'Technical Contact': TechD.Text,
                    'Commercial Contact': ComD.Text
                } },
                If(
                    isNewSubmission,
                    Patch(
                        SalesTracker, Defaults(SalesTracker),
                        { Quote_No: "MSOL26" & NextNumber, Quote_Seq: NextNumber },
                        submission
                    );
                    Office365Outlook.SendEmailV2(
                        "michael.waffai@entrag.com", 
                        "New Opportunity Submitted: " & ProjName.Text, 
                        "Hello,<br><br>A new opportunity has just been submitted via the Sales Tracker App. Here are the details:<br><br><b>Quote Number:</b> MSOL26" & NextNumber & "<br><b>Project Name:</b> " & ProjName.Text & "<br><b>End User:</b> " & ComboBox1.Selected.CutomerName & "<br><b>Business Unit:</b> " & BU.Selected.BU & "<br><b>Order Value:</b> $" & DataCardValue10.Text & "<br><br>Best regards,<br>Automated Sales System", 
                        {IsHtml: true} 
                    ),
                    // Omit quote fields on update to preserve the existing write set.
                    Patch(SalesTracker, varCurrentRecord, submission)
                )
            )
        )
    );
  Refresh(SalesTracker);
    // --- POST-SUBMISSION CLEANUP (Returns user to Landing Page) ---
    UpdateContext({ 
        varShowForm: false,
        varShowSearch: false, // Hides search bar to return to Landing state
        varCurrentRecord: Blank(),
        varIsNewMode: false
    }); 

    UpdateContext({ varResetControls: true });
    UpdateContext({ varResetControls: false });

    Reset(cmbSearchQuote);
    Reset(cmbSearchRFQ);
    Reset(cmbSearchPO);
    Notify("Opportunity submitted and email sent successfully!", NotificationType.Success)
)
