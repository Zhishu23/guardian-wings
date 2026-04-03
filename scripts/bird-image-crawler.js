const fs = require('fs');
const path = require('path');

const workspaceRoot = process.cwd();
const birdsPath = path.join(workspaceRoot, 'uniCloud-aliyun', 'database', 'birds.init_data.json');
const imageRoot = path.join(workspaceRoot, 'static', 'birds');
const reportDir = path.join(workspaceRoot, 'scripts', 'output');
const reportPath = path.join(reportDir, 'bird-image-crawl-report.json');

function parseArgs(argv) {
  const args = {};

  for (const arg of argv) {
    if (!arg.startsWith('--')) continue;
    const body = arg.slice(2);
    const eqIndex = body.indexOf('=');
    if (eqIndex === -1) {
      args[body] = true;
      continue;
    }
    const key = body.slice(0, eqIndex);
    const value = body.slice(eqIndex + 1);
    args[key] = value;
  }

  return args;
}

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readBirds(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeBirds(filePath, birds) {
  fs.writeFileSync(filePath, `${JSON.stringify(birds, null, 2)}\n`, 'utf8');
}

function sanitizeSegment(value) {
  return String(value || '')
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '_')
    .replace(/\s+/g, '_')
    .slice(0, 80);
}

function guessExtension(contentType, sourceUrl) {
  const lowerType = String(contentType || '').toLowerCase();

  if (lowerType.includes('png')) return '.png';
  if (lowerType.includes('webp')) return '.webp';
  if (lowerType.includes('gif')) return '.gif';
  if (lowerType.includes('bmp')) return '.bmp';
  if (lowerType.includes('jpeg') || lowerType.includes('jpg')) return '.jpg';

  try {
    const pathname = new URL(sourceUrl).pathname.toLowerCase();
    const ext = path.extname(pathname);
    if (ext && ext.length <= 5) return ext;
  } catch (error) {
    return '.jpg';
  }

  return '.jpg';
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchText(url, retry = 2) {
  let lastError = null;

  for (let i = 0; i <= retry; i += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0 Safari/537.36',
          'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.text();
    } catch (error) {
      lastError = error;
      if (i < retry) {
        await sleep(800 * (i + 1));
      }
    }
  }

  throw lastError;
}

function extractImageCandidates(html) {
  const candidates = [];
  const seen = new Set();
  const patterns = [
    /"thumbURL":"(https?:\\\/\\\/[^"]+)"/g,
    /"middleURL":"(https?:\\\/\\\/[^"]+)"/g,
    /"objURL":"(https?:\\\/\\\/[^"]+)"/g,
    /"hoverURL":"(https?:\\\/\\\/[^"]+)"/g
  ];

  for (const pattern of patterns) {
    let match = pattern.exec(html);
    while (match) {
      const url = match[1].replace(/\\\//g, '/');
      if (!seen.has(url)) {
        seen.add(url);
        candidates.push(url);
      }
      match = pattern.exec(html);
    }
  }

  return candidates.filter((url) => /^https?:\/\//i.test(url));
}

async function fetchBaiduAcjson(bird, retry) {
  const keyword = [bird.name, bird.scientificName, '鸟类'].filter(Boolean).join(' ');
  const url = `https://image.baidu.com/search/acjson?tn=resultjson_com&ipn=rj&word=${encodeURIComponent(keyword)}&pn=0&rn=50`;
  const text = await fetchText(url, retry);
  const payload = JSON.parse(text);
  const data = Array.isArray(payload.data) ? payload.data : [];
  const candidates = [];
  const seen = new Set();

  for (const item of data) {
    const urls = [];

    if (Array.isArray(item.replaceUrl)) {
      for (const replace of item.replaceUrl) {
        urls.push(replace.ObjURL, replace.ObjUrl, replace.FromURL, replace.FromUrl);
      }
    }

    urls.push(item.thumbURL, item.middleURL, item.hoverURL, item.largeTnImageUrl);

    for (const value of urls) {
      if (typeof value !== 'string') continue;
      if (!/^https?:\/\//i.test(value)) continue;
      if (seen.has(value)) continue;
      seen.add(value);
      candidates.push(value);
    }
  }

  return candidates;
}

async function downloadImage(url, outputFile) {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0 Safari/537.36',
      referer: 'https://image.baidu.com/'
    }
  });

  if (!response.ok) {
    throw new Error(`download failed: HTTP ${response.status}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.startsWith('image/')) {
    throw new Error(`not image content-type: ${contentType}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length < 8 * 1024) {
    throw new Error(`image too small: ${buffer.length} bytes`);
  }

  fs.writeFileSync(outputFile, buffer);
}

