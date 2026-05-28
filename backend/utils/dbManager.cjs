const fs = require("fs").promises;
const path = require("path");

const dbPath = path.join(__dirname, "../data.json");

let queue = Promise.resolve();

async function readDB() {
  const content = await fs.readFile(dbPath, "utf-8");
  return JSON.parse(content);
}

async function writeDB(data) {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2), "utf-8");
}

function updateDB(updateFn) {
  queue = queue.then(async () => {
    const db = await readDB();
    const updatedDB = await updateFn(db);
    await writeDB(updatedDB);
    return updatedDB;
  });

  return queue;
}

module.exports = {
  readDB,
  updateDB,
};