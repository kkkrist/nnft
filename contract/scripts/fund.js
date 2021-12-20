/* global ethers */
const hre = require('hardhat')
require('dotenv').config()

const { ADDRESS_TO_FUND } = process.env

const main = async () => {
  const [wallet1] = await hre.ethers.getSigners()

  await wallet1.sendTransaction({
    to: ADDRESS_TO_FUND,
    value: ethers.utils.parseEther('10.0')
  })

  console.log('Transferred 10 ETH to ', ADDRESS_TO_FUND)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Something went wrong', error)
    process.exit(1)
  })
