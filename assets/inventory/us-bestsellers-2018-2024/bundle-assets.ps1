$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$assetBase = $PSScriptRoot
$workspace = (Resolve-Path -LiteralPath (Join-Path $assetBase '../../..')).Path
$webDirectory = Join-Path $workspace 'public/images/inventory/us-bestsellers-2018-2024'
$outputDirectory = Join-Path $workspace 'output/inventory'
[System.IO.Directory]::CreateDirectory($outputDirectory) | Out-Null
$destination = Join-Path $outputDirectory 'farnsworth-inventory-20.zip'
if (Test-Path -LiteralPath $destination) { throw "Archive already exists: $destination" }
$manifest = Get-Content -LiteralPath (Join-Path $webDirectory 'manifest.json') -Raw | ConvertFrom-Json
if ($manifest.count -ne 20) { throw 'All 20 assets must be packaged before making the archive.' }
$archive = [System.IO.Compression.ZipFile]::Open($destination, [System.IO.Compression.ZipArchiveMode]::Create)
try {
  foreach ($assetFile in Get-ChildItem -LiteralPath $webDirectory -File) {
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $assetFile.FullName, ('web/' + $assetFile.Name), [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
  }
  foreach ($assetFile in Get-ChildItem -LiteralPath (Join-Path $assetBase 'originals') -File -Filter '*.png') {
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $assetFile.FullName, ('originals/' + $assetFile.Name), [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
  }
  [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, (Join-Path $assetBase 'generation-plan.json'), 'prompts-and-selection.json', [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
  $readmeEntry = $archive.CreateEntry('README.txt')
  $writer = [System.IO.StreamWriter]::new($readmeEntry.Open())
  try {
    $writer.WriteLine('FARNSWORTH MOTORS / 20 INVENTORY IMAGE ASSETS')
    $writer.WriteLine('Generated with the built-in image generation tool, September 8, 2026.')
    $writer.WriteLine('')
    $writer.WriteLine('Open web/index.html to browse and download individual assets offline.')
    $writer.WriteLine('web/contact-sheet.jpg shows the complete labeled collection.')
    $writer.WriteLine('originals/ contains the 20 unaltered 1536x1024 PNG source images.')
    $writer.WriteLine('web/ contains full-size WebP files plus 800px card WebP files.')
    $writer.WriteLine('web/manifest.json maps every image to its model year, make, model, trim, color, and project URL.')
    $writer.WriteLine('prompts-and-selection.json contains the complete generation prompts and sales-selection sources.')
    $writer.WriteLine('')
    $writer.WriteLine('These are AI-generated illustrative sample assets, not photographs of actual Farnsworth inventory. Vehicle styling and trim details are approximations. This is a curated group of popular US nameplates with 2018-2024 model years, not a computed cumulative sales ranking. No price, VIN, repair history, or availability is asserted. Use specific-vehicle photographs for live listings.')
  } finally { $writer.Dispose() }
} finally { $archive.Dispose() }
$verify = [System.IO.Compression.ZipFile]::OpenRead($destination)
try {
  $pngCount = @($verify.Entries | Where-Object { $_.FullName -like 'originals/*.png' }).Count
  $webpCount = @($verify.Entries | Where-Object { $_.FullName -like 'web/*.webp' }).Count
  if ($pngCount -ne 20 -or $webpCount -ne 40) { throw 'Archive image count does not match the required deliverables.' }
  [pscustomobject]@{Archive=$destination; OriginalPNGs=$pngCount; WebPFiles=$webpCount; EntryCount=$verify.Entries.Count; Bytes=(Get-Item -LiteralPath $destination).Length} | ConvertTo-Json
} finally { $verify.Dispose() }
