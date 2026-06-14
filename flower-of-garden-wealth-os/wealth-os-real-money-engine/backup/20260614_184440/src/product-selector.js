import fs from "fs";

const products = JSON.parse(fs.readFileSync("data/products.json", "utf-8"));

function score(p) {
  let s = 0;

  if (p.sellPrice <= 29900) s += 30;
  if (p.trend) s += 25;
  if (p.emotion) s += 25;
  if (p.category) s += 20;

  return s;
}

const ranked = products
  .map(p => ({
    ...p,
    score: score(p)
  }))
  .sort((a,b) => b.score - a.score);

console.table(ranked);

fs.writeFileSync(
  "output/top-products.json",
  JSON.stringify(ranked,null,2)
);

console.log("🔥 AI 상품 선정 완료");
