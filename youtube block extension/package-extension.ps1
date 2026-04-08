param(
  [string]$OutFile = "youtube-home-blocker-v1.0.0.zip"
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$output = Join-Path $root $OutFile

$files = @(
  "manifest.json",
  "content.js",
  "popup.html",
  "popup.css",
  "popup.js"
)

foreach ($file in $files) {
  $path = Join-Path $root $file
  if (-not (Test-Path $path)) {
    throw "Missing required file: $file"
  }
}

if (Test-Path $output) {
  Remove-Item $output -Force
}

$filePaths = $files | ForEach-Object { Join-Path $root $_ }
Compress-Archive -Path $filePaths -DestinationPath $output -CompressionLevel Optimal

Write-Host "Packaged extension: $output"
