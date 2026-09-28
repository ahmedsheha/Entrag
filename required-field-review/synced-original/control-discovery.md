# Canvas control discovery for required-field feedback

# Control Label
Part of the control family Classic.

Control creation keywords:
```yaml
Control: Label
```

Input Properties:
  - Align: Enum
      Default: Align.Left
      Enum name: Align
      Enum values: Center, Justify, Left, Right
  - AutoHeight: Boolean
      Default: false
  - BorderColor: Color
      Default: App.Theme.Colors.Darker40
  - BorderStyle: Enum
      Default: BorderStyle.Solid
      Enum name: BorderStyle
      Enum values: Dashed, Dotted, None, Solid
  - BorderThickness: Number
      Default: 0
  - Color: Color
      Default: RGBA(0, 0, 0, 1)
  - ContentLanguage: Text
      Default: ""
  - DisabledBorderColor: Color
      Default: RGBA(56, 56, 56, 1)
  - DisabledColor: Color
      Default: RGBA(166, 166, 166, 1)
  - DisabledFill: Color
      Default: RGBA(0, 0, 0, 0)
  - DisplayMode: Enum
      Default: DisplayMode.Edit
      Enum name: DisplayMode
      Enum values: Disabled, Edit, View
  - Fill: Color
      Default: RGBA(0, 0, 0, 0)
  - FocusedBorderColor: Color
      Default: Self.BorderColor
  - FocusedBorderThickness: Number
      Default: 0
  - Font: Enum
      Default: App.Theme.Font
      Enum name: Font
      Enum values: Arial, Courier New, Dancing Script, Georgia, Great Vibes, Lato, Lato Black, Lato Hairline, Lato Light, Open Sans, Open Sans Condensed, Patrick Hand, Segoe UI, Verdana
  - FontWeight: Enum
      Default: FontWeight.Normal
      Enum name: FontWeight
      Enum values: Bold, Lighter, Normal, Semibold
  - Height: Number
      Default: 40
  - HoverBorderColor: Color
      Default: Self.BorderColor
  - HoverColor: Color
      Default: Self.Color
  - HoverFill: Color
      Default: Self.Fill
  - Italic: Boolean
      Default: false
  - LineHeight: Number
      Default: 1.2
  - Live: Enum
      Default: Live.Off
      Enum name: Live
      Enum values: Assertive, Off, Polite
  - OnSelect: Boolean
      Default: false
  - Overflow: Enum
      Default: Overflow.Hidden
      Enum name: Overflow
      Enum values: Hidden, Scroll
  - PaddingBottom: Number
      Default: 5
  - PaddingLeft: Number
      Default: 5
  - PaddingRight: Number
      Default: 5
  - PaddingTop: Number
      Default: 5
  - PressedBorderColor: Color
      Default: Self.BorderColor
  - PressedColor: Color
      Default: Self.Color
  - PressedFill: Color
      Default: Self.Fill
  - Role: Enum
      Default: TextRole.Default
      Enum name: TextRole
      Enum values: Default, Heading1, Heading2, Heading3, Heading4
  - Size: Number
      Default: 13
  - Strikethrough: Boolean
      Default: false
  - TabIndex: Number
      Default: -1
  - Text: Text
      Default: "Text"
  - Tooltip: Text
      Default: ""
  - Underline: Boolean
      Default: false
  - VerticalAlign: Enum
      Default: VerticalAlign.Middle
      Enum name: VerticalAlign
      Enum values: Bottom, Middle, Top
  - Visible: Boolean
      Default: true
  - Width: Number
      Default: 150
  - Wrap: Boolean
      Default: true
  - X: Number
      Default: 0
  - Y: Number
      Default: 0

Additional input properties if a child of a Vertical or Horizontal GroupContainer:
  - AlignInContainer: Enum
      Default: AlignInContainer.SetByContainer
      Enum name: AlignInContainer
      Enum values: Center, End, SetByContainer, Start, Stretch
  - FillPortions: Number
      Default: 0
  - LayoutMaxHeight: Number
      Default: 0
  - LayoutMaxWidth: Number
      Default: 0
  - LayoutMinHeight: Number
      Default: 40
  - LayoutMinWidth: Number
      Default: 150

