const fs = require('fs');
const path = require('path');

const workspaceRoot = process.cwd();
const defaultInputPath = path.join(workspaceRoot, 'uniCloud-aliyun', 'database', 'news.init_data.json');
const defaultOutputPath = path.join(workspaceRoot, 'scripts', 'output', 'cleaned-news.init_data.json');

function decodeHtmlEntities(value) {
  return String(value || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&emsp;|&ensp;|&thinsp;/gi, ' ')
    .replace(/&#12288;|&#8194;|&#8195;|&#8201;/g, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, '\'')
    .replace(/&ldquo;|&rdquo;/gi, '"')
    .replace(/&lsquo;|&rsquo;/gi, '\'')
    .replace(/&mdash;/gi, ' - ')
    .replace(/&hellip;/gi, '...')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function normalizeWhitespace(value) {
  return String(value || '')
    .replace(/\u3000/g, ' ')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/[ ]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function sanitizePlainText(value) {
  const text = normalizeWhitespace(decodeHtmlEntities(value))
    .replace(/^\s*(来源|原标题|责任编辑|责编|编辑|记者)[:：]\s*.*$/gim, '')
    .replace(/\s*(责任编辑|责编|编辑)[:：]\s*[^，。；;\n]{1,20}$/gim, '')
    .replace(/\s*(扫描二维码|微信扫一扫|打开小程序|下载客户端|进入专题|相关阅读|延伸阅读).*$/gim, '')
    .replace(/\s*【?纠错】?.*$/gim, '')
    .replace(/\s*【?责任编辑[:：]?[^】\n]*】?$/gim, '')
    .replace(/二维码|扫码|微信扫一扫|客户端下载/g, ' ')
    .replace(/[ ]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return text;
}

function sanitizeHtml(html) {
  let value = decodeHtmlEntities(html)
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<svg[\s\S]*?<\/svg>/gi, '')
    .replace(/<img[^>]*>/gi, '')
    .replace(/<p>\s*(来源|原标题|责任编辑|责编|编辑|记者)[:：][\s\S]*?<\/p>/gi, '')
    .replace(/<p>[\s\S]*?(扫描二维码|微信扫一扫|打开小程序|下载客户端|进入专题|相关阅读|延伸阅读)[\s\S]*?<\/p>/gi, '')
    .replace(/<p>\s*<\/p>/gi, '')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();

  return value;
}

function stripHtml(value) {
  return sanitizePlainText(
    String(value || '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<\/li>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
  );
}

function sanitizeBlocks(blocks, fallbackText) {
  const list = Array.isArray(blocks)
    ? blocks
    : String(fallbackText || '')
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean);

  const seen = new Set();
  const cleaned = [];

  for (const item of list) {
    const text = sanitizePlainText(item);
    if (!text || text.length < 8) continue;
    if (seen.has(text)) continue;
    seen.add(text);
    cleaned.push(text);
  }

  return cleaned;
}

function sanitizeCover(cover) {
  const value = String(cover || '').trim();
  if (!value) return '';
  if (/qrcode|qr|barcode|wechat|weixin|miniapp|appcode|share|poster/i.test(value)) {
    return '';
  }
  return value;
}

function sanitizeItem(item) {
  const rawHtml = String(item.content || '');
  const cleanedHtml = sanitizeHtml(rawHtml);
  const contentText = stripHtml(cleanedHtml || rawHtml || item.contentText || '');
  const contentBlocks = sanitizeBlocks(item.contentBlocks, contentText);
  const summarySource = item.summary || contentBlocks.slice(0, 2).join(' ') || contentText;
  const summary = sanitizePlainText(summarySource).slice(0, 120);

  return {
    ...item,
    summary: summary || '暂无摘要',
    content: cleanedHtml,
    contentText,
    contentBlocks,
    cover: sanitizeCover(item.cover),
    paragraphCount: contentBlocks.length,
    contentLength: contentText.length,
    updateTime: Date.now()
  };
}

function parseArgs(argv) {
  const args = {
    input: defaultInputPath,
    output: defaultOutputPath,
    write: false
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--input' && argv[i + 1]) {
      args.input = path.resolve(workspaceRoot, argv[i + 1]);
      i += 1;
      continue;
    }
    if (token === '--output' && argv[i + 1]) {
      args.output = path.resolve(workspaceRoot, argv[i + 1]);
      i += 1;
      continue;
    }
    if (token === '--write') {
      args.write = true;
    }
  }

  return args;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const inputPath = args.input;
  const outputPath = args.write ? inputPath : args.output;

  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input file not found: ${inputPath}`);
  }

  const raw = fs.readFileSync(inputPath, 'utf8');
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) {
    throw new Error('Input JSON must be an array of news items.');
  }

  const cleaned = data.map(sanitizeItem);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(cleaned, null, 2)}\n`, 'utf8');

  console.log(`Cleaned ${cleaned.length} news items.`);
  console.log(`Input: ${inputPath}`);
  console.log(`Output: ${outputPath}`);
  if (!args.write) {
    console.log('Preview mode only. Add --write to overwrite the input file.');
  }
}

main();
