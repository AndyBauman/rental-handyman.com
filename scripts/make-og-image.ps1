Add-Type -AssemblyName System.Drawing
$bmp = New-Object Drawing.Bitmap 1200, 630
$g = [Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = 'AntiAlias'
$g.TextRenderingHint = 'AntiAlias'
$g.Clear([Drawing.Color]::FromArgb(15, 23, 42))
$titleFont = [System.Drawing.Font]::new('Segoe UI', 44, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$subFont = [System.Drawing.Font]::new('Segoe UI', 26, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$accent = [Drawing.SolidBrush]::new([Drawing.Color]::FromArgb(251, 191, 36))
$white = [Drawing.Brushes]::White
$gray = [Drawing.SolidBrush]::new([Drawing.Color]::FromArgb(148, 163, 184))
$g.DrawString('Rental Handyman', $titleFont, $white, 72, 180)
$g.DrawString('Clark County, WA', $subFont, $accent, 72, 260)
$g.DrawString('Rental turnovers · Property management repairs · Make-ready', $subFont, $gray, 72, 330)
$g.DrawString('rental-handyman.com', $subFont, $gray, 72, 500)
$out = Join-Path $PSScriptRoot '..\og-image.png'
$bmp.Save($out, [Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()
$titleFont.Dispose()
$subFont.Dispose()
$accent.Dispose()
$gray.Dispose()
Write-Host "Wrote $out"
