# C372 CA1: push REAL changes to a SEPARATE GitHub repository.
# Run in the extracted project folder from the VS Code PowerShell terminal.
# First use: .\push-ca1.ps1 -RepoUrl "https://github.com/YOUR_USERNAME/C372-CA1-PetCareApp.git" -Message "CA1: import current PetCareApp project"
# Later use: .\push-ca1.ps1 -Message "CA1: test and fix pet booking workflow"
param(
    [string]$RepoUrl = "",
    [string]$Message = "CA1: update PetCareApp with tested changes"
)

$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot

function Invoke-Git([string[]]$Arguments) {
    & git @Arguments
    if ($LASTEXITCODE -ne 0) { throw "Git command failed: git $($Arguments -join ' ')" }
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    throw 'Git is not installed. Install Git for Windows, restart VS Code, and try again.'
}
if (-not (Test-Path 'package.json') -or -not (Test-Path 'app.js')) {
    throw 'This is not the PetCareApp project folder. Move this script to the folder containing package.json and app.js.'
}
if ($RepoUrl -and $RepoUrl -notmatch '^(https://github\.com/[^/]+/[^/]+(?:\.git)?|git@github\.com:[^/]+/[^/]+(?:\.git)?)$') {
    throw 'Provide your new, separate CA1 GitHub repository URL (HTTPS or SSH).'
}
if ($RepoUrl -and $RepoUrl -match '(?i)c372wk1(?:\.git)?$') {
    throw 'C372wk1 is your weekly lesson repository. CA1 requires a separate repository.'
}
if (-not (Test-Path '.git')) {
    Write-Host 'Initializing a NEW Git repository on the current date...'
    Invoke-Git -Arguments @('init', '-b', 'main')
}

$userName = & git config user.name
$userEmail = & git config user.email
if (-not $userName -or -not $userEmail) {
    throw 'Set your real Git name/email first: git config --global user.name "Your Name" and git config --global user.email "your-email@example.com"'
}

$existingRemote = (& git remote get-url origin 2>$null)
if ($LASTEXITCODE -ne 0) { $existingRemote = '' }
if ($existingRemote) {
    if ($existingRemote -match '(?i)c372wk1(?:\.git)?$') {
        throw 'Origin points to the weekly lesson repo. Create/select a separate CA1 repository before pushing.'
    }
    if ($RepoUrl -and ($existingRemote.TrimEnd('/') -ne $RepoUrl.TrimEnd('/'))) {
        throw "Origin already points to $existingRemote. Will not change it automatically."
    }
} elseif ($RepoUrl) {
    Invoke-Git -Arguments @('remote', 'add', 'origin', $RepoUrl)
    $existingRemote = $RepoUrl
} else {
    throw 'First push requires -RepoUrl. Create an empty separate CA1 GitHub repository and provide its URL.'
}

# Never stage local credentials / dependencies, even if someone edited .gitignore.
Invoke-Git -Arguments @('add', '--all', '--', '.', ':(exclude).env', ':(exclude)node_modules')
$staged = @(& git diff --cached --name-only)
if ($staged | Where-Object { $_ -eq '.env' -or $_ -like 'node_modules/*' }) {
    throw 'Sensitive or dependency files were staged. Unstage them before pushing.'
}
if ($staged.Count -gt 0) {
    Write-Host 'Staged changes:'
    $staged | ForEach-Object { Write-Host "  $_" }
    Invoke-Git -Arguments @('commit', '-m', $Message)
} else {
    Write-Host 'No new file changes to commit. Checking for commits to push...'
}

$currentBranch = (& git branch --show-current).Trim()
if (-not $currentBranch) { throw 'No local branch or commits exist yet. Make a real change first.' }
Invoke-Git -Arguments @('push', '-u', 'origin', $currentBranch)
Write-Host "Successfully pushed $currentBranch to $existingRemote."
Write-Host 'IMPORTANT: A push made today is NOT evidence of a push in an earlier week.'
