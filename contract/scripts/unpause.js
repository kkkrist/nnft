/* global network */

'use strict'

const hre = require('hardhat')
require('dotenv').config()

const { DAPK } = process.env
const address = require('../../frontend/src/data/address.json')

const main = async () => {
  const NNFT = await hre.ethers.getContractAt('NNFT', address.address)

  const [owner] = await hre.ethers.getSigners()
  const signer =
    network.name === 'localhost'
      ? owner
      : new hre.ethers.Wallet(DAPK, hre.ethers.provider)

  const contract = NNFT.connect(signer)
  await contract.unpause()

  console.log('Unpaused sale')
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Something went wrong', error)
    process.exit(1)
  })