Additional input properties if a child of a Grid GroupContainer:
  - LayoutGridColumnEnd: Number
  - LayoutGridColumnStart: Number
  - LayoutGridRowEnd: Number
  - LayoutGridRowStart: Number

Output Properties:
  - Align: Enum
  - AutoHeight: Boolean
  - BorderColor: Color
  - BorderStyle: Enum
  - BorderThickness: Number
  - Color: Color
  - ContentLanguage: Text
  - DisabledBorderColor: Color
  - DisabledColor: Color
  - DisabledFill: Color
  - DisplayMode: Enum
  - Fill: Color
  - FocusedBorderColor: Color
  - FocusedBorderThickness: Number
  - Font: Enum
  - FontWeight: Enum
  - Height: Number
  - HoverBorderColor: Color
  - HoverColor: Color
  - HoverFill: Color
  - Italic: Boolean
  - LineHeight: Number
  - Live: Enum
  - Overflow: Enum
  - PaddingBottom: Number
  - PaddingLeft: Number
  - PaddingRight: Number
  - PaddingTop: Number
  - PressedBorderColor: Color
  - PressedColor: Color
  - PressedFill: Color
  - Role: Enum
  - Size: Number
  - Strikethrough: Boolean
  - TabIndex: Number
  - Text: Text
  - Tooltip: Text
  - Underline: Boolean
  - VerticalAlign: Enum
  - Visible: Boolean
  - Width: Number
  - Wrap: Boolean
  - X: Number
  - Y: Number


# Control Classic/TextInput
Part of the control family Classic.

Control creation keywords:
```yaml
Control: Classic/TextInput
```

Input Properties:
  - AccessibleLabel: Text
      Default: ""
  - Align: Enum
      Default: Align.Left
      Enum name: Align
      Enum values: Center, Justify, Left, Right
  - BorderColor: Color
      Default: App.Theme.Colors.Darker40
  - BorderStyle: Enum
      Default: BorderStyle.Solid
      Enum name: BorderStyle
      Enum values: Dashed, Dotted, None, Solid
  - BorderThickness: Number
      Default: 2
  - Clear: Boolean
      Default: false
  - Color: Color
      Default: RGBA(0, 0, 0, 1)
  - ContentLanguage: Text
      Default: ""
  - Default: Text
      Default: "Text input"
  - DelayOutput: Boolean
      Default: false
  - DisabledBorderColor: Color
      Default: RGBA(166, 166, 166, 1)
  - DisabledColor: Color
      Default: RGBA(166, 166, 166, 1)
  - DisabledFill: Color
      Default: RGBA(244, 244, 244, 1)
  - DisplayMode: Enum
      Default: DisplayMode.Edit
      Enum name: DisplayMode
      Enum values: Disabled, Edit, View
  - EnableSpellCheck: Boolean
      Default: false
  - Fill: Color
      Default: RGBA(255, 255, 255, 1)
  - FocusedBorderColor: Color
      Default: Self.BorderColor
  - FocusedBorderThickness: Number
      Default: 4
  - Font: Enum
      Default: App.Theme.Font
      Enum name: Font
      Enum values: Arial, Courier New, Dancing Script, Georgia, Great Vibes, Lato, Lato Black, Lato Hairline, Lato Light, Open Sans, Open Sans Condensed, Patrick Hand, Segoe UI, Verdana
  - FontWeight: Enum
      Default: FontWeight.Normal
      Enum name: FontWeight
      Enum values: Bold, Lighter, Normal, Semibold
  - Format: Enum
      Default: TextFormat.Text
      Enum name: TextFormat
      Enum values: Number, Text
  - Height: Number
      Default: 40
  - HintText: Text
      Default: ""
  - HoverBorderColor: Color
      Default: App.Theme.Colors.Darker40
  - HoverColor: Color
      Default: RGBA(0, 0, 0, 1)
  - HoverFill: Color
      Default: App.Theme.Colors.Lighter70
  - Italic: Boolean
      Default: false
  - LineHeight: Number
      Default: 1.2
  - MaxLength: Number
  - Mode: Enum
      Default: TextMode.SingleLine
      Enum name: TextMode
      Enum values: MultiLine, Password, SingleLine
  - OnChange: Boolean
      Default: false
  - OnSelect: Boolean
      Default: false
  - PaddingBottom: Number
      Default: 5
  - PaddingLeft: Number
      Default: 12
  - PaddingRight: Number
      Default: 5
  - PaddingTop: Number
      Default: 5
  - PressedBorderColor: Color
      Default: Self.HoverBorderColor
  - PressedColor: Color
      Default: Self.Color
  - PressedFill: Color
      Default: Self.Fill
  - RadiusBottomLeft: Number
      Default: 5
  - RadiusBottomRight: Number
      Default: 5
  - RadiusTopLeft: Number
      Default: 5
  - RadiusTopRight: Number
      Default: 5
  - Reset: Boolean
      Default: false
  - Size: Number
      Default: 13
  - Strikethrough: Boolean
      Default: false
  - TabIndex: Number
      Default: 0
  - Tooltip: Text
      Default: ""
  - Underline: Boolean
      Default: false
  - VirtualKeyboardMode: Enum
      Default: VirtualKeyboardMode.Auto
      Enum name: VirtualKeyboardMode
      Enum values: Auto, Numeric, Text
  - Visible: Boolean
      Default: true
  - Width: Number
      Default: 320
  - X: Number
      Default: 0
  - Y: Number
      Default: 0

