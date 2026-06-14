mkdir output -Force

ffmpeg -y -f lavfi -i "testsrc=size=1080x1920:rate=30" -t 5 -pix_fmt yuv420p ".\output\wealth-os-luxury.mp4"

Write-Host "생성 확인:"
dir output

Write-Host "영상 실행:"
Invoke-Item ".\output\wealth-os-luxury.mp4"
