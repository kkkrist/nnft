'use strict'

const gm = require('gm').subClass({ imageMagick: true })
const path = require('path')
const { isValidId } = require('./utils')
const data = require('../../frontend/src/data/log-stats.json')

const keys = Object.keys(data)

const imageHandler = (req, res, next) => {
  if (!isValidId(req.params[0])) {
    return res.status(400).end()
  }

  return gm(path.join(__dirname, '/image.png'))
    .fill('white')
    .font('Space-Mono')
    .fontSize(32)
    .drawText(25, 50, `NNFT #${req.params[0]}`)
    .drawText(
      500 - 220,
      483 - 25,
      keys[Number(req.params[0]) - 1].replaceAll('-', '/')
    )
    .stream((error, stdout, stderr) => {
      if (error) {
        console.error(error, stderr)
        return next(new Error("Couldn't generate image"))
      }

      res.set('cache-control', 'public, max-age=31557600')
      res.type('png')
      return stdout.pipe(res)
    })
}

module.exports = imageHandler
