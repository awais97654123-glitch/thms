' The Hayatabad Model School - Silent Native App Launcher
' Launches Admin ERP directly with 0 console or terminal window popup

Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "d:\projects\app\ten"
WshShell.Run "powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File ""d:\projects\app\ten\scripts\launch-admin-app.ps1""", 0, False
