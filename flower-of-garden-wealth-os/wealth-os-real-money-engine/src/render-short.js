import { exec } from "child_process";

const command = `
ffmpeg -y ^
-loop 1 ^
-i assets/images/sample.jpg ^
-vf "scale=1080:1920,zoompan=z='min(zoom+0.0005,1.1)':d=125" ^
-t 5 ^
-r 30 ^
output/luxury-short.mp4
`;

exec(command, (err) => {
  if(err){
    console.log(err);
    return;
  }

  console.log("🔥 CINEMATIC SHORT 생성 완료");
});
