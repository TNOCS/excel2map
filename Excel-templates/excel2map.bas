Attribute VB_Name = "Excel2Map"
Option Explicit
Dim optionTypes As Object     'PropertyTypes that should be converted to options
Dim labelDictionary As Object 'Shorten long label names

' Export the data to the map application
Sub export2map()
    Dim fs As Object
    Dim projectId As Range
    Dim json As String
    Dim jsonFile
    Dim cd, dest
    Dim passedCheck As Boolean
    
    ActiveWorkbook.Sheets("Layer").Unprotect
    
    Call ColourCells
    Call CreateProject
    Call SetNamedRangesOfData
    
    Call PopulateOptionTypesAndLabels
    
    json = ""
    json = json & range2json("LayerDefinition", True, False, True)
    json = json & range2json("PropertyTypes", False, False, True)
    json = json & range2json("Properties", False, False, False)
    
    'Add the projectId and Icon (in base64)
    Dim icon As String
    icon = convertIconToBase64(Range("ICON").Cells(1, 1))
    json = json & """iconBase64"":""" & icon & ""","
    
    Set projectId = Range("PROJECTID")
    json = json & """projectId"":""" & projectId.Cells(1, 1) & """}"
    
    'Copy output to clipboard, in case uploading fails
    CopyText (json)

    passedCheck = checkHost("HOST")
    If (Not passedCheck) Then Exit Sub
    Call UpdateUrl
        
    passedCheck = checkProjectId("PROJECTID")
    If (Not passedCheck) Then Exit Sub
    Call UpdateProjectLink

    ActiveWorkbook.Sheets("Layer").Protect

    'Write output to file
    If (Not IsEmpty(Range("Debugging").Cells(1, 1).value)) And (Range("Debugging").Cells(1, 1) > 0) Then
        Set fs = CreateObject("Scripting.FileSystemObject")
        cd = fs.GetAbsolutePathName(".")
        dest = fs.BuildPath(cd, "debug-output.json")
        Set jsonFile = fs.CreateTextFile(dest, True)
        jsonFile.WriteLine json
        jsonFile.Close
        MsgBox "Wrote debug output to " + dest
        Set fs = Nothing
    End If
    
    'SendJson "http://posttestserver.com/post.php", json
    'SendJson "http://httpbin.org/post", json
    'SendJson (Range("URL") + "/api/projects/" + Range("PROJECTID")), json
    SendJson Range("URL"), json
End Sub

Private Function checkProjectId(namedRange As String) As Boolean
    Dim idRange As Range
    Set idRange = Range(namedRange)
    If IsEmpty(idRange.Cells(1, 1).value) = True Then
        checkProjectId = False
    Else
        checkProjectId = True
    End If
End Function

Private Function checkHost(namedRange As String) As Boolean
    Dim hostRange As Range
    Set hostRange = Range(namedRange)
    If IsEmpty(hostRange.Cells(1, 1).value) = True Then
        MsgBox "No project ID found, please request an ID before uploading the data."
        checkHost = False
    ElseIf Right(hostRange.Cells(1, 1), 1) = "/" Then
        hostRange.Cells(1, 1) = Left(hostRange.Cells(1, 1), Len(hostRange.Cells(1, 1)) - 1)
        checkHost = checkHost(namedRange)
    Else
        checkHost = True
    End If
End Function

