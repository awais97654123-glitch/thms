$WshShell = New-Object -comObject WScript.Shell
$DesktopPath = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Desktop)
$ShortcutPath = Join-Path -Path $DesktopPath -ChildPath "The Hayatabad Model School Admin.lnk"
$IconPath = "d:\projects\app\ten\src-tauri\icons\icon.ico"
$VbsPath = "d:\projects\app\ten\The-Hayatabad-School-Admin.vbs"

$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "wscript.exe"
$Shortcut.Arguments = "`"$VbsPath`""
$Shortcut.WorkingDirectory = "d:\projects\app\ten"
$Shortcut.WindowStyle = 7 # Minimized/Hidden
$Shortcut.Description = "The Hayatabad Model School Admin ERP Desktop Application"
if (Test-Path $IconPath) {
    $Shortcut.IconLocation = "$IconPath,0"
}
$Shortcut.Save()

Write-Host "Desktop shortcut created with school logo icon at: $ShortcutPath"