Additional input properties if a child of a Vertical or Horizontal GroupContainer:
  - AlignInContainer: Enum
      Default: AlignInContainer.SetByContainer
      Enum name: AlignInContainer
      Enum values: Center, End, SetByContainer, Start, Stretch
  - FillPortions: Number
      Default: 0
  - LayoutMaxHeight: Number
      Default: 0
  - LayoutMaxWidth: Number
      Default: 0
  - LayoutMinHeight: Number
      Default: 40
  - LayoutMinWidth: Number
      Default: 320

Additional input properties if a child of a Grid GroupContainer:
  - LayoutGridColumnEnd: Number
  - LayoutGridColumnStart: Number
  - LayoutGridRowEnd: Number
  - LayoutGridRowStart: Number

Output Properties:
  - AccessibleLabel: Text
  - Align: Enum
  - BorderColor: Color
  - BorderStyle: Enum
  - BorderThickness: Number
  - Clear: Boolean
  - Color: Color
  - ContentLanguage: Text
  - DisabledBorderColor: Color
  - DisabledColor: Color
  - DisabledFill: Color
  - DisplayMode: Enum
  - EnableSpellCheck: Boolean
  - Fill: Color
  - FocusedBorderColor: Color
  - FocusedBorderThickness: Number
  - Font: Enum
  - FontWeight: Enum
  - Format: Enum
  - Height: Number
  - HintText: Text
  - HoverBorderColor: Color
  - HoverColor: Color
  - HoverFill: Color
  - Italic: Boolean
  - LineHeight: Number
  - Mode: Enum
  - PaddingBottom: Number
  - PaddingLeft: Number
  - PaddingRight: Number
  - PaddingTop: Number
  - PressedBorderColor: Color
  - PressedColor: Color
  - PressedFill: Color
  - RadiusBottomLeft: Number
  - RadiusBottomRight: Number
  - RadiusTopLeft: Number
  - RadiusTopRight: Number
  - Size: Number
  - Strikethrough: Boolean
  - TabIndex: Number
  - Text: Text
  - Tooltip: Text
  - Underline: Boolean
  - VirtualKeyboardMode: Enum
  - Visible: Boolean
  - Width: Number
  - X: Number
  - Y: Number


# Control Classic/DropDown
Part of the control family Classic.

Control creation keywords:
```yaml
Control: Classic/DropDown
```

