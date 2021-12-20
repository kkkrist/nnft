'use strict'

const cors = require('cors')
const express = require('express')

const imageHandler = require('./image-handler')
const logHandler = require('./log-handler')
const tokenHandler = require('./token-handler')

const app = express()
const port = 3002

app.use(cors())
app.use(express.json())

app.get(/^\/image\/(\d+)\.png$/, imageHandler)

app.post(/^\/log\/(\d+)$/, logHandler)

app.get(/^\/token\/(\d+)$/, tokenHandler)

app.listen(port, 'localhost', () => {
  console.log(`NNFT backend listening at http://localhost:${port}`)
})
