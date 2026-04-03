const fs = require('fs')
const path = require('path')

const workspaceRoot = process.cwd()
const birdsPath = path.join(workspaceRoot, 'uniCloud-aliyun', 'database', 'birds.init_data.json')
const staticBirdRoot = path.join(workspaceRoot, 'static', 'birds')
const reportDir = path.join(workspaceRoot, 'scripts', 'output')
const reportPath = path.join(reportDir, 'bird-image-upload-report.json')

function parseArgs(argv) {
  const args = {}

  for (const arg of argv) {
    if (!arg.startsWith('--')) continue
    const body = arg.slice(2)
    const eqIndex = body.indexOf('=')

    if (eqIndex === -1) {
      args[body] = true
      continue
    }

    args[body.slice(0, eqIndex)] = body.slice(eqIndex + 1)
  }

  return args
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true })
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
}

function toNumber(value, fallback) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function getImageFiles(birdId) {
  const birdDir = path.join(staticBirdRoot, birdId)
  if (!fs.existsSync(birdDir)) {
    return []
  }

  return fs.readdirSync(birdDir)
    .filter((name) => /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(name))
    .sort()
    .map((name) => path.join(birdDir, name))
}

function buildRequestFiles(filePaths) {
  return filePaths.map((filePath) => ({
    fileName: path.basename(filePath),
    base64: fs.readFileSync(filePath).toString('base64')
  }))
}

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  const text = await response.text()
  let data = null

  try {
    data = text ? JSON.parse(text) : null
  } catch (error) {
    throw new Error(`Upload endpoint did not return valid JSON: ${text.slice(0, 200)}`)
  }

  if (!response.ok) {
    throw new Error(data && data.body && data.body.message ? data.body.message : `HTTP ${response.status}`)
  }

  const body = data && data.body ? data.body : data
  if (!body || !Array.isArray(body.images)) {
    throw new Error('Upload endpoint response is missing images.')
  }

  return body
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const uploadUrl = process.env.BIRD_UPLOAD_URL || args.url
  const uploadToken = process.env.BIRD_UPLOAD_TOKEN || args.token
  const limit = toNumber(args.limit, 10000)
  const perBird = toNumber(args['per-bird'], 3)
  const birdIdFilter = args['bird-id'] ? String(args['bird-id']).trim() : ''
  const force = Boolean(args.force)

  if (!uploadUrl) {
    throw new Error('Missing upload URL. Set BIRD_UPLOAD_URL or pass --url=https://...')
  }

  if (!uploadToken) {
    throw new Error('Missing upload token. Set BIRD_UPLOAD_TOKEN or pass --token=...')
  }

  ensureDir(reportDir)

  const birds = readJson(birdsPath)
  const filtered = birds
    .filter((bird) => !birdIdFilter || bird._id === birdIdFilter)
    .slice(0, limit)

  const report = []
  let updatedCount = 0

  for (let i = 0; i < filtered.length; i += 1) {
    const bird = filtered[i]
    const filePaths = getImageFiles(bird._id).slice(0, perBird)

    console.log(`[${i + 1}/${filtered.length}] Uploading ${bird.name} (${bird._id})`)

    if (filePaths.length === 0) {
      report.push({
        birdId: bird._id,
        name: bird.name,
        skipped: true,
        reason: 'no local images found'
      })
      console.log('  Skipped: no local images found.')
      continue
    }

    if (!force && Array.isArray(bird.images) && bird.images.some((item) => /^https?:|^cloud:|^cloudfile:/i.test(String(item)))) {
      report.push({
        birdId: bird._id,
        name: bird.name,
        skipped: true,
        reason: 'bird already has cloud images'
      })
      console.log('  Skipped: already has cloud images.')
      continue
    }

    try {
      const body = await postJson(uploadUrl, {
        action: 'syncBirdImages',
        token: uploadToken,
        birdId: bird._id,
        files: buildRequestFiles(filePaths)
      })

      bird.images = body.images
      updatedCount += 1

      report.push({
        birdId: bird._id,
        name: bird.name,
        uploaded: filePaths.length,
        images: body.images
      })

      console.log(`  Uploaded ${body.images.length} image(s).`)
    } catch (error) {
      report.push({
        birdId: bird._id,
        name: bird.name,
        error: error.message
      })
      console.log(`  Failed: ${error.message}`)
    }
  }

  writeJson(birdsPath, birds)
  writeJson(reportPath, report)

  console.log(`Done. Updated ${updatedCount} bird record(s).`)
  console.log(`Bird data: ${birdsPath}`)
  console.log(`Report: ${reportPath}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
