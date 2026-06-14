$time = Get-Date -Format "yyyyMMdd_HHmmss"

mkdir ".\backup\$time" -Force

Copy-Item ".\output" ".\backup\$time\output" -Recurse -Force
Copy-Item ".\uploads" ".\backup\$time\uploads" -Recurse -Force
Copy-Item ".\queue" ".\backup\$time\queue" -Recurse -Force
Copy-Item ".\src" ".\backup\$time\src" -Recurse -Force

Write-Host "🔥 WEALTH OS BACKUP COMPLETE"
