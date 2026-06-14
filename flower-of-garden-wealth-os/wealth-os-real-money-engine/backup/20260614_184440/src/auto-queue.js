import fs from "fs";

const products = JSON.parse(
  fs.readFileSync("output/top-products.json","utf-8")
);

const queue = [];

for(const p of products){

  queue.push({
    product: p.name,
    status: "READY",
    createdAt: new Date().toISOString(),
    channel: [
      "TikTok",
      "YouTube",
      "Instagram",
      "Pinterest",
      "SmartStore",
      "Coupang"
    ]
  });

}

fs.writeFileSync(
  "queue/upload-queue.json",
  JSON.stringify(queue,null,2)
);

console.log("🚀 자동 업로드 큐 생성 완료");
