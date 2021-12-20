import { ethers } from 'ethers'
import { h } from 'preact'
import { useContext, useEffect, useState } from 'preact/hooks'
import htm from 'htm'
import { ContractContext } from '../app'

const html = htm.bind(h)

const TokenHistory = ({ errorHandler, tokenId }) => {
  const contract = useContext(ContractContext)
  const [history, setHistory] = useState()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!tokenId) {
      return
    }

    if (isOpen && !history) {
      contract
        .queryFilter(contract.filters.Transfer(null, null, tokenId))
        .then(async events => {
          await Promise.all(
            events.map(async event => {
              event.transaction = await event.getTransaction()
            })
          )
          setHistory(
            events.map(({ args: { from, to }, transaction: { value } }) => ({
              from,
              to,
              value: ethers.utils.formatEther(value)
            }))
          )
        })
        .catch(error => {
          console.error(error)
          errorHandler(error)
        })
    }
  }, [contract, errorHandler, history, isOpen, tokenId])

  return html`
    <details onToggle=${e => setIsOpen(e.target.open)} open=${isOpen}>
      <summary tw="hover:cursor-pointer">Token history</summary>

      ${history
        ? html`
            <table tw="rounded table-fixed text-gray-500 text-sm w-full">
              <thead>
                <tr>
                  <th tw="border-b p-1 text-left w-2/5">from</th>
                  <th tw="border-b p-1 text-left w-2/5">to</th>
                  <th tw="border-b p-1 text-right w-1/5">
                    price (eth)
                  </th>
                </tr>
              </thead>

              <tbody>
                ${history.map(
                  ({ from, to, value }, i) => html`
                    <tr key=${i}>
                      <td tw="border-b p-1 truncate">
                        ${from === '0x0000000000000000000000000000000000000000'
                          ? 'Minting'
                          : html`
                              <a
                                href="https://rinkeby.etherscan.io/address/${from}"
                                target="_blank"
                                >${from}</a
                              >
                            `}
                      </td>
                      <td tw="border-b p-1 truncate">
                        <a
                          href="https://rinkeby.etherscan.io/address/${to}"
                          target="_blank"
                          >${to}</a
                        >
                      </td>
                      <td tw="border-b p-1 text-right">
                        ${value}
                      </td>
                    </tr>
                  `
                )}
              </tbody>
            </table>
          `
        : 'Loading…'}
    </details>
  `
}

export default TokenHistory