function buildImageSearchUrl(bird) {
  const keyword = [bird.name, bird.scientificName, '鸟类'].filter(Boolean).join(' ');
  return `https://image.baidu.com/search/index?tn=baiduimage&word=${encodeURIComponent(keyword)}`;
}

async function crawlBirdImages(bird, options) {
  const folderName = sanitizeSegment(bird._id || bird.scientificName || bird.name);
  const birdDir = path.join(imageRoot, folderName);
  ensureDir(birdDir);

  const existingFiles = fs.existsSync(birdDir)
    ? fs.readdirSync(birdDir).filter((name) => /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(name))
    : [];

  if (options.skipExisting && existingFiles.length >= options.perBird) {
    return {
      birdId: bird._id,
      name: bird.name,
      skipped: true,
      reason: 'already has enough local images',
      saved: existingFiles
        .sort()
        .slice(0, options.perBird)
        .map((name) => `/static/birds/${folderName}/${name}`)
    };
  }

  let candidates = [];
  let source = 'acjson';

  try {
    candidates = await fetchBaiduAcjson(bird, options.retry);
  } catch (error) {
    source = 'html-fallback';
    const html = await fetchText(buildImageSearchUrl(bird), options.retry);
    candidates = extractImageCandidates(html);
  }

  const saved = [];
  const errors = [];

  for (const candidate of candidates) {
    if (saved.length >= options.perBird) break;

    try {
      const index = saved.length + 1;
      const ext = guessExtension('', candidate);
      const fileName = `${String(index).padStart(2, '0')}${ext}`;
      const outputFile = path.join(birdDir, fileName);
      await downloadImage(candidate, outputFile);
      saved.push(`/static/birds/${folderName}/${fileName}`);
      await sleep(options.cooldownMs);
    } catch (error) {
      errors.push({ url: candidate, message: error.message });
    }
  }

  return {
    birdId: bird._id,
    name: bird.name,
    query: [bird.name, bird.scientificName, '鸟类'].filter(Boolean).join(' '),
    source,
    candidateCount: candidates.length,
    saved,
    errors: errors.slice(0, 10)
  };
}

function updateBirdImages(birds, reportById) {
  return birds.map((bird) => {
    const item = reportById.get(bird._id);
    if (!item || !Array.isArray(item.saved) || item.saved.length === 0) {
      return bird;
    }

    return {
      ...bird,
      images: item.saved
    };
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const perBird = toNumber(args['per-bird'], 3);
  const limit = toNumber(args.limit, 20);
  const retry = toNumber(args.retry, 2);
  const cooldownMs = toNumber(args.cooldown, 300);
  const writeDb = Boolean(args['write-db']);
  const skipExisting = !args['force'];
  const birdIdFilter = args['bird-id'] ? String(args['bird-id']).trim() : '';
  const nameFilter = args.name ? String(args.name).trim().toLowerCase() : '';

  ensureDir(imageRoot);
  ensureDir(reportDir);

  const birds = readBirds(birdsPath);
  const filteredBirds = birds
    .filter((bird) => !birdIdFilter || bird._id === birdIdFilter)
    .filter((bird) => !nameFilter || String(bird.name || '').toLowerCase().includes(nameFilter))
    .slice(0, limit);

  if (filteredBirds.length === 0) {
    throw new Error('No bird records matched the current filter.');
  }

  const summary = [];

  for (let i = 0; i < filteredBirds.length; i += 1) {
    const bird = filteredBirds[i];
    console.log(`[${i + 1}/${filteredBirds.length}] Crawling ${bird.name} (${bird._id})`);

    try {
      const result = await crawlBirdImages(bird, {
        perBird,
        retry,
        cooldownMs,
        skipExisting
      });

      summary.push(result);
      console.log(`  Saved ${result.saved.length} image(s).`);
    } catch (error) {
      summary.push({
        birdId: bird._id,
        name: bird.name,
        saved: [],
        fatalError: error.message
      });
      console.log(`  Failed: ${error.message}`);
    }
  }

  fs.writeFileSync(reportPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');

  if (writeDb) {
    const reportById = new Map(summary.map((item) => [item.birdId, item]));
    const nextBirds = updateBirdImages(birds, reportById);
    writeBirds(birdsPath, nextBirds);
    console.log(`Updated ${birdsPath}`);
  }

  const successCount = summary.filter((item) => Array.isArray(item.saved) && item.saved.length > 0).length;
  console.log(`Done. ${successCount}/${filteredBirds.length} birds received local images.`);
  console.log(`Report: ${reportPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