Input Properties:
  - AccessibleLabel: Text
      Default: ""
  - AllowEmptySelection: Boolean
      Default: false
  - BorderColor: Color
      Default: App.Theme.Colors.Darker40
  - BorderStyle: Enum
      Default: BorderStyle.Solid
      Enum name: BorderStyle
      Enum values: Dashed, Dotted, None, Solid
  - BorderThickness: Number
      Default: 2
  - ChevronBackground: Color
      Default: App.Theme.Colors.Primary
  - ChevronDisabledBackground: Color
      Default: RGBA(166, 166, 166, 1)
  - ChevronDisabledFill: Color
      Default: RGBA(244, 244, 244, 1)
  - ChevronFill: Color
      Default: App.Theme.Colors.PrimaryForeground
  - ChevronHoverBackground: Color
      Default: App.Theme.Colors.Darker10
  - ChevronHoverFill: Color
      Default: App.Theme.Colors.PrimaryForeground
  - Color: Color
      Default: RGBA(0, 0, 0, 1)
  - ContentLanguage: Text
      Default: ""
  - Default: Text
      Default: "1"
  - DisabledBorderColor: Color
      Default: RGBA(166, 166, 166, 1)
  - DisabledColor: Color
      Default: RGBA(166, 166, 166, 1)
  - DisabledFill: Color
      Default: RGBA(244, 244, 244, 1)
  - DisplayMode: Enum
      Default: DisplayMode.Edit
      Enum name: DisplayMode
      Enum values: Disabled, Edit, View
  - Fill: Color
      Default: RGBA(255, 255, 255, 1)
  - FocusedBorderColor: Color
      Default: Self.BorderColor
  - FocusedBorderThickness: Number
      Default: 4
  - Font: Enum
      Default: App.Theme.Font
      Enum name: Font
      Enum values: Arial, Courier New, Dancing Script, Georgia, Great Vibes, Lato, Lato Black, Lato Hairline, Lato Light, Open Sans, Open Sans Condensed, Patrick Hand, Segoe UI, Verdana
  - FontWeight: Enum
      Default: FontWeight.Normal
      Enum name: FontWeight
      Enum values: Bold, Lighter, Normal, Semibold
  - Height: Number
      Default: 40
  - HoverBorderColor: Color
      Default: ColorFade(Self.BorderColor, 15%)
  - HoverColor: Color
      Default: RGBA(0, 0, 0, 1)
  - HoverFill: Color
      Default: App.Theme.Colors.Lighter70
  - Italic: Boolean
      Default: false
  - Items: Table
      Default: DropDownSample
  - OnChange: Boolean
      Default: false
  - OnSelect: Boolean
      Default: false
  - PaddingBottom: Number
      Default: 10
  - PaddingLeft: Number
      Default: 10
  - PaddingRight: Number
      Default: 10
  - PaddingTop: Number
      Default: 10
  - PressedBorderColor: Color
      Default: Self.HoverBorderColor
  - PressedColor: Color
      Default: App.Theme.Colors.PrimaryForeground
  - PressedFill: Color
      Default: App.Theme.Colors.Darker30
  - Reset: Boolean
      Default: false
  - SelectionColor: Color
      Default: App.Theme.Colors.PrimaryForeground
  - SelectionFill: Color
      Default: App.Theme.Colors.Primary
  - Size: Number
      Default: 13
  - Strikethrough: Boolean
      Default: false
  - TabIndex: Number
      Default: 0
  - Tooltip: Text
      Default: ""
  - Underline: Boolean
      Default: false
  - Visible: Boolean
      Default: true
  - Width: Number
      Default: 328
  - X: Number
      Default: 0
  - Y: Number
      Default: 0

Additional input properties if a child of a Vertical or Horizontal GroupContainer:
  - AlignInContainer: Enum
      Default: AlignInContainer.SetByContainer
      Enum name: AlignInContainer
      Enum values: Center, End, SetByContainer, Start, Stretch
  - FillPortions: Number
      Default: 0
  - LayoutMaxHeight: Number
      Default: 0
  - LayoutMaxWidth: Number
      Default: 0
  - LayoutMinHeight: Number
      Default: 40
  - LayoutMinWidth: Number
      Default: 328

