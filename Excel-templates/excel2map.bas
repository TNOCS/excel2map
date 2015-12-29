Attribute VB_Name = "Excel2Map"
Option Explicit
' Export the data to the map application
Sub export2map()
    Dim fs As Object
    Dim projectId As Range
    Dim json As String
    Dim jsonFile
    Dim cd, dest
    Dim passedCheck As Boolean
    
    Call ColourCells
    Call CreateProject
    Call SetNamedRangesOfData
    Call RemoveForbiddenCharacters("Properties")
    Call RemoveForbiddenCharacters("PropertyTypes")
    Call RemoveForbiddenCharacters("LayerDefinitionRow1")
    Call RemoveForbiddenCharacters("LayerDefinitionRow2")
    
    json = ""
    json = json & range2json("LayerDefinition", True, False, True, False)
    json = json & range2json("PropertyTypes", False, False, True, False)
        
    passedCheck = checkHost("HOST")
    If (Not passedCheck) Then Exit Sub
    Call UpdateUrl
        
    passedCheck = checkProjectId("PROJECTID")
    If (Not passedCheck) Then Exit Sub
    Call UpdateProjectLink
    
    json = json & range2json("Properties", False, False, False, True)
    
    'Add the projectId and Icon (in base64)
    Dim icon As String
    icon = convertIconToBase64(Range("ICON").Cells(1, 1))
    json = json & """iconBase64"":""" & icon & ""","
    
    Set projectId = Range("PROJECTID")
    json = json & """projectId"":""" & projectId.Cells(1, 1) & """}"

    'Write output to file
    If (Not IsEmpty(Range("Debugging").Cells(1, 1).Value)) And (Range("Debugging").Cells(1, 1) > 0) Then
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
    If IsEmpty(idRange.Cells(1, 1).Value) = True Then
        checkProjectId = False
    Else
        checkProjectId = True
    End If
End Function

Private Function checkHost(namedRange As String) As Boolean
    Dim hostRange As Range
    Set hostRange = Range(namedRange)
    If IsEmpty(hostRange.Cells(1, 1).Value) = True Then
        MsgBox "No project ID found, please request an ID before uploading the data."
        checkHost = False
    ElseIf Right(hostRange.Cells(1, 1), 1) = "/" Then
        hostRange.Cells(1, 1) = Left(hostRange.Cells(1, 1), Len(hostRange.Cells(1, 1)) - 1)
        checkHost = checkHost(namedRange)
    Else
        checkHost = True
    End If
End Function

