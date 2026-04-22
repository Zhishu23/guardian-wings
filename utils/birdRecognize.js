/**
 * 懂鸟 API 鸟类识别工具
 * 文件路径：utils/birdRecognize.js
 *
 * API 说明：异步两步式
 *   第一步：上传图片 → 返回 recognitionId
 *   第二步：用 recognitionId 轮询查询结果（最多重试5次，每次间隔1秒）
 *   可选步骤：用返回的 animalId 查询百科资料
 */

const API_KEY = 'bHJDpW3xAohRnOzbVVJ489pl'

// API 基础地址
const BASE_URL = 'https://ai.open.hhodata.com/api/v2'

// ── 获取设备唯一ID（用于 did 参数，必须1-32位字母或数字）──
function getDeviceId() {
  try {
    const info = uni.getSystemInfoSync()
    // 取设备ID，去掉非字母数字字符，截取前32位
    const raw = (info.deviceId || info.model || 'defaultDevice').replace(/[^a-zA-Z0-9]/g, '')
    return raw.substring(0, 32) || 'guardian01'
  } catch (e) {
    return 'guardian01'
  }
}

// ── 第一步：上传图片，返回 recognitionId ──
function uploadImage(imagePath) {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: `${BASE_URL}/dongniao`,
      filePath: imagePath,
      name: 'image',
      header: {
        'api_key': API_KEY
      },
      formData: {
        upload: '1',
        class: 'B',
        did: getDeviceId()
      },
      success: (res) => {
        try {
          // res.data 是字符串，必须手动解析
          const raw = typeof res.data === 'string' ? res.data : JSON.stringify(res.data)
          
          // 打印原始返回，方便调试（上线前可删）
          console.log('懂鸟API原始返回：', raw)
          
          let result
          try {
            result = JSON.parse(raw)
          } catch (parseErr) {
            reject(new Error('API返回格式异常：' + raw.substring(0, 50)))
            return
          }

          // HTTP状态码异常（如401未授权）
          if (res.statusCode === 401) {
            reject(new Error('API Key无效，请检查密钥'))
            return
          }
          if (res.statusCode !== 200) {
            reject(new Error('服务器错误：' + res.statusCode))
            return
          }

          const status = String(result.status || result[0] || '')
          
          if (status === '1000') {
            // 正常返回，识别ID在 data[1]
            const recognitionId = (result.data && result.data[1]) || (Array.isArray(result) && result[1])
            if (recognitionId) {
              resolve(recognitionId)
            } else {
              reject(new Error('未获取到识别ID，请重试'))
            }
          } else {
            const errMap = {
              '1001': '图片超过2M或太小，请换一张',
              '1002': '请使用JPG格式图片',
              '1003': '设备ID错误',
              '1004': '动物种类参数错误',
              '1005': '地区参数错误',
              '1006': 'IP被锁定，请联系服务商',
              '1011': '未检测到该地区的鸟类'
            }
            reject(new Error(errMap[status] || `上传失败(${status})：${result.message || '未知错误'}`))
          }
        } catch (e) {
          reject(new Error('解析响应失败：' + e.message))
        }
      },
      fail: (err) => {
        console.log('uploadFile网络错误：', JSON.stringify(err))
        reject(new Error('网络请求失败，请检查网络后重试'))
      }
    })
  })
}

// ── 第二步：用 recognitionId 查询识别结果（轮询，最多5次）──
function getResult(recognitionId, retryCount = 0) {
  return new Promise((resolve, reject) => {
    if (retryCount >= 5) {
      reject(new Error('识别超时，请重试'))
      return
    }

    // 至少等1秒再查询（第一次也要等）
    setTimeout(() => {
      uni.request({
        url: `${BASE_URL}/dongniao`,
        method: 'POST',
        header: {
          'api_key': API_KEY,
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: `resultid=${encodeURIComponent(recognitionId)}`,
        success: (res) => {
          const result = res.data
          if (result.status === '1001') {
            // 结果还未生成，继续重试
            getResult(recognitionId, retryCount + 1).then(resolve).catch(reject)
          } else if (result.status === '1000') {
            // 识别成功，data 是动物数组
            resolve(result.data)
          } else if (result.status === '1008') {
            reject(new Error('图片中未检测到鸟类，请换一张更清晰的照片'))
          } else if (result.status === '1009') {
            reject(new Error('检测到鸟类但无法识别，请尝试更清晰的正面照片'))
          } else {
            reject(new Error(`识别失败：${result.status}`))
          }
        },
        fail: (err) => {
          reject(new Error('网络请求失败，请检查网络连接'))
        }
      })
    }, 1200) // 1.2秒间隔，略大于文档要求的1秒
  })
}

// ── 可选第三步：根据 animalId 查询百科资料 ──
function getEncyclopedia(animalId, animalClass = 'B') {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}/dongniao`,
      method: 'POST',
      header: {
        'api_key': API_KEY,
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: `animalid=${animalId}&class=${animalClass}`,
      success: (res) => {
        const result = res.data
        if (result.status === '1000' && result.data && result.data[1]) {
          resolve(result.data[1]) // 返回百科信息对象
        } else {
          resolve(null) // 百科查询失败不影响主流程
        }
      },
      fail: () => {
        resolve(null) // 百科查询失败不影响主流程
      }
    })
  })
}

// ── 解析识别结果，提取置信度最高的鸟 ──
function parseBestBird(animalArray) {
  if (!animalArray || animalArray.length === 0) return null

  let bestBird = null
  let bestConfidence = 0

  animalArray.forEach(target => {
    if (target.list && target.list.length > 0) {
      const top = target.list[0]
      const confidence = top[0]   // 置信度（如 97.6）
      const nameRaw   = top[1]    // "中文名|英文名|拉丁名" 或 "中文名"
      const animalId  = top[2]    // 动物ID（用于查百科）
      const animalClass = top[3]  // 动物类别（B=鸟）

      if (confidence > bestConfidence) {
        bestConfidence = confidence
        const nameParts = nameRaw.split('|')
        bestBird = {
          confidence,
          chineseName: nameParts[0] || nameRaw,
          englishName: nameParts[1] || '',
          latinName:   nameParts[2] || '',
          animalId,
          animalClass,
          box: target.box // 检测框坐标
        }
      }
    }
  })

  return bestBird
}

// ── 主函数：完整识别流程（上传 → 轮询 → 解析）──
export async function recognizeBirdImage(imagePath) {
  // 第一步：上传图片
  const recognitionId = await uploadImage(imagePath)

  // 第二步：轮询查询结果
  const animalArray = await getResult(recognitionId)

  // 第三步：解析最佳结果
  const bestBird = parseBestBird(animalArray)

  if (!bestBird) {
    throw new Error('识别结果为空，请尝试更清晰的照片')
  }

  return bestBird
  // 返回格式示例：
  // {
  //   confidence: 97.6,        // 置信度百分比
  //   chineseName: '白鹭',     // 中文名
  //   englishName: 'Little Egret',
  //   latinName: 'Egretta garzetta',
  //   animalId: 1234,          // 可用于查百科
  //   animalClass: 'B',
  //   box: [31, 9, 379, 356]   // 检测框坐标
  // }
}

// 导出百科查询（可选使用）
export { getEncyclopedia }