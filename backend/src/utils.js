'use strict'

const data = require('../../frontend/src/data/log-stats.json')

const keys = Object.keys(data)

const isValidId = id => {
  const num = Number(id)

  if (num <= 0 || num > keys.length) {
    return false
  }

  return true
}

module.exports = { isValidId }
