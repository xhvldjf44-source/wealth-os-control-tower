import { askAI } from "./services/AIAgentService.js";

async function runTest() {
    const result = await askAI("꽃집 쇼핑몰 홍보 문구 만들어줘");
    console.log("\nAI 응답:\n");
    console.log(result);
}

runTest();