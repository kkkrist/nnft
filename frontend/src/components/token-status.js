import { ethers } from 'ethers'
import { h } from 'preact'
import { useContext, useEffect, useState } from 'preact/hooks'
import htm from 'htm'
import A from './a'
import Button from './button'
import Input from './input'
import TokenHistory from './token-history'
import { ContractContext } from '../app'
import address from '../data/address.json'

const html = htm.bind(h)

const TokenStatus = ({
  account,
  backendUri,
  addNotification,
  errorHandler,
  ethereum,
  tokenId
}) => {
  const contract = useContext(ContractContext)
  const [isLoading, setIsLoading] = useState(false)
  const [offer, setOffer] = useState('0.0')
  const [owner, setOwner] = useState()

  const buyToken = async () => {
    setIsLoading(true)

    try {
      await contract.once('TokenBought', (tx, rx, token) => {
        if (rx.toLowerCase() === account && token.toNumber() === tokenId) {
          setOffer('0.0')
          setOwner(rx.toLowerCase())
          setIsLoading(false)
        }
      })

      await contract.buyToken(tokenId, {
        value: ethers.utils.parseEther(offer)
      })

      addNotification({
        message: `You've successfully bought #${tokenId}! Please stand by for confirmation…`
      })
    } catch (error) {
      setIsLoading(false)
      errorHandler(error)
    }
  }

  const mintToken = async () => {
    setIsLoading(true)

    const filter = {
      address: address.address,
      topics: [
        ethers.utils.id('Transfer(address,address,uint256)'),
        null,
        ethers.utils.hexZeroPad(account, 32)
      ]
    }

    try {
      await contract.once(filter, (tx, rx, token) => {
        if (rx.toLowerCase() === account && token.toNumber() === tokenId) {
          setOwner(rx.toLowerCase())
          setIsLoading(false)
        }
      })

      await contract.safeMint(account, tokenId, {
        value: ethers.utils.parseEther('0.1')
      })

      addNotification({
        message: `Token #${tokenId} successfully minted! Please stand by for confirmation…`
      })
    } catch (error) {
      setIsLoading(false)
      errorHandler(error)
    }
  }

  const placeAd = async e => {
    e.preventDefault()
    setIsLoading(true)

    const amount = e.target[0].value

    try {
      await contract.once('AdPlaced', (token, price) => {
        if (
          token.toNumber() === tokenId &&
          ethers.utils.formatEther(price) ===
            ethers.utils.formatEther(ethers.utils.parseEther(amount))
        ) {
          setOffer(amount)
          setIsLoading(false)
        }
      })

      await contract.placeAd(tokenId, ethers.utils.parseEther(amount))

      addNotification({
        message: `You've successfully put token #${tokenId} up for sale for a minimum price of ${amount} ETH. Please stand by for confirmation…`
      })
    } catch (error) {
      setIsLoading(false)
      errorHandler(error)
    }
  }

  const removeAd = async () => {
    setIsLoading(true)

    try {
      await contract.once('AdPlaced', (token, price) => {
        if (
          token.toNumber() === tokenId &&
          ethers.utils.formatEther(price) === '0.0'
        ) {
          setOffer('0.0')
          setIsLoading(false)
        }
      })

      await contract.removeAd(tokenId)

      addNotification({
        message: `You've successfully withdrawn your ad for token #${tokenId}. Please stand by for confirmation…`
      })
    } catch (error) {
      setIsLoading(false)
      errorHandler(error)
    }
  }

  const requestLogs = () => {
    setIsLoading(true)

    const message = `I am the current owner of token #${tokenId}`

    ethereum
      .request({
        method: 'personal_sign',
        params: [message, account]
      })
      .then(signature =>
        window.fetch(`${backendUri}log/${tokenId}`, {
          body: JSON.stringify({ message, signature }),
          headers: {
            'content-type': 'application/json'
          },
          method: 'POST'
        })
      )
      .then(res => res.blob())
      .then(blob => {
        setIsLoading(false)
        window.open(URL.createObjectURL(blob), '_blank')
      })
      .catch(error => {
        setIsLoading(false)
        errorHandler(error)
      })
  }

  useEffect(() => {
    if (!contract || !tokenId) {
      return
    }

    contract
      .exists(tokenId)
      .then(exists => exists && contract.ownerOf(tokenId))
      .then(owner => {
        if (owner) {
          setOwner(owner.toLowerCase())
          return contract.getAd(tokenId)
        }
        setOwner(false)
      })
      .then(offer => offer && setOffer(ethers.utils.formatEther(offer)))
      .catch(errorHandler)
  }, [contract, errorHandler, tokenId])

  if (owner === undefined) {
    return html`
      <div tw="italic">Loading…</div>
    `
  }

  if (owner === false) {
    return html`
      <div tw="italic">
        <p tw="font-bold mb-3">
          This token is available for minting!<br />
        </p>

        <p tw="mb-3">
          Price: 0.1 ETH
        </p>

        <${Button} disabled=${isLoading} color="yellow" onClick=${mintToken}>
          Mint now
        </${Button}>
      </div>
    `
  }

  if (owner === account) {
    return html`
      <div tw="italic">
        <p tw="font-bold mb-3">
          this is yours!
        </p>

        <p tw="mb-3">
          <${Button}
            color="yellow"
            disabled=${isLoading}
            onClick=${requestLogs}
          >
            Request chat log
          </${Button}>
        </p>

        <hr tw="border-gray-400 my-4 w-16" />

        ${
          offer === '0.0'
            ? html`
              <form onSubmit=${placeAd}>
                <div tw="mb-3">
                  <${TokenHistory}
                    errorHandler=${errorHandler}
                    tokenId=${tokenId}
                  />
                </div>

                <div tw="mb-3">
                  <p tw="font-bold">Want to sell this token?</p>

                  <${Input}
                    min="0.1"
                    placeholder="Minimum amount of ETH requested"
                    required
                    step="0.1"
                    type="number"
                  />
                </div>

                <p tw="mb-3 text-gray-500 text-xs">(10% commission on successful sale)</p>

                <${Button} disabled=${isLoading} type="submit">
                  Place ad
                </${Button}>
              </form>
            `
            : html`
              <div tw="mb-3">
                <div tw="mb-3">
                  <${TokenHistory} errorHandler=${errorHandler} tokenId=${tokenId} />
                </div>

                <p tw="mb-3">
                  You've put this token up for sale for a minimum price of${' '}
                  <span tw="font-bold">${offer}</span> ETH.
                </p>

                <${Button} disabled=${isLoading} onClick=${removeAd}>
                  Withdraw ad
                </${Button}>
              </div>
            `
        }
      </div>
    `
  }

  return html`
    <div tw="italic">
      <p tw="font-bold mb-3">
        ${offer === '0.0' ? 'Sold!' : 'For sale!'}
      </p>

      <p tw="mb-3">
        This token has already been minted and currently belongs to${' '}
        <${A}
          href="https://rinkeby.etherscan.io/address/${owner}"
          target="_blank"
          style="word-break:break-all"
        >
          ${owner}
        </${A}>.
      </p>

      <div tw="mb-3">
        <${TokenHistory} errorHandler=${errorHandler} tokenId=${tokenId} />
      </div>

      ${offer !== '0.0' &&
        html`
        <p tw="mb-3">
          The owner has put it up for sale for a minimum price of${' '}
          <span tw="font-bold">${offer} ETH</span>.
        </p>

        <${Button} color="yellow" disabled=${isLoading} onClick=${buyToken}>
          Buy now
        </${Button}>
      `}
    </div>
  `
}

export default TokenStatus
