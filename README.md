# NirvanaNFT

This is the source repository for the [#NirvanaNFT](https://nnft.club) project. Each of the 3000+ tokens available for minting is not only a cool NFT to trade and collect but provides the current owner with access to a day's worth of chat log of #nirvana on IRCnet between 2011 and 2021.

To quote [Tim O'Reilly](https://www.oreilly.com/radar/why-its-too-early-to-get-excited-about-web3/):

> "[…] to build bridges between the self-referential world of crypto assets being bought with cryptocurrencies and a working economic system where the Web3 economy is linked to actual ownership or the utility of non-Web 3 assets."

This basically is a PoC for such a bridge (in addition to a good excuse for having some fun and poking at new technology).

The contract is meant to be deployed on the Rinkeby Ethereum test network.

## Backend

The backend constists of a Node.js server to provide endpoints for token meta data, token image referenced therein and retrieval of chat log represented by a token. Requests to the latter need to be signed by the current token owner. See source code for details.

Running in `development` mode, a local Ethereum node running on port 8545 is assumed and queried directly. When using public networks in `production` mode, the contract is queried using external service APIs. Put credentials for these services ([Etherscan](https://etherscan.io/) and [Infura](https://infura.io/)) in a local `.env` file to make them available as environment variables:

- `ETHERSCAN_API_KEY`
- `INFURA_ID`
- `INFURA_SECRET`

(There's also the `ALLOW_LOGS` variable which can be filled with a comma-separated list of addresses log retrieval should be limited to.)

## Contract

The contract is based on the ERC721 non-fungible token standard and was written in Solidity utilizing the [OpenZeppelin](https://www.openzeppelin.com/) library and [Hardhat](https://hardhat.org/) Ethereum development suite.

Tokens can can not only be minted but put up for sale for an individual price by the owner. If a token is resold, the contract collects a 10% fee.

You can use basic Hardhat commands like:

- `npx hardhat help`
- `npx hardhat accounts`
- `npx hardhat clean`
- `npx hardhat compile`
- `npx hardhat node`
- `npx hardhat test`
- `npx hardhat help`

There are some helper scripts available, too:

- `npx hardhat run scripts/deploy.js --network <localhost|mainnet|rinkeby>`
- `npx hardhat run scripts/fund.js --network <localhost|mainnet|rinkeby>`
- `npx hardhat run scripts/pause.js --network <localhost|mainnet|rinkeby>`
- `npx hardhat run scripts/unpause.js --network <localhost|mainnet|rinkeby>`

Most of the scripts require the same environment variables as the backend (for the same reason).

The `deploy.js` script additionally requires the private key of the address the contract should be deployed with to be available as `DAPK`.

The `fund.js` script simply transfers 10 ETH from the contract owner address to an address found in in the `ADDRESS_TO_FUND` environment variable for testing purposes.

## Frontend

The	frontend is a 100% custom single-page app rendered with [Preact](https://preactjs.com/). It also uses

- [Twind](https://twind.dev/) for leight-weight styling
- [Day.js](https://day.js.org/) to make handling dates easier
- [Ethers](https://ethers.org/) to interact with the contract
- [Metamask](https://metamask.io/) as a web3 provider

and is bundled into browser-native JavaScript modules with [Snowpack](https://www.snowpack.dev/).

Have fun!
