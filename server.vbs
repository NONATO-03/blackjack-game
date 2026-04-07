' Simple HTTP Server in VBScript
Set objHTTP = CreateObject("Microsoft.XMLHTTP")
Set objShell = CreateObject("WScript.Shell")

' Define port
port = 8000
path = objShell.CurrentDirectory & "\public"

' Try to create server using netsh command
Dim command
command = "netsh http add urlacl url=http://+:" & port & "/ user=everyone"
objShell.Run command, 0, True

MsgBox "Server would start on http://localhost:" & port & vbCrLf & _
       "Path: " & path & vbCrLf & vbCrLf & _
       "Note: VBScript HTTP server requires COM+ which may not be available." & vbCrLf & _
       "Please use a proper HTTP server instead.", vbInformation, "Blackjack Game Server"