Private Sub PopulateOptionTypesAndLabels()
    'Find option types
    Set optionTypes = CreateObject("scripting.dictionary")
    Set labelDictionary = CreateObject("scripting.dictionary")
    Dim count As Integer
    Dim typ As String
    Dim ptRange As Range
    Set ptRange = Range("PropertyTypes")
    For count = 2 To ptRange.Rows.count
        'Convert label name to a, b, c, ..., aa, ab, etc.
        If (Not IsEmpty(ptRange.Cells(count, 1))) Then
            If (Not IsError(Application.Match(ptRange.Cells(count, 1).value, Range("LayerDefinition").Rows(2), 0))) Then
                labelDictionary.Item(ptRange.Cells(count, 1).value) = ptRange.Cells(count, 1).value
            Else
                labelDictionary.Item(ptRange.Cells(count, 1).value) = (Chr(Int(((count - 2) / 26)) Mod 26 + 65) + Chr(Int((count - 2) Mod 26) + 65))
                typ = ptRange.Cells(count, 5)
                If typ = "options" Then
                    Set optionTypes.Item(labelDictionary.Item(ptRange.Cells(count, 1).value)) = findAllOptions(ptRange.Cells(count, 1).value)
                End If
            End If
        End If
    Next
End Sub

Private Function findAllOptions(col As String) As Object
    Set findAllOptions = CreateObject("scripting.dictionary")
    Dim val As String
    Dim count, colIndex, nrOptions As Integer
    Dim pRange As Range
    Set pRange = Range("Properties")
    For count = 1 To pRange.Columns.count
        val = pRange.Cells(1, count).value
        If val = col Then
            colIndex = count
        End If
    Next
    nrOptions = 0
    For count = 2 To pRange.Rows.count
        val = pRange.Cells(count, colIndex).value
        If Not findAllOptions.Exists(val) Then
            findAllOptions.Item(val) = nrOptions
            nrOptions = nrOptions + 1
        End If
    Next
End Function

