Add-Type -AssemblyName System.Drawing

$sourcePath = "C:\Users\abuba\.gemini\antigravity-ide\brain\c08a309f-c07f-44e9-98e4-df31a7a8fa0b\.user_uploaded\media_1788077842488.jpg"
$publicDir = "d:\projects\app\ten\public"
$tauriIconsDir = "d:\projects\app\ten\src-tauri\icons"

if (-not (Test-Path $sourcePath)) {
    Write-Error "Source image not found at $sourcePath"
    exit 1
}

if (-not (Test-Path $tauriIconsDir)) {
    New-Item -ItemType Directory -Force -Path $tauriIconsDir | Out-Null
}

$srcImage = [System.Drawing.Image]::FromFile($sourcePath)
Write-Host "Loaded Source Logo: $($srcImage.Width) x $($srcImage.Height)"

function Resize-And-Save-Png {
    param(
        [System.Drawing.Image]$Image,
        [int]$Width,
        [int]$Height,
        [string]$DestinationPath
    )

    $bitmap = New-Object System.Drawing.Bitmap($Width, $Height)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    $graphics.DrawImage($Image, 0, 0, $Width, $Height)
    $bitmap.Save($DestinationPath, [System.Drawing.Imaging.ImageFormat]::Png)

    $graphics.Dispose()
    $bitmap.Dispose()
    Write-Host "Generated: $DestinationPath ($Width x $Height)"
}

# 1. Save Full-Resolution Public Logos
Resize-And-Save-Png -Image $srcImage -Width 1024 -Height 1024 -DestinationPath "$publicDir\school-logo.png"
Resize-And-Save-Png -Image $srcImage -Width 512 -Height 512 -DestinationPath "$publicDir\logo.png"
Resize-And-Save-Png -Image $srcImage -Width 512 -Height 512 -DestinationPath "$publicDir\icon.png"
Resize-And-Save-Png -Image $srcImage -Width 512 -Height 512 -DestinationPath "$tauriIconsDir\icon.png"
Resize-And-Save-Png -Image $srcImage -Width 512 -Height 512 -DestinationPath "$tauriIconsDir\512x512.png"
Resize-And-Save-Png -Image $srcImage -Width 256 -Height 256 -DestinationPath "$tauriIconsDir\256x256.png"
Resize-And-Save-Png -Image $srcImage -Width 128 -Height 128 -DestinationPath "$tauriIconsDir\128x128.png"
Resize-And-Save-Png -Image $srcImage -Width 256 -Height 256 -DestinationPath "$tauriIconsDir\128x128@2x.png"
Resize-And-Save-Png -Image $srcImage -Width 32 -Height 32 -DestinationPath "$tauriIconsDir\32x32.png"

# 2. Save UWP / Windows Store Tiles
$uwpTiles = @(
    "Square30x30Logo.png",
    "Square44x44Logo.png",
    "Square71x71Logo.png",
    "Square89x89Logo.png",
    "Square107x107Logo.png",
    "Square142x142Logo.png",
    "Square150x150Logo.png",
    "Square284x284Logo.png",
    "Square310x310Logo.png",
    "StoreLogo.png"
)

foreach ($tile in $uwpTiles) {
    Resize-And-Save-Png -Image $srcImage -Width 150 -Height 150 -DestinationPath "$tauriIconsDir\$tile"
}

# 3. Create Windows Multi-Size ICO File (16, 32, 48, 64, 128, 256)
function Create-Ico-File {
    param(
        [System.Drawing.Image]$Image,
        [string]$IcoPath
    )

    $sizes = @(16, 32, 48, 64, 128, 256)
    $pngStreams = @()

    foreach ($sz in $sizes) {
        $bmp = New-Object System.Drawing.Bitmap($sz, $sz)
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $g.DrawImage($Image, 0, 0, $sz, $sz)
        
        $ms = New-Object System.IO.MemoryStream
        $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
        $bytes = $ms.ToArray()
        
        $pngStreams += @{
            Size = $sz
            Bytes = $bytes
        }

        $g.Dispose()
        $bmp.Dispose()
        $ms.Dispose()
    }

    $fs = [System.IO.File]::Create($IcoPath)
    $bw = New-Object System.IO.BinaryWriter($fs)

    # ICO Header: Reserved (0), Type (1), Count
    $bw.Write([uint16]0)
    $bw.Write([uint16]1)
    $bw.Write([uint16]$pngStreams.Count)

    $offset = 6 + ($pngStreams.Count * 16)

    foreach ($item in $pngStreams) {
        $szVal = if ($item.Size -eq 256) { 0 } else { $item.Size }
        $bw.Write([byte]$szVal)        # Width
        $bw.Write([byte]$szVal)        # Height
        $bw.Write([byte]0)            # Color count
        $bw.Write([byte]0)            # Reserved
        $bw.Write([uint16]1)          # Color planes
        $bw.Write([uint16]32)         # Bit depth
        $bw.Write([uint32]$item.Bytes.Length) # Image bytes count
        $bw.Write([uint32]$offset)    # File offset
        $offset += $item.Bytes.Length
    }

    foreach ($item in $pngStreams) {
        $bw.Write($item.Bytes)
    }

    $bw.Flush()
    $bw.Close()
    $fs.Close()
    Write-Host "Created Multi-Resolution Windows ICO: $IcoPath"
}

Create-Ico-File -Image $srcImage -IcoPath "$tauriIconsDir\icon.ico"
Create-Ico-File -Image $srcImage -IcoPath "$publicDir\favicon.ico"

$srcImage.Dispose()
Write-Host "🎉 Official School Crest Icons successfully processed!"
