const fs = require('fs');
const path = require('path');

const workspaceRoot = process.cwd();
const sourcePath = process.argv[2] || path.join(workspaceRoot, 'uniCloud-aliyun', 'database', 'birds.init_data.json');
const targetPath = path.join(workspaceRoot, 'uniCloud-aliyun', 'database', 'birds.init_data.json');

function parseLooseBirdJson(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  const items = [];
  let obj = null;
  let inFeatures = false;
  let features = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line === '[' || line === ']') continue;

    if (line === '{') {
      obj = {};
      continue;
    }

    if (line === '},' || line === '}') {
      if (inFeatures && obj) {
        obj.features = features;
        inFeatures = false;
        features = [];
      }
      if (obj) {
        items.push(obj);
      }
      obj = null;
      continue;
    }

    if (inFeatures) {
      if (line.startsWith(']')) {
        obj.features = features;
        inFeatures = false;
        features = [];
      } else {
        const match = line.match(/^"(.*)"[,]?$/);
        if (match) {
          features.push(match[1]);
        }
      }
      continue;
    }

    if (!obj) continue;

    if (line.startsWith('"features"')) {
      inFeatures = true;
      features = [];
      continue;
    }

    const match = line.match(/^"([^"]+)":\s*(.*?)(,)?$/);
    if (!match) continue;

    const key = match[1];
    const rawValue = (match[2] || '').trim();
    obj[key] = parseLooseValue(rawValue);
  }

  return items;
}

function parseLooseValue(rawValue) {
  if (rawValue === '' || rawValue === ',') return null;
  if (rawValue === '[') return [];
  if (rawValue === 'true' || rawValue === 'false') return rawValue === 'true';
  if (/^-?\d+$/.test(rawValue)) return Number(rawValue);

  if (rawValue.startsWith('"')) {
    const end = rawValue.lastIndexOf('"');
    return end > 0 ? rawValue.slice(1, end) : rawValue.slice(1);
  }

  return rawValue;
}

function toHtmlParagraphs(text) {
  if (!text) return '';
  if (/<[a-z][\s\S]*>/i.test(text)) {
    return text;
  }

  return String(text)
    .split(/\n+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => `<p>${part}</p>`)
    .join('');
}

function normalizeProtectionLevel(record) {
  const combined = `${record.protectionLevel || ''} ${record.description || ''}`;

  if (/国家保护动物等级[:：]?\s*一级|国家一级保护|一级保护/.test(combined)) return '一级';
  if (/国家保护动物等级[:：]?\s*二级|国家二级保护|二级保护/.test(combined)) return '二级';
  if (/三有/.test(combined)) return '三有';
  if (/极危|IUCN[^，。]*CR\b/.test(combined)) return '极危';
  if (/濒危|IUCN[^，。]*EN\b/.test(combined)) return '濒危';
  if (/易危|易危物种|IUCN[^，。]*VU\b/.test(combined)) return '易危';
  if (/国家保护/.test(record.protectionLevel || '')) return '三有';
  return '三有';
}

function normalizeSize(size) {
  if (size === '大型') return '大型';
  if (size === '小型') return '小型';
  return '中型';
}

function normalizeImages(images) {
  if (!Array.isArray(images)) return [];
  return images.filter((item) => typeof item === 'string' && item.trim());
}

function normalizeFeatures(features) {
  if (!Array.isArray(features)) return [];
  return features
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .slice(0, 12);
}

function normalizeRecord(record, index) {
  return {
    _id: `bird_import_${String(index + 1).padStart(4, '0')}`,
    name: String(record.name || '').trim(),
    scientificName: String(record.scientificName || '').trim(),
    protectionLevel: normalizeProtectionLevel(record),
    habitat: String(record.habitat || '').trim(),
    size: normalizeSize(String(record.size || '').trim()),
    description: toHtmlParagraphs(record.description),
    distribution: String(record.distribution || '').trim(),
    habits: String(record.habits || '').trim(),
    images: normalizeImages(record.images),
    features: normalizeFeatures(record.features),
    category: String(record.category || '').trim(),
    isHot: Boolean(record.isHot),
    favoriteCount: Number.isFinite(record.favoriteCount) ? record.favoriteCount : 0,
    createTime: Number.isFinite(record.createTime) ? record.createTime : Date.now()
  };
}

function dedupeRecords(records) {
  const map = new Map();

  for (const record of records) {
    const key = record.scientificName || record.name;
    if (!key) continue;
    if (!map.has(key)) {
      map.set(key, record);
    }
  }

  return Array.from(map.values());
}

function main() {
  const parsed = parseLooseBirdJson(sourcePath);
  const normalized = dedupeRecords(parsed)
    .map(normalizeRecord)
    .filter((item) => item.name && item.scientificName);

  fs.writeFileSync(targetPath, `${JSON.stringify(normalized, null, 2)}\n`, 'utf8');

  console.log(`Imported ${normalized.length} bird records into ${targetPath}`);
}

main();
