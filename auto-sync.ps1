Write-Host "Starting Continuous Auto-Sync to GitHub..."
Write-Host "This script will watch for changes and push them automatically every 15 seconds."
Write-Host "Press Ctrl+C to stop."
Write-Host "--------------------------------------------------------"

while ($true) {
    # Check if there are any changes (modified, added, or deleted files)
    $status = git status --porcelain
    
    if ($status) {
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Write-Host "[$timestamp] Changes detected. Committing and pushing to GitHub..."
        
        git add .
        git commit -m "Auto-sync update: $timestamp"
        git push origin main
        
        Write-Host "[$timestamp] Successfully synced to GitHub!"
        Write-Host "--------------------------------------------------------"
    }
    
    # Wait for 15 seconds before checking again
    Start-Sleep -Seconds 15
}
