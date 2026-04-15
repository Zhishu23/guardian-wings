const fs = require('fs');
const path = require('path');

const workspaceRoot = process.cwd();
const xmlPath = path.join(workspaceRoot, 'scripts', 'output', 'wildlife-law', 'word', 'document.xml');
const lawsPath = path.join(workspaceRoot, 'uniCloud-aliyun', 'database', 'laws.init_data.json');
const previewPath = path.join(workspaceRoot, 'scripts', 'output', 'wildlife-law-laws.json');

function decodeXml(text) {
  return String(text || '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function extractParagraphs(xml) {
  const paragraphs = [];
  const matches = xml.match(/<w:p[\s\S]*?<\/w:p>/g) || [];

  for (const block of matches) {
    const text = [...block.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)]
      .map((item) => decodeXml(item[1]))
      .join('')
      .replace(/\s+/g, ' ')
      .trim();

    if (text) {
      paragraphs.push(text);
    }
  }

  return paragraphs;
}

function normalizeText(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .replace(/　/g, '')
    .trim();
}

function extractEffectiveDate(paragraphs) {
  const joined = paragraphs.slice(0, 3).join(' ');
  const matches = [...joined.matchAll(/(\d{4})年(\d{1,2})月(\d{1,2})日/g)];
  const last = matches[matches.length - 1];
  if (!last) return '2022-12-30';
  const [, yyyy, mm, dd] = last;
  return `${yyyy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
}

function summarizePenalty(articleNo, content) {
  if (/第[五六七八九]|第四十|第五十|第六十/.test(articleNo) || /罚款|没收|吊销|责令|处罚|追究刑事责任/.test(content)) {
    return content.slice(0, 180);
  }
  return '';
}

function buildKeywords(articleNo, content) {
  const seeds = [];
  const dictionary = [
    '野生动物', '栖息地', '猎捕', '杀害', '交易', '运输', '人工繁育', '收容救护',
    '种群调控', '禁猎区', '禁猎期', '特许猎捕证', '狩猎证', '捕鸟网', '电击',
    '毒药', '爆炸物', '自然保护地', '疫源疫病', '补偿', '野生动物制品', '食用',
    '放生', '放归', '执法', '监管', '行政处罚', '刑事责任'
  ];

  seeds.push(articleNo);
  for (const word of dictionary) {
    if (content.includes(word)) {
      seeds.push(word);
    }
  }

  return Array.from(new Set(seeds)).slice(0, 8);
}

function parseLawArticles(paragraphs) {
  const lawTitle = '中华人民共和国野生动物保护法';
  const articles = [];
  let current = null;

  for (const raw of paragraphs) {
    const text = normalizeText(raw);
    if (!text || text === '目录') continue;
    if (/^第[一二三四五六七八九十百零〇]+章/.test(text)) continue;
    if (text === lawTitle) continue;
    if (/^\d{4}年\d{1,2}月\d{1,2}日/.test(text)) continue;
    if (/^（1988年11月8日/.test(text)) continue;

    const articleMatch = text.match(/^(第[一二三四五六七八九十百零〇]+条)(.+)$/);
    if (articleMatch) {
      if (current) {
        articles.push(current);
      }

      current = {
        articleNo: articleMatch[1],
        paragraphs: [articleMatch[2].trim()]
      };
      continue;
    }

    if (current) {
      current.paragraphs.push(text);
    }
  }

  if (current) {
    articles.push(current);
  }

  return articles.map((item, index) => {
    const content = item.paragraphs.join('\n');
    return {
      _id: `law_wlp_${String(index + 1).padStart(3, '0')}`,
      title: lawTitle,
      articleNo: item.articleNo,
      content,
      keywords: buildKeywords(item.articleNo, content),
      penalty: summarizePenalty(item.articleNo, content),
      category: '野生动物保护法'
    };
  });
}

function mergeIntoLaws(existingLaws, wildlifeLaws, effectiveDate) {
  const preserved = existingLaws.filter((item) => item.title !== '中华人民共和国野生动物保护法');
  const mergedWildlife = wildlifeLaws.map((item) => ({
    ...item,
    effectiveDate,
    createTime: item.createTime || Date.now()
  }));

  return [...preserved, ...mergedWildlife];
}

function main() {
  const xml = fs.readFileSync(xmlPath, 'utf8');
  const paragraphs = extractParagraphs(xml);
  const effectiveDate = extractEffectiveDate(paragraphs);
  const wildlifeLaws = parseLawArticles(paragraphs);
  const existingLaws = JSON.parse(fs.readFileSync(lawsPath, 'utf8'));
  const merged = mergeIntoLaws(existingLaws, wildlifeLaws, effectiveDate);

  fs.writeFileSync(previewPath, `${JSON.stringify(wildlifeLaws, null, 2)}\n`, 'utf8');
  fs.writeFileSync(lawsPath, `${JSON.stringify(merged, null, 2)}\n`, 'utf8');

  console.log(`Parsed ${wildlifeLaws.length} wildlife law articles.`);
  console.log(`Updated laws file: ${lawsPath}`);
  console.log(`Preview file: ${previewPath}`);
}

main();
