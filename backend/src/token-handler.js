'use strict'

const { isValidId } = require('./utils')

const origin =
  process.env.NODE_ENV === 'production'
    ? 'https://nnft.club/'
    : 'http://localhost:3002/'

const tokenHandler = (req, res, next) => {
  if (!isValidId(req.params[0])) {
    return res.status(400).end()
  }

  return res.send({
    name: `NNFT #${req.params[0]}`,
    description: `NNFT #${req.params[0]}`,
    image: `${origin}api/image/${req.params[0]}.png`
  })
}

module.exports = tokenHandler
