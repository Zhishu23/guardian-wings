'use strict'
const fs = require('fs')
const path = require('path')

module.exports = function createConfig({ pluginId } = {}) {
  return {
    config() {
      if (!pluginId) throw new Error('pluginId is required')
      const configPath = path.resolve(__dirname, pluginId, 'config.json')
      if (!fs.existsSync(configPath)) {
        throw new Error(`config not found: ${configPath}`)
      }
      return JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    }
  }
}
