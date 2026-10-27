Add-Type -AssemblyName System.Drawing

function Generate-AppIcon([int]$size, [string]$outputPath) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    # Background rounded rect or circle with nice blue gradient
    $rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.PointF(0, 0)),
        (New-Object System.Drawing.PointF($size, $size)),
        ([System.Drawing.Color]::FromArgb(255, 6, 182, 212)),  # Cyan 500
        ([System.Drawing.Color]::FromArgb(255, 29, 78, 216))   # Blue 700
    )
    $g.FillRectangle($brush, $rect)

    # Draw droplet shape
    $dropPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $cx = $size / 2.0
    $topY = $size * 0.18
    $midY = $size * 0.52
    $botY = $size * 0.82
    $radius = $size * 0.28

    # Droplet top point to bottom curve
    $dropPath.AddLine($cx, $topY, ($cx + $radius), $midY)
    $dropPath.AddArc(($cx - $radius), ($botY - $radius * 2), ($radius * 2), ($radius * 2), 0, 180)
    $dropPath.AddLine(($cx - $radius), $midY, $cx, $topY)

    $dropBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 255, 255))
    $g.FillPath($dropBrush, $dropPath)

    # Inner droplet shine
    $shinePath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $sRadius = $radius * 0.45
    $shinePath.AddArc(($cx - $radius * 0.7), ($botY - $radius * 1.6), $sRadius, $sRadius, 180, 90)
    $shinePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(180, 2, 132, 199), ($size * 0.035))
    $g.DrawPath($shinePen, $shinePath)

    # Clean up and save
    $g.Dispose()
    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Created: $outputPath"
}

Generate-AppIcon 192 "public\icon-192.png"
Generate-AppIcon 512 "public\icon-512.png"
Generate-AppIcon 192 "public\icon-maskable-192.png"
Generate-AppIcon 512 "public\icon-maskable-512.png"
