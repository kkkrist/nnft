/* global artifacts, ethers, network */
'use strict'

const fs = require('fs')
const hre = require('hardhat')
const path = require('path')

const frontendData = path.join(__dirname, '/../../frontend/src/data/')
const symbol = 'NNFT'

const deploy = async () => {
  if (network.name === 'hardhat') {
    console.warn(
      'You are trying to deploy a contract to the Hardhat Network, which' +
        'gets automatically created and destroyed every time. Use the Hardhat' +
        " option '--network localhost'"
    )
  }

  const [deployer] = await ethers.getSigners()

  console.log(
    'Deploying the contracts with the account:',
    await deployer.getAddress()
  )

  console.log(
    'Account balance:',
    await deployer.getBalance().then(bigint => ethers.utils.formatEther(bigint))
  )

  const contract = await hre.ethers.getContractFactory(symbol)
  const token = await contract.deploy()

  await token.deployed()

  console.log('Deployed to:', token.address)

  return token
}

deploy()
  .then(token => {
    fs.writeFileSync(
      frontendData + '/address.json',
      JSON.stringify({ address: token.address }, null, 2)
    )

    const artifact = artifacts.readArtifactSync(symbol)

    fs.writeFileSync(
      frontendData + '/artifact.json',
      JSON.stringify(artifact, null, 2)
    )

    process.exit(0)
  })
  .catch(error => {
    console.error('Something went wrong', error)
    process.exit(1)
  })