' Convert a named cell range to JSON.
' Parameters are whether the string should include the optional start { and end }.
Private Function range2json(namedRange As String, isStart As Boolean, isFinal As Boolean, firstLetterToLower As Boolean) As String
    Dim json As String ' New System.Text.StringBuilder()
    Dim rangeToExport As Range
    Dim rowCounter As Long
    Dim columnCounter As Long
    Dim lineData As String
    Dim cellValue
    Dim cleanValue As String
    Dim cellHeader As String
    
    ' LayerDefinition is split in two rows. To concatenate, copy both rows to the Helpers
    ' sheet and select the horizontally concatenated row as the final LayerDefinition range.
    ' Also, replace geometryType parameters to "Parameter 1, 2", etc.
    If namedRange = "LayerDefinition" Then
        Dim rowLength As Integer
        rowLength = Range("LayerDefinitionRow1").Columns.count
        Range("LayerDefinitionRow1").Copy Range("LayerDefinitionMerged").Cells(1, 1)
        Range("LayerDefinitionRow2").Copy Range("LayerDefinitionMerged").Cells(1, 1 + rowLength)
        Range("Parameters").Cells(1, 1).value = "Parameter1"
        Range("Parameters").Cells(1, 2).value = "Parameter2"
        Range("Parameters").Cells(1, 3).value = "Parameter3"
        Range("Parameters").Cells(1, 4).value = "Parameter4"
        Dim file, key As String
        file = Application.WorksheetFunction.VLookup(Range("GEOMETRY_TYPE").Cells(1, 1).value, Range("GEOMETRY_DATA"), 6, False)
        key = Application.WorksheetFunction.VLookup(Range("GEOMETRY_TYPE").Cells(1, 1).value, Range("GEOMETRY_DATA"), 7, False)
        Range("LD_GEOMETRY").Cells(1, 1).value = "GeometryFile"
        Range("LD_GEOMETRY").Cells(1, 2).value = "GeometryKey"
        Range("LD_GEOMETRY").Cells(2, 1).value = file
        Range("LD_GEOMETRY").Cells(2, 2).value = key
    End If
    
    Set rangeToExport = Range(namedRange)
    namedRange = LowerCaseFirstLetter(namedRange)
    
    If isStart Then
        lineData = "{""" & namedRange & """: ["
    Else
        lineData = """" & namedRange & """: ["
    End If
    json = json & lineData
    For rowCounter = 2 To rangeToExport.Rows.count
        lineData = ""
        For columnCounter = 1 To rangeToExport.Columns.count
            cellValue = rangeToExport.Cells(rowCounter, columnCounter)
            cleanValue = RemoveForbiddenCharacters(cellValue)
            If (firstLetterToLower) Then
                cellHeader = LowerCaseFirstLetter(rangeToExport.Cells(1, columnCounter))
            Else
                cellHeader = rangeToExport.Cells(1, columnCounter)
            End If
            If (labelDictionary.Exists(cellHeader)) Then
                cellHeader = labelDictionary.Item(cellHeader)
            End If
            If (cellHeader = "label" And labelDictionary.Exists(cellValue) And namedRange = "propertyTypes") Then
                cellValue = labelDictionary.Item(cellValue)
            End If
            
            'cellHeader = LCase(Mid(cellHeader, 1, 1)) & Mid(cellHeader, 2, Len(cellHeader) - 1)
            If (Not IsError(cellValue)) Then
                If (Not cellValue = "") Then
                    If optionTypes.Exists(cellHeader) And namedRange = "properties" Then
                        lineData = lineData & """" & cellHeader & """" & ":" & optionTypes(cellHeader)(cellValue) & ","
                    ElseIf cellValue = "options" And namedRange = "propertyTypes" Then
                        lineData = lineData & """" & cellHeader & """" & ":" & """" & cellValue & """" & ","
                        lineData = lineData & """options"":["
                        Dim keyCount As Integer
                        For keyCount = 1 To optionTypes(labelDictionary.Item(rangeToExport.Cells(rowCounter, 1).value)).count
                            lineData = lineData & """" & optionTypes(labelDictionary.Item(rangeToExport.Cells(rowCounter, 1).value)).Keys()(keyCount - 1) & ""","
                        Next
                        lineData = Left(lineData, Len(lineData) - 1)
                        lineData = lineData & "],"
                    ElseIf (IsNumber(cellValue) And Not TypeName(cellValue) = "String") Then
                        lineData = lineData & """" & cellHeader & """" & ":" & Replace(cellValue, ",", ".") & ","
                    ElseIf (IsBoolean(cellValue)) Then
                        Dim englishBooleanValue
                        englishBooleanValue = rangeToExport.Cells(rowCounter, columnCounter).Formula
                        lineData = lineData & """" & cellHeader & """" & ":" & LCase(Replace(englishBooleanValue, "''", "")) & ","
                    ElseIf (TypeName(cellValue) = "Date") Then
                        lineData = lineData & """" & cellHeader & """" & ":" & """" & Format(cellValue, "yyyymmdd") & """" & ","
                    Else
                        lineData = lineData & """" & cellHeader & """" & ":" & """" & cellValue & """" & ","
                    End If
                End If
            End If
        Next
        If (Not lineData = "") Then
            lineData = Left(lineData, Len(lineData) - 1)
            If rowCounter = rangeToExport.Rows.count Then
                lineData = "{" & lineData & "}"
            Else
                lineData = "{" & lineData & "},"
            End If
        
            json = json & lineData
        End If
    Next
    lineData = Mid(json, Len(json), 1)
    If Mid(json, Len(json), 1) = "," Then
        json = Mid(json, 1, Len(json) - 1)
    End If
    If isFinal Then
        json = json & "]}"
    Else
        json = json & "],"
    End If
    range2json = json
End Function
' Test whether we are dealing with a number
' See also:
' http://www.mrexcel.com/forum/excel-questions/17013-isstring-isnumber-visual-basic-applications.html#post2802732
Function IsNumber(ByVal value As String) As Boolean
  Dim DP As String
  '   Get local setting for decimal point
  DP = Format$(0, ".")
  '   Leave the next statement out if you don't
  '   want to provide for plus/minus signs
  If value Like "[+-]*" Then value = Mid$(value, 2)
  IsNumber = Not value Like "*[!0-9" & DP & "]*" And Not value Like "*" & DP & "*" & DP & "*" And Len(value) > 0 And value <> DP And Not value Like "*[a-zA-Z]"
End Function
Function LowerCaseFirstLetter(Text As String)
    LowerCaseFirstLetter = LCase(Mid(Text, 1, 1)) & Mid(Text, 2, Len(Text) - 1)
End Function
' Test whether we are dealing with a boolean
Private Function IsBoolean(myVar As Variant)
    If VarType(myVar) = vbBoolean Then
        IsBoolean = True
    Else
        IsBoolean = False
    End If
End Function
'Send JSON string to an endpoint
'Example: http://www.posttestserver.com/post.php
Function SendJson(url As String, json As String) As Integer
    'Dim objHTTP As New MSXML2.XMLHTTP
    'Set objHTTP = New MSXML2.XMLHTTP60
    'Dim objHTTP As New MSXML2.XMLHTTP60
    
    On Error GoTo ConnectionError
    
    Dim hash As String
    hash = EncodeBase64(Range("PROJECTID").value & ":" & Range("PASSWORD").value)
    Dim objHTTP As New WinHttp.WinHttpRequest
    'url = "http://localhost:3002"
    objHTTP.Open "POST", url, False
    objHTTP.setRequestHeader "Authorization", "Basic " & hash
    objHTTP.setRequestHeader "Content-Type", "application/json"
    objHTTP.send json
    Debug.Print objHTTP.status
    Debug.Print objHTTP.responseText
    SendJson = objHTTP.status
    If objHTTP.status = 401 Then
        MsgBox "Either the projectID you are trying to create already exists, or you entered a wrong password.", vbOKOnly, "Authentication error"
    End If
    
    Exit Function
ConnectionError:
    MsgBox "The connection with the Excel2Map-server could not be established. The data in this Excel-sheet will be copied to the clipboard. Please use the manual upload mode on the Excel2Map website to create your map.", vbOKOnly, "Could not connect to server"
    CopyText (json)
    objHTTP.Abort
    Set objHTTP = Nothing
End Function
' Example subroutine - not used
Sub range2json2(namedRange As String)
    Dim fs As Object
    Dim jsonFile
    Dim rangeToExport As Range
    Dim rowCounter As Long
    Dim columnCounter As Long
    Dim lineData As String
    
    ' change range here
    Set rangeToExport = Range(namedRange)
    
    Set fs = CreateObject("Scripting.FileSystemObject")
    ' change dir here
    
    Set jsonFile = fs.CreateTextFile("C:\Temp\" & namedRange & ".json", True)
    
    lineData = "{""LayerDefinition"": ["
    jsonFile.WriteLine lineData
    For rowCounter = 2 To rangeToExport.Rows.count
        lineData = ""
        For columnCounter = 1 To rangeToExport.Columns.count
            lineData = lineData & """" & rangeToExport.Cells(1, columnCounter) & """" & ":" & """" & rangeToExport.Cells(rowCounter, columnCounter) & """" & ","
        Next
        lineData = Left(lineData, Len(lineData) - 1)
        If rowCounter = rangeToExport.Rows.count Then
            lineData = "{" & lineData & "}"
        Else
            lineData = "{" & lineData & "},"
        End If
        
        jsonFile.WriteLine lineData
    Next
    lineData = "]}"
    jsonFile.WriteLine lineData
    jsonFile.Close
    
    Set fs = Nothing
End Sub

Sub ColourCells()
'Convert hex values into cell background color
    ActiveWorkbook.Sheets("Layer").Unprotect
    Dim helpers As Worksheet
    Dim layer As Worksheet
    Set helpers = ThisWorkbook.Sheets("Helpers")
    Set layer = ThisWorkbook.Sheets("Layer")
    
    With CreateObject("scripting.Dictionary")
        .Add "Black", "#000000"
        .Add "Red", "#FF0000"
        .Add "Fuchsia", "#FF00FF"
        .Add "Blue", "#0000FF"
        .Add "Teal", "#008080"
        .Add "Green", "#00FF00"
        .Add "Orange", "#FF8800"
        .Add "Yellow", "#FFFF00"
        .Add "Gray", "#808080"
        .Add "White", "#FFFFFF"
    
        If .Exists(Range("FillColor").Cells(1, 1).Text) Then
            Range("FillColor").Cells(1, 1) = .Item(Range("FillColor").Cells(1, 1).Text)
        End If
        If .Exists(Range("StrokeColor").Cells(1, 1).Text) Then
            Range("StrokeColor").Cells(1, 1) = .Item(Range("StrokeColor").Cells(1, 1).Text)
        End If
        If .Exists(Range("SelectedStrokeColor").Cells(1, 1).Text) Then
            Range("SelectedStrokeColor").Cells(1, 1) = .Item(Range("SelectedStrokeColor").Cells(1, 1).Text)
        End If
    
    End With

    Range("FillColor").Cells(1, 1).Interior.Color = RGB(Range("ColorHelpers").Cells(2, 1), Range("ColorHelpers").Cells(2, 2), Range("ColorHelpers").Cells(2, 3))
    Range("StrokeColor").Cells(1, 1).Interior.Color = RGB(Range("ColorHelpers").Cells(2, 4), Range("ColorHelpers").Cells(2, 5), Range("ColorHelpers").Cells(2, 6))
    Range("SelectedStrokeColor").Cells(1, 1).Interior.Color = RGB(Range("ColorHelpers").Cells(2, 7), Range("ColorHelpers").Cells(2, 8), Range("ColorHelpers").Cells(2, 9))
    ActiveWorkbook.Sheets("Layer").Protect
End Sub

Function RemoveForbiddenCharacters(value As Variant) As String
    If Not (IsError(value)) Then
        'hard returns
        If 0 < InStr(value, Chr(10)) Then
            value = Replace(value, Chr(10), "\n")
        End If
        'double quotes
        If 0 < InStr(value, """") Then
            value = Replace(value, """", "'")
        End If
    End If
    RemoveForbiddenCharacters = value
End Function

Sub FillPropertyTypes()
    Call SetNamedRangesOfData
    If Not IsEmpty(Range("PropertyTypes").Cells(2, 1).value) Then
        Dim m As VbMsgBoxResult
        m = MsgBox("Property types are not empty, are you sure you want to overwrite the existing definitions?", vbOKCancel + vbExclamation, "Property types not empty")
        If m = vbCancel Then
            Exit Sub
        End If
    End If
    Dim cellValue
    Dim columnCounter As Integer
    For columnCounter = 1 To Range("HEADERS").Cells.count
        Range("PropertyTypes").Cells(columnCounter + 1, 1).value = Range("HEADERS").Cells(1, columnCounter).value
        Range("PropertyTypes").Cells(columnCounter + 1, 3).value = Range("HEADERS").Cells(1, columnCounter).value
        Range("PropertyTypes").Cells(columnCounter + 1, 10).value = True
        Range("PropertyTypes").Cells(columnCounter + 1, 11).value = True
        cellValue = Range("Properties").Cells(2, columnCounter).value
        Range("PropertyTypes").Cells(columnCounter + 1, 5).value = "text" 'Default = text
        If (Not IsError(cellValue)) Then
            If (Not cellValue = "") Then
                If (IsNumber(cellValue) And Not TypeName(cellValue) = "String") Then
                    Range("PropertyTypes").Cells(columnCounter + 1, 5).value = "number"
                ElseIf (TypeName(cellValue) = "Date") Then
                    Range("PropertyTypes").Cells(columnCounter + 1, 5).value = "date"
                ElseIf (IsBoolean(cellValue)) Then
                    Range("PropertyTypes").Cells(columnCounter + 1, 5).value = "text"
                ElseIf (Left(cellValue, 6) = "http://" Or Left(cellValue, 4) = "www.") Then
                    Range("PropertyTypes").Cells(columnCounter + 1, 5).value = "url"
                End If
            End If
        End If
    Next
End Sub

Sub SetNamedRangesOfData()
'Set the named ranges 'HEADERS' and 'Properties' to their corresponding data
'
    'ActiveWorkbook.Sheets("Data").Select
    Dim LR As Long, LC As Long
    LR = ActiveWorkbook.Sheets("Data").Range("A1").End(xlDown).Row
    LC = ActiveWorkbook.Sheets("Data").Range("A1").End(xlToRight).Column
    'When Data is empty, don't update ranges
    If IsEmpty(ActiveWorkbook.Sheets("Data").Range("A1").value) Then
       Exit Sub
    End If
    'When Data has one column or row, edit cell count
    If IsEmpty(ActiveWorkbook.Sheets("Data").Range("B1").value) Then
        LC = 1
    End If
    If IsEmpty(ActiveWorkbook.Sheets("Data").Range("A2").value) Then
        LR = 1
    End If
    ActiveWorkbook.Names("HEADERS").RefersToR1C1 = Range(ActiveWorkbook.Sheets("Data").Range("A1"), ActiveWorkbook.Sheets("Data").Cells(1, LC))
    ActiveWorkbook.Names("Properties").RefersToR1C1 = Range(ActiveWorkbook.Sheets("Data").Range("A1"), ActiveWorkbook.Sheets("Data").Cells(LR, LC))
    'ActiveWorkbook.Sheets("Layer").Select
End Sub

Sub CreateProject()
    Dim hasHost, hasId As Boolean
    hasHost = checkHost("HOST")
    If (Not hasHost) Then
        MsgBox ("Please enter a host address")
        Exit Sub
    End If
    Call UpdateUrl
    hasId = checkProjectId("PROJECTID")
    If (hasId) Then
        'MsgBox "A project ID was found. Excel2map will use that ID. If you want to create a new project instead, clear the content of the 'ProjectID'-cell.", vbOKOnly, "Project ID found"
        Call RequestProjectId(Range("PROJECTID").Cells(1, 1).value)
        Call UpdateProjectLink
    Else
        'MsgBox "No project ID was found. Excel2map will create a new ID. If you want to continue with a previous project instead, add its ID to the 'ProjectID'-cell.", vbOKOnly, "Project ID not found"
        Call RequestProjectId
    End If
    
End Sub


'Request a new project from the server
Sub RequestProjectId(Optional id As String = "")
    Dim host As String
    host = Range("HOST").Cells(1, 1) & "/requestproject"
    
    On Error GoTo ConnectionError
    
    Dim objHTTP As New WinHttp.WinHttpRequest
    objHTTP.Open "POST", host, False
    objHTTP.setRequestHeader "Content-Type", "application/json"
    If (id = "") Then
        objHTTP.send "{}"
    Else
        Dim data As String
        data = "{""id"":""" + id + """}"
        objHTTP.send (data)
    End If
        
    Debug.Print objHTTP.status
    Debug.Print objHTTP.responseText
    
    'Extract projectID from response
    Dim projectId, projectLink As Range
    Dim responseText, idString As String
    Dim idLocation, idEnd As Integer
    responseText = objHTTP.responseText
    idLocation = InStr(responseText, "id"":""") + 5
    idString = Mid(responseText, idLocation)
    idEnd = InStr(idString, """,""")
    
    Set projectLink = Range("PROJECTLINK")
    Set projectId = Range("PROJECTID")
    projectId.Cells(1, 1) = Mid(idString, 1, idEnd - 1)
    Call UpdateProjectLink
    
    'Extract pw from response
    Dim pwLocation, pwEnd As Integer
    Dim pwString As String
    Dim pw As Range
    pwLocation = InStr(responseText, "password"":""")
    If (Not (pwLocation = 0)) Then
        pwLocation = pwLocation + 11
        pwString = Mid(responseText, pwLocation, 6)
        Set pw = Range("PASSWORD")
        pw.Cells(1, 1) = pwString
    End If
    
    Exit Sub
    
ConnectionError:
    MsgBox "The connection with the Excel2Map-server could not be established. The data in this Excel-sheet will be copied to the clipboard. Please use the manual upload mode on the Excel2Map website to create your map.", vbOKOnly, "Could not connect to server"
    objHTTP.Abort
    Set objHTTP = Nothing
End Sub

'Updates the public link to the project
Sub UpdateProjectLink()
    ActiveWorkbook.Sheets("Layer").Unprotect
    Dim projectLink, projectId, host As Range
    Dim urlString As String
    Set projectLink = Range("PROJECTLINK")
    Set projectId = Range("PROJECTID")
    Set host = Range("HOST")
    urlString = host.Cells(1, 1) + "/?project=" + projectId.Cells(1, 1)
    projectLink.Cells(1, 1) = urlString
    projectLink.Hyperlinks.Delete
    Application.Worksheets("Layer").Hyperlinks.Add Anchor:=projectLink, Address:=urlString, ScreenTip:=urlString, TextToDisplay:=host.value
    ActiveWorkbook.Sheets("Layer").Protect
End Sub

'Update the API url that is the entrance to the MapLayerFactory
Sub UpdateUrl()
    Dim url, host As Range
    Set url = Range("URL")
    Set host = Range("HOST")
    url.Cells(1, 1) = host.Cells(1, 1) + "/projecttemplate"
End Sub


Function convertIconToBase64(iconpath As String) As String
    Dim path As String
    iconpath = Replace(iconpath, "/", "\")
    path = Application.ActiveWorkbook.path & "\" & iconpath

    Const adTypeBinary = 1          ' Binary file is encoded

    ' Variables for encoding
    Dim objXML
    Dim objDocElem

    ' Variable for reading binary picture
    Dim objStream, objFilesystem

    ' Open data stream from picture
    Set objStream = CreateObject("ADODB.Stream")
    objStream.Type = adTypeBinary
    objStream.Open
    
    Set objFilesystem = CreateObject("Scripting.FileSystemObject")
    If Not objFilesystem.FileExists(path) Then
        MsgBox "Icon not found: " & path & ". Default icon will be sent.", vbOKOnly, "Icon not found"
        convertIconToBase64 = "iVBORw0KGgoAAAANSUhEUgAAABoAAAAcCAYAAAB/E6/TAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAYdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuM4zml1AAAAC3SURBVEhL7ZTRDcMgDEQZIaN0A36AORihI7BBRswIGaH1VQeykvSH+KeVn3QKOls2FoTgOM4fEmNccs5V1KgKj2EbpOhDtJVSXlrwEGPaPTjJp4l8d1GfaO/NTCaTQlVNMHaPtfIr7XmkyNoL0hqoRo3WPLoRpqB9nGilPU9K6akKns4IQg7T58FB94LfZHbNMcFVAwgxpt1HX/FDE5urrZGi+GnHuWANj2Fb2Ayvgd2L4Di/TghvwWuLojcu6DcAAAAASUVORK5CYII="
        Exit Function
    End If
        
    objStream.LoadFromFile (path)

    ' Create XML Document object and root node
    ' that will contain the data
    Set objXML = CreateObject("MSXml2.DOMDocument")
    Set objDocElem = objXML.createElement("Base64Data")
    objDocElem.DataType = "bin.base64"

    ' Set binary value
    objDocElem.nodeTypedValue = objStream.Read()

    ' Get base64 value
    convertIconToBase64 = Replace(objDocElem.Text, vbLf, "")

    ' Clean all
    Set objXML = Nothing
    Set objDocElem = Nothing
    Set objStream = Nothing

End Function

Function EncodeBase64(Text As String) As String
  Dim arrData() As Byte
  arrData = StrConv(Text, vbFromUnicode)

  Dim objXML
  Dim objNode

  Set objXML = CreateObject("MSXml2.DOMDocument")
  Set objNode = objXML.createElement("Base64Data")

  objNode.DataType = "bin.base64"
  objNode.nodeTypedValue = arrData
  EncodeBase64 = Replace(objNode.Text, vbLf, "")

  Set objNode = Nothing
  Set objXML = Nothing
End Function

Sub FollowLink()
    Dim projectLink As Range
    Set projectLink = Range("PROJECTLINK")
    projectLink.Hyperlinks(1).Follow
End Sub

Sub ChangeGroupName()
    Dim oldTitle As String
    oldTitle = Range("GROUP_TITLE").Cells(1, 1).value
    If IsEmpty(oldTitle) Then
        MsgBox "The group title you want to change should be entered in the 'Group title' cell", vbExclamation, "Current title not found"
        Exit Sub
    End If
    Dim result As String
    result = InputBox("New group title", "Group title", oldTitle)
    If result <> "" And Not oldTitle = result Then
       Call UpdateGroupTitle(oldTitle, result)
    End If
End Sub

Sub UpdateGroupTitle(oldTitle As String, newTitle As String)
    Dim hasHost, hasId As Boolean
    hasHost = checkHost("HOST")
    If (Not hasHost) Then
        MsgBox ("Please enter a host address")
        Exit Sub
    End If
    Call UpdateUrl
    hasId = checkProjectId("PROJECTID")
    If (Not hasId) Then
        MsgBox "No projectID found"
        Exit Sub
    End If
    
    Dim host As String
    Dim projectId As String
    host = Range("HOST").Cells(1, 1).value & "/updategrouptitle"
    projectId = Range("PROJECTID").Cells(1, 1).value
    Dim data As String
    data = "{""oldTitle"":""" + oldTitle + """,""newTitle"":""" + newTitle + """,""projectId"":""" + projectId + """}"
    Dim status As Integer
    status = SendJson(host, data)
    If status = 200 Then
        Range("GROUP_TITLE").Cells(1, 1).value = newTitle
    End If
End Sub

Sub ClearProject()
    Dim hasHost, hasId As Boolean
    hasHost = checkHost("HOST")
    If (Not hasHost) Then
        MsgBox ("Please enter a host address")
        Exit Sub
    End If
    Call UpdateUrl
    hasId = checkProjectId("PROJECTID")
    If (Not hasId) Then
        MsgBox "No projectID found"
        Exit Sub
    End If

    Dim m As VbMsgBoxResult
    m = MsgBox("This will delete ALL layers and groups from your project. Are you sure?", vbOKCancel + vbExclamation, "Cleaning project")
    If m = vbCancel Then
        Exit Sub
    End If
    
    Dim host As String
    Dim projectId As String
    host = Range("HOST").Cells(1, 1).value & "/clearproject"
    projectId = Range("PROJECTID").Cells(1, 1).value
    Dim data As String
    data = "{""projectId"":""" + projectId + """}"
    Dim status As Integer
    status = SendJson(host, data)
End Sub

'http://stackoverflow.com/a/25336423
Sub CopyText(Text As String)
    'VBA Macro using late binding to copy text to clipboard.
    'By Justin Kay, 8/15/2014
    'Thanks to http://akihitoyamashiro.com/en/VBA/LateBindingDataObject.htm
    Dim MSForms_DataObject As Object
    Set MSForms_DataObject = CreateObject("new:{1C3B4210-F441-11CE-B9EA-00AA006B1A69}")
    MSForms_DataObject.SetText Text
    MSForms_DataObject.PutInClipboard
    Set MSForms_DataObject = Nothing
End Sub
