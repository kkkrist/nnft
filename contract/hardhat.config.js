require('@nomiclabs/hardhat-waffle')
require('@nomiclabs/hardhat-etherscan')
require('hardhat-gas-reporter')
require('dotenv').config()

const { DAPK, INFURA_ID } = process.env

module.exports = {
  solidity: '0.8.4',
  networks: {
    hardhat: {
      chainId: 1337
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${INFURA_ID}`,
      accounts: [DAPK]
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${INFURA_ID}`,
      accounts: [DAPK]
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
}