Additional input properties if a child of a Grid GroupContainer:
  - LayoutGridColumnEnd: Number
  - LayoutGridColumnStart: Number
  - LayoutGridRowEnd: Number
  - LayoutGridRowStart: Number

Output Properties:
  - AccessibleLabel: Text
  - BorderColor: Color
  - BorderStyle: Enum
  - BorderThickness: Number
  - ChevronBackground: Color
  - ChevronDisabledBackground: Color
  - ChevronDisabledFill: Color
  - ChevronFill: Color
  - ChevronHoverBackground: Color
  - ChevronHoverFill: Color
  - Color: Color
  - ContentLanguage: Text
  - DisabledBorderColor: Color
  - DisabledColor: Color
  - DisabledFill: Color
  - DisplayMode: Enum
  - Fill: Color
  - FocusedBorderColor: Color
  - FocusedBorderThickness: Number
  - Font: Enum
  - FontWeight: Enum
  - Height: Number
  - HoverBorderColor: Color
  - HoverColor: Color
  - HoverFill: Color
  - Italic: Boolean
  - PaddingBottom: Number
  - PaddingLeft: Number
  - PaddingRight: Number
  - PaddingTop: Number
  - PressedBorderColor: Color
  - PressedColor: Color
  - PressedFill: Color
  - Selected: Record
  - SelectedText: Record
  - SelectionColor: Color
  - SelectionFill: Color
  - Size: Number
  - Strikethrough: Boolean
  - TabIndex: Number
  - Tooltip: Text
  - Underline: Boolean
  - Visible: Boolean
  - Width: Number
  - X: Number
  - Y: Number


# Control Classic/ComboBox
Part of the control family Classic.

Control creation keywords:
```yaml
Control: Classic/ComboBox
```

Input Properties:
  - AccessibleLabel: Text
      Default: ""
  - BorderColor: Color
      Default: App.Theme.Colors.Darker40
  - BorderStyle: Enum
      Default: BorderStyle.Solid
      Enum name: BorderStyle
      Enum values: Dashed, Dotted, None, Solid
  - BorderThickness: Number
      Default: 2
  - ChevronBackground: Color
      Default: App.Theme.Colors.Primary
  - ChevronDisabledBackground: Color
      Default: RGBA(166, 166, 166, 1)
  - ChevronDisabledFill: Color
      Default: RGBA(244, 244, 244, 1)
  - ChevronFill: Color
      Default: App.Theme.Colors.PrimaryForeground
  - ChevronHoverBackground: Color
      Default: App.Theme.Colors.Darker10
  - ChevronHoverFill: Color
      Default: App.Theme.Colors.PrimaryForeground
  - Color: Color
      Default: RGBA(0, 0, 0, 1)
  - ContentLanguage: Text
      Default: ""
  - Default: Record
  - DefaultSelectedItems: Table
  - DisabledBorderColor: Color
      Default: RGBA(166, 166, 166, 1)
  - DisabledColor: Color
      Default: RGBA(166, 166, 166, 1)
  - DisabledFill: Color
      Default: RGBA(244, 244, 244, 1)
  - DisplayFields: Table
      Default: ["Value1"]
  - DisplayMode: Enum
      Default: DisplayMode.Edit
      Enum name: DisplayMode
      Enum values: Disabled, Edit, View
  - Fill: Color
      Default: RGBA(255, 255, 255, 1)
  - FocusedBorderColor: Color
      Default: Self.BorderColor
  - FocusedBorderThickness: Number
      Default: 4
  - Font: Enum
      Default: App.Theme.Font
      Enum name: Font
      Enum values: Arial, Courier New, Dancing Script, Georgia, Great Vibes, Lato, Lato Black, Lato Hairline, Lato Light, Open Sans, Open Sans Condensed, Patrick Hand, Segoe UI, Verdana
  - FontWeight: Enum
      Default: FontWeight.Normal
      Enum name: FontWeight
      Enum values: Bold, Lighter, Normal, Semibold
  - Height: Number
      Default: 40
  - HoverBorderColor: Color
      Default: ColorFade(Self.BorderColor, 15%)
  - HoverColor: Color
      Default: RGBA(0, 0, 0, 1)
  - HoverFill: Color
      Default: App.Theme.Colors.Lighter70
  - InputTextPlaceholder: Text
      Default: "Find items"
  - IsSearchable: Boolean
      Default: true
  - Italic: Boolean
      Default: false
  - Items: Table
      Default: ComboBoxSample
  - MultiValueDelimiter: Text
      Default: ", "
  - NoSelectionText: Text
      Default: ""
  - OnChange: Boolean
      Default: false
  - OnSelect: Boolean
      Default: false
  - PaddingBottom: Number
      Default: 5
  - PaddingLeft: Number
      Default: 5
  - PaddingRight: Number
      Default: 5
  - PaddingTop: Number
      Default: 5
  - PressedBorderColor: Color
      Default: Self.HoverBorderColor
  - PressedColor: Color
      Default: App.Theme.Colors.PrimaryForeground
  - PressedFill: Color
      Default: App.Theme.Colors.Darker30
  - Reset: Boolean
      Default: false
  - SearchFields: Table
      Default: ["Value1"]
  - SelectionColor: Color
      Default: App.Theme.Colors.PrimaryForeground
  - SelectionFill: Color
      Default: App.Theme.Colors.Primary
  - SelectionTagColor: Color
      Default: Self.HoverColor
  - SelectionTagFill: Color
      Default: Self.HoverFill
  - SelectMultiple: Boolean
      Default: true
  - Size: Number
      Default: 13
  - Strikethrough: Boolean
      Default: false
  - TabIndex: Number
      Default: 0
  - Tooltip: Text
      Default: ""
  - Underline: Boolean
      Default: false
  - Visible: Boolean
      Default: true
  - Width: Number
      Default: 328
  - X: Number
      Default: 0
  - Y: Number
      Default: 0

