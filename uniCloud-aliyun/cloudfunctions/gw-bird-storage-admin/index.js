'use strict'

const db = uniCloud.database()

const CONFIG = {
  uploadToken: 'replace-with-a-strong-token'
}

exports.main = async (event, context) => {
  try {
    const payload = normalizePayload(event)
    authorize(payload)

    const action = payload.action || ''
    if (action === 'syncBirdImages') {
      return await syncBirdImages(payload)
    }

    return response(404, { message: `Unknown action: ${action}` })
  } catch (error) {
    console.error('gw-bird-storage-admin error:', error)
    return response(500, {
      message: error.message || 'Internal server error'
    })
  }
}

function normalizePayload(event) {
  if (event && typeof event.body === 'string') {
    try {
      return JSON.parse(event.body)
    } catch (error) {
      throw new Error('Request body must be valid JSON.')
    }
  }

  if (event && event.body && typeof event.body === 'object') {
    return event.body
  }

  return event || {}
}

function authorize(payload) {
  if (!CONFIG.uploadToken || CONFIG.uploadToken === 'replace-with-a-strong-token') {
    throw new Error('Please configure uploadToken in gw-bird-storage-admin/index.js before using this function.')
  }

  if (payload.token !== CONFIG.uploadToken) {
    throw new Error('Unauthorized request.')
  }
}

async function syncBirdImages(payload) {
  const birdId = String(payload.birdId || '').trim()
  const files = Array.isArray(payload.files) ? payload.files : []

  if (!birdId) {
    return response(400, { message: 'birdId is required.' })
  }

  if (files.length === 0) {
    return response(400, { message: 'files is required.' })
  }

  if (files.length > 10) {
    return response(400, { message: 'A single request can upload at most 10 files.' })
  }

  const birdRes = await db.collection('birds').doc(birdId).get()
  if (!birdRes.data || birdRes.data.length === 0) {
    return response(404, { message: 'Bird not found.' })
  }

  const fileIDs = []

  for (const file of files) {
    const fileName = sanitizeFileName(file.fileName)
    const base64 = String(file.base64 || '')

    if (!fileName || !base64) {
      return response(400, { message: 'Each file must contain fileName and base64.' })
    }

    const fileBuffer = Buffer.from(base64, 'base64')
    if (!fileBuffer.length) {
      return response(400, { message: `Empty file content for ${fileName}.` })
    }

    const uploadRes = await uniCloud.uploadFile({
      cloudPath: `birds/${birdId}/${fileName}`,
      cloudPathAsRealPath: true,
      fileContent: fileBuffer
    })

    fileIDs.push(uploadRes.fileID)
  }

  await db.collection('birds').doc(birdId).update({
    images: fileIDs,
    updateTime: Date.now()
  })

  return response(200, {
    birdId,
    images: fileIDs
  })
}

function sanitizeFileName(fileName) {
  return String(fileName || '')
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '_')
    .slice(0, 120)
}

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      'content-type': 'application/json; charset=utf-8'
    },
    body
  }
}
