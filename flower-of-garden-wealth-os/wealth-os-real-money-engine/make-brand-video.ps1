mkdir output -Force

ffmpeg -y -f lavfi -i "color=c=black:s=1080x1920:d=5" -vf "drawtext=text=WEALTH_OS:fontcolor=white:fontsize=90:x=(w-text_w)/2:y=700,drawtext=text=Luxury_Commerce_Engine:fontcolor=yellow:fontsize=52:x=(w-text_w)/2:y=900,drawtext=text=AI_Powered_Brand:fontcolor=white:fontsize=40:x=(w-text_w)/2:y=1020" -pix_fmt yuv420p ".\output\wealth-os-brand.mp4"

dir output

Invoke-Item ".\output\wealth-os-brand.mp4"