' Convert a named cell range to JSON.
' Parameters are whether the string should include the optional start { and end }.
Private Function range2json(namedRange As String, isStart As Boolean, isFinal As Boolean, firstLetterToLower As Boolean, preventDuplicateHeaders As Boolean) As String
    Dim json As String ' New System.Text.StringBuilder()
    Dim rangeToExport As Range
    Dim rowCounter As Long
    Dim columnCounter As Long
    Dim lineData As String
    Dim cellValue
    Dim cellHeader As String
    
    ' change range here
    ' LayerDefinition is split in two rows. To concatenate, copy both rows to the Helpers
    ' sheet and select the horizontally concatenated row as the final LayerDefinition range.
    ' Also, replace geometryType parameters to "Parameter 1, 2", etc.
    If namedRange = "LayerDefinition" Then
        Dim rowLength As Integer
        rowLength = Range("LayerDefinitionRow1").Columns.Count
        Range("LayerDefinitionRow1").Copy Range("LayerDefinitionMerged").Cells(1, 1)
        Range("LayerDefinitionRow2").Copy Range("LayerDefinitionMerged").Cells(1, 1 + rowLength)
        Range("Parameters").Cells(1, 1).Value = "Parameter1"
        Range("Parameters").Cells(1, 2).Value = "Parameter2"
        Range("Parameters").Cells(1, 3).Value = "Parameter3"
        Range("Parameters").Cells(1, 4).Value = "Parameter4"
        Dim file, key As String
        file = Application.WorksheetFunction.VLookup(Range("GEOMETRY_TYPE").Cells(1, 1).Value, Range("GEOMETRY_DATA"), 6, False)
        key = Application.WorksheetFunction.VLookup(Range("GEOMETRY_TYPE").Cells(1, 1).Value, Range("GEOMETRY_DATA"), 7, False)
        Range("LD_GEOMETRY").Cells(1, 1).Value = "GeometryFile"
        Range("LD_GEOMETRY").Cells(1, 2).Value = "GeometryKey"
        Range("LD_GEOMETRY").Cells(2, 1).Value = file
        Range("LD_GEOMETRY").Cells(2, 2).Value = key
        
    End If
    Set rangeToExport = Range(namedRange)
    namedRange = LowerCaseFirstLetter(namedRange)
    
    If isStart Then
        lineData = "{""" & namedRange & """: ["
    Else
        lineData = """" & namedRange & """: ["
    End If
    json = json & lineData
    For rowCounter = 2 To rangeToExport.Rows.Count
        lineData = ""
        For columnCounter = 1 To rangeToExport.Columns.Count
            cellValue = rangeToExport.Cells(rowCounter, columnCounter)
            If (firstLetterToLower) Then
                cellHeader = LowerCaseFirstLetter(rangeToExport.Cells(1, columnCounter))
            Else
                cellHeader = rangeToExport.Cells(1, columnCounter)
            End If
            If (preventDuplicateHeaders) Then
                cellHeader = cellHeader & Format(columnCounter, "000000")
            End If
            'cellHeader = LCase(Mid(cellHeader, 1, 1)) & Mid(cellHeader, 2, Len(cellHeader) - 1)
            If (Not IsError(cellValue)) Then
                If (Not cellValue = "") Then
                    If (IsNumber(cellValue) And Not TypeName(cellValue) = "String") Then
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
            If rowCounter = rangeToExport.Rows.Count Then
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
Function IsNumber(ByVal Value As String) As Boolean
  Dim DP As String
  '   Get local setting for decimal point
  DP = Format$(0, ".")
  '   Leave the next statement out if you don't
  '   want to provide for plus/minus signs
  If Value Like "[+-]*" Then Value = Mid$(Value, 2)
  IsNumber = Not Value Like "*[!0-9" & DP & "]*" And Not Value Like "*" & DP & "*" & DP & "*" And Len(Value) > 0 And Value <> DP And Not Value Like "*[a-zA-Z]"
End Function
Function LowerCaseFirstLetter(text As String)
    LowerCaseFirstLetter = LCase(Mid(text, 1, 1)) & Mid(text, 2, Len(text) - 1)
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
Sub SendJson(url As String, json As String)
    'Dim objHTTP As New MSXML2.XMLHTTP
    'Set objHTTP = New MSXML2.XMLHTTP60
    'Dim objHTTP As New MSXML2.XMLHTTP60
    Dim hash As String
    hash = EncodeBase64(Range("PROJECTID").Value & ":" & Range("PASSWORD").Value)
    Dim objHTTP As New WinHttp.WinHttpRequest
    'url = "http://localhost:3002"
    objHTTP.Open "POST", url, False
    objHTTP.setRequestHeader "Authorization", "Basic " & hash
    objHTTP.setRequestHeader "Content-Type", "application/json"
    objHTTP.send json
    Debug.Print objHTTP.Status
    Debug.Print objHTTP.responseText
End Sub
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
    For rowCounter = 2 To rangeToExport.Rows.Count
        lineData = ""
        For columnCounter = 1 To rangeToExport.Columns.Count
            lineData = lineData & """" & rangeToExport.Cells(1, columnCounter) & """" & ":" & """" & rangeToExport.Cells(rowCounter, columnCounter) & """" & ","
        Next
        lineData = Left(lineData, Len(lineData) - 1)
        If rowCounter = rangeToExport.Rows.Count Then
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
    
        If .Exists(Range("FillColor").Cells(1, 1).text) Then
            Range("FillColor").Cells(1, 1) = .Item(Range("FillColor").Cells(1, 1).text)
        End If
        If .Exists(Range("StrokeColor").Cells(1, 1).text) Then
            Range("StrokeColor").Cells(1, 1) = .Item(Range("StrokeColor").Cells(1, 1).text)
        End If
        If .Exists(Range("SelectedStrokeColor").Cells(1, 1).text) Then
            Range("SelectedStrokeColor").Cells(1, 1) = .Item(Range("SelectedStrokeColor").Cells(1, 1).text)
        End If
    
    End With

    Range("FillColor").Cells(1, 1).Interior.Color = RGB(Range("ColorHelpers").Cells(2, 1), Range("ColorHelpers").Cells(2, 2), Range("ColorHelpers").Cells(2, 3))
    Range("StrokeColor").Cells(1, 1).Interior.Color = RGB(Range("ColorHelpers").Cells(2, 4), Range("ColorHelpers").Cells(2, 5), Range("ColorHelpers").Cells(2, 6))
    Range("SelectedStrokeColor").Cells(1, 1).Interior.Color = RGB(Range("ColorHelpers").Cells(2, 7), Range("ColorHelpers").Cells(2, 8), Range("ColorHelpers").Cells(2, 9))
End Sub

Sub RemoveForbiddenCharacters(namedRange As String)
    Dim MyRange, RangeCounter As Range
    Application.ScreenUpdating = False
    Application.Calculation = xlCalculationManual
    
    Set MyRange = Range(namedRange)
    For Each RangeCounter In MyRange
        If Not (IsError(RangeCounter.Value)) Then
            'hard returns
            If 0 < InStr(RangeCounter, Chr(10)) Then
                RangeCounter = Replace(RangeCounter, Chr(10), " ")
            End If
            'double quotes
            If 0 < InStr(RangeCounter, """") Then
                RangeCounter = Replace(RangeCounter, """", "'")
            End If
        End If
    Next
 
    Application.ScreenUpdating = True
    Application.Calculation = xlCalculationAutomatic
End Sub

Sub FillPropertyTypes()
    Call SetNamedRangesOfData
    Dim columnCounter As Integer
    For columnCounter = 1 To Range("HEADERS").Cells.Count
        Range("PropertyTypes").Cells(columnCounter + 1, 1).Value = Range("HEADERS").Cells(1, columnCounter).Value
        Range("PropertyTypes").Cells(columnCounter + 1, 3).Value = Range("HEADERS").Cells(1, columnCounter).Value
        Range("PropertyTypes").Cells(columnCounter + 1, 10).Value = True
        Range("PropertyTypes").Cells(columnCounter + 1, 11).Value = True
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
    If IsEmpty(ActiveWorkbook.Sheets("Data").Range("A1").Value) Then
       Exit Sub
    End If
    'When Data has one column or row, edit cell count
    If IsEmpty(ActiveWorkbook.Sheets("Data").Range("B1").Value) Then
        LC = 1
    End If
    If IsEmpty(ActiveWorkbook.Sheets("Data").Range("A2").Value) Then
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
        Call RequestProjectId(Range("PROJECTID").Cells(1, 1).Value)
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
    Debug.Print objHTTP.Status
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
End Sub

'Updates the public link to the project
Sub UpdateProjectLink()
    Dim projectLink, projectId, host As Range
    Dim urlString As String
    Set projectLink = Range("PROJECTLINK")
    Set projectId = Range("PROJECTID")
    Set host = Range("HOST")
    urlString = host.Cells(1, 1) + "/?project=" + projectId.Cells(1, 1)
    projectLink.Cells(1, 1) = urlString
    projectLink.Hyperlinks.Delete
    Application.Worksheets("Layer").Hyperlinks.Add Anchor:=projectLink, Address:=urlString, ScreenTip:=urlString, TextToDisplay:=host.Value
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
        MsgBox "Icon not found: " & path, vbOKOnly, "Icon not found"
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
    convertIconToBase64 = Replace(objDocElem.text, vbLf, "")

    ' Clean all
    Set objXML = Nothing
    Set objDocElem = Nothing
    Set objStream = Nothing

End Function

Function EncodeBase64(text As String) As String
  Dim arrData() As Byte
  arrData = StrConv(text, vbFromUnicode)

  Dim objXML
  Dim objNode

  Set objXML = CreateObject("MSXml2.DOMDocument")
  Set objNode = objXML.createElement("Base64Data")

  objNode.DataType = "bin.base64"
  objNode.nodeTypedValue = arrData
  EncodeBase64 = Replace(objNode.text, vbLf, "")

  Set objNode = Nothing
  Set objXML = Nothing
End Function

Sub FollowLink()
    Dim projectLink As Range
    Set projectLink = Range("PROJECTLINK")
    projectLink.Hyperlinks(1).Follow
End Sub
