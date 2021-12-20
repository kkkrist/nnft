'use strict'

const exec = require('child_process').exec
const _get = require('lodash/get')
const ethers = require('ethers')

const { isValidId } = require('./utils')
const address = require('../../frontend/src/data/address.json')
const artifact = require('../../frontend/src/data/artifact.json')
const data = require('../../frontend/src/data/log-stats.json')

require('dotenv').config()

const allowAdr = process.env.ALLOW_LOGS.split(',').map(addr =>
  addr.toLowerCase()
)

const prod = process.env.NODE_ENV === 'production'

const provider = prod
  ? ethers.getDefaultProvider('rinkeby', {
    etherscan: process.env.ETHERSCAN_API_KEY,
    infura: {
      projectId: process.env.INFURA_ID,
      projectSecret: process.env.INFURA_SECRET
    }
  })
  : ethers.getDefaultProvider('http://localhost:8545')

const contract = new ethers.Contract(
  address.address,
  artifact.abi,
  prod ? provider : provider.getSigner(0)
)

const getLogs = tokenId =>
  new Promise((resolve, reject) => {
    const needle = Object.keys(data)[Number(tokenId) - 1]

    if (!prod) {
      return resolve(new Array(data[needle]).fill(`${needle} …`).join('\n'))
    }

    exec(
      `egrep -h "^${needle}" *\\#nirvana.weechatlog | egrep -v "\\-\\->|<\\-\\-|Modus"`,
      {
        cwd: '/home/krist/.weechat/logs'
      },
      (error, stdout, stderr) => {
        if (error && error.code !== 1) {
          console.log(error, stderr)
          return reject(error)
        }

        resolve(stdout)
      }
    )
  })

const logHandler = async (req, res, next) => {
  if (!isValidId(req.params[0])) {
    return res.status(400).end()
  }

  if (
    !req.body.message ||
    !req.body.signature ||
    !req.body.signature.startsWith('0x')
  ) {
    return res.status(400).end()
  }

  try {
    const signer = ethers.utils.verifyMessage(
      req.body.message,
      req.body.signature
    )
    const owner = await contract.ownerOf(Number(req.params[0]))

    if (signer !== owner || !allowAdr.includes(signer)) {
      return res.status(403).end()
    }

    const logs = await getLogs(req.params[0])

    res.type('text')
    return logs ? res.status(200).send(logs) : res.status(404).end()
  } catch (error) {
    const errMatch = error.message.match(/error=(.*?), data/)
    const errObj = _get(errMatch, '[1]') && JSON.parse(errMatch[1])

    if (
      _get(errObj, 'body', '').startsWith('{') &&
      _get(errObj, 'body', '').endsWith('}')
    ) {
      const vmErrMsg = JSON.parse(errObj.body).error.message
      if (vmErrMsg.includes('nonexistent token')) {
        res.type('json')
        return res.status(404).send(errObj.body)
      }
    }

    if (error.message.includes('INVALID_ARGUMENT')) {
      return res.status(400).send(JSON.stringify({ error: error.message }))
    }

    return next(error)
  }
}

module.exports = logHandler