Additional input properties if a child of a Vertical or Horizontal GroupContainer:
  - AlignInContainer: Enum
      Default: AlignInContainer.SetByContainer
      Enum name: AlignInContainer
      Enum values: Center, End, SetByContainer, Start, Stretch
  - FillPortions: Number
      Default: 0
  - LayoutMaxHeight: Number
      Default: 0
  - LayoutMaxWidth: Number
      Default: 0
  - LayoutMinHeight: Number
      Default: 40
  - LayoutMinWidth: Number
      Default: 328

Additional input properties if a child of a Grid GroupContainer:
  - LayoutGridColumnEnd: Number
  - LayoutGridColumnStart: Number
  - LayoutGridRowEnd: Number
  - LayoutGridRowStart: Number

Output Properties:
  - AccessibleLabel: Text
  - BorderColor: Color
  - BorderStyle: Enum
  - BorderThickness: Number
  - ChevronBackground: Color
  - ChevronDisabledBackground: Color
  - ChevronDisabledFill: Color
  - ChevronFill: Color
  - ChevronHoverBackground: Color
  - ChevronHoverFill: Color
  - Color: Color
  - ContentLanguage: Text
  - DisabledBorderColor: Color
  - DisabledColor: Color
  - DisabledFill: Color
  - DisplayMode: Enum
  - Fill: Color
  - FocusedBorderColor: Color
  - FocusedBorderThickness: Number
  - Font: Enum
  - FontWeight: Enum
  - Height: Number
  - HoverBorderColor: Color
  - HoverColor: Color
  - HoverFill: Color
  - Italic: Boolean
  - NavigateItem: Record
  - PaddingBottom: Number
  - PaddingLeft: Number
  - PaddingRight: Number
  - PaddingTop: Number
  - PressedBorderColor: Color
  - PressedColor: Color
  - PressedFill: Color
  - SearchText: Text
  - Selected: Record
  - SelectedItems: Table
  - SelectionColor: Color
  - SelectionFill: Color
  - SelectionTagColor: Color
  - SelectionTagFill: Color
  - Size: Number
  - Strikethrough: Boolean
  - TabIndex: Number
  - Tooltip: Text
  - Underline: Boolean
  - Visible: Boolean
  - Width: Number
  - X: Number
  - Y: Number



