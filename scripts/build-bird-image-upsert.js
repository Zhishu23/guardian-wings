const fs = require('fs');
const path = require('path');

const workspaceRoot = process.cwd();
const sourcePath = path.join(workspaceRoot, 'uniCloud-aliyun', 'database', 'birds.init_data.json');
const outputPath = path.join(workspaceRoot, 'uniCloud-aliyun', 'database', 'birds.images_upsert.json');

function main() {
  const birds = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

  const updates = birds.map((bird) => ({
    _id: bird._id,
    images: Array.isArray(bird.images) ? bird.images : []
  }));

  fs.writeFileSync(outputPath, `${JSON.stringify(updates, null, 2)}\n`, 'utf8');
  console.log(`Generated ${updates.length} image-only updates at ${outputPath}`);
}

main();
