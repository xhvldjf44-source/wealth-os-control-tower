import { exec } from "child_process";

const command = `ffmpeg -y -i output/luxury-short.mp4 -vf "drawtext=text='Premium Mood':fontcolor=white:fontsize=64:x=(w-text_w)/2:y=260:box=1:boxcolor=black@0.35:boxborderw=30,drawtext=text='가격 보고 더 놀람':fontcolor=yellow:fontsize=54:x=(w-text_w)/2:y=1500:box=1:boxcolor=black@0.35:boxborderw=24" -c:a copy output/luxury-short-caption.mp4`;

exec(command, (err, stdout, stderr) => {
  if (err) {
    console.error("❌ 자막 생성 실패");
    console.error(stderr);
    return;
  }
  console.log("👑 고급 자막 쇼츠 생성 완료");
});
