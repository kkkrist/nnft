/* global __SNOWPACK_ENV__ */
import.meta.hot
import { ethers } from 'ethers'
import detectEthereumProvider from '@metamask/detect-provider'
import { createContext, h, render } from 'preact'
import { useCallback, useEffect, useState } from 'preact/hooks'
import htm from 'htm'
import Calendar from './components/calendar'
import Dialog from './components/dialog'
import Header from './components/header'
import Notifications from './components/notifications'
import address from './data/address.json'
import artifact from './data/artifact.json'
import data from './data/log-stats.json'
import { play } from './sounds'

const days = Object.keys(data)
const html = htm.bind(h)
const {
  SNOWPACK_PUBLIC_BACKEND_URI,
  SNOWPACK_PUBLIC_CHAIN_ID,
  SNOWPACK_PUBLIC_NETWORK
} = __SNOWPACK_ENV__

const getDate = search => {
  const params = new URLSearchParams(search)
  const index = days.findIndex(day => day === params.get('date'))

  if (index > -1) {
    return days[index]
  }
}

export const ContractContext = createContext(null)

const App = () => {
  const [accounts, setAccounts] = useState([])
  const [contract, setContract] = useState()
  const [contractInfo, setContractInfo] = useState({ owner: '0x' })
  const [date, setDate] = useState(getDate(window.location.search))
  const [inventory, setInventory] = useState([])
  const [network, setNetwork] = useState(window.ethereum?.chainId)
  const [notifications, setNotifications] = useState([])

  const removeNotification = useCallback(
    id => setNotifications(prevState => prevState.filter(n => n.id !== id)),
    []
  )

  const addNotification = useCallback(
    notification =>
      setNotifications(prevState => [
        ...prevState,
        { id: Math.random(), ...notification }
      ]),
    []
  )

  const errorHandler = useCallback(
    error => {
      console.error(error)
      addNotification({ message: error.message, type: 'danger' })
    },
    [addNotification]
  )

  const handleWithdraw = async () => {
    try {
      await contract.once('Withdrawal', () => {
        addNotification({ message: 'Withdrawal successful!' })
        setContractInfo(prevState => ({
          ...prevState,
          balance: '0.0'
        }))
      })

      await contract.withdraw()

      addNotification({ message: 'Withdrawal pending…' })
    } catch (error) {
      errorHandler(error)
    }
  }

  useEffect(() => {
    if (network && network !== SNOWPACK_PUBLIC_CHAIN_ID) {
      addNotification({
        id: 'switchChain',
        message: `Please switch metamask to the ${SNOWPACK_PUBLIC_NETWORK} network!`,
        type: 'warning'
      })
    }

    const changeNetwork = chainId => {
      setNetwork(chainId)

      if (chainId === SNOWPACK_PUBLIC_CHAIN_ID) {
        removeNotification('switchChain')
      }
    }

    window.ethereum?.on('chainChanged', changeNetwork)
    return () => window.ethereum.removeListener('chainChanged', changeNetwork)
  }, [addNotification, network, removeNotification])

  useEffect(() => {
    if (network !== SNOWPACK_PUBLIC_CHAIN_ID) {
      return
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum)

    let currentContract
    try {
      currentContract = new ethers.Contract(
        address.address,
        artifact.abi,
        provider.getSigner(0)
      )
      setContract(currentContract)
    } catch (error) {
      addNotification({ message: error.message, type: 'danger' })
    }

    if (accounts[0] && currentContract) {
      const refreshInventory = () => {
        addNotification({ id: 'inventory', message: 'Loading your inventory…' })

        currentContract
          .balanceOf(accounts[0])
          .then(numTokens =>
            Promise.all(
              Array(numTokens.toNumber())
                .fill(null)
                .map((_, i) =>
                  currentContract.tokenOfOwnerByIndex(accounts[0], i)
                )
            )
          )
          .then(tokens => {
            setInventory(tokens.map(token => days[token.toNumber() - 1]))
            removeNotification('inventory')
            addNotification({ message: 'Your inventory has been (re-)loaded!' })
          })
          .catch(errorHandler)
      }

      refreshInventory()

      const filter = {
        address: address.address,
        topics: [ethers.utils.id('Transfer(address,address,uint256)')]
      }

      currentContract.on(filter, refreshInventory)
      return () => currentContract.off(filter, refreshInventory)
    }
  }, [accounts, addNotification, errorHandler, network, removeNotification])

  useEffect(() => {
    if (date) {
      play('soundOpen')
      if (!window.location.search.includes('date=')) {
        window.history.pushState({}, '', `?date=${date}`)
      }
    } else if (date !== undefined) {
      play('soundClose')
      if (window.location.search.includes('date=')) {
        window.history.pushState({}, '', '?')
      }
    }
  }, [date])

  useEffect(() => {
    if (date && !window.location.search.includes('date=')) {
      return window.history.pushState({}, '', `?date=${date}`)
    }

    if (!date && window.location.search.includes('date=')) {
      window.history.pushState({}, '', '?')
    }
  }, [date])

  useEffect(() => {
    const handlePopstate = () =>
      setDate(prevState => {
        const date = getDate(window.location.search)
        if (date !== prevState) {
          return date
        }
        return prevState
      })

    window.addEventListener('popstate', handlePopstate)
    return () => window.removeEventListener('popstate', handlePopstate)
  }, [])

  useEffect(() => {
    if (!contract) {
      return
    }

    Promise.all([contract.getBalance(), contract.owner()]).then(
      ([balance, owner]) =>
        setContractInfo({
          balance: ethers.utils.formatEther(balance),
          owner: owner.toLowerCase()
        }),
      errorHandler
    )
  }, [accounts, contract, contractInfo.owner, errorHandler])

  useEffect(() => {
    const handler = ({ key }) => key === 'Escape' && setDate('')
    document.body.addEventListener('keydown', handler)
    return () => document.body.removeEventListener('keydown', handler)
  }, [])

  return html`
    <div
      tw="bg-gradient-to-t from-purple-600 lowercase min-h-screen overflow-hidden p-4 text-white to-pink-600 via-red-600"
    >
      <${Header}
        accounts=${accounts}
        errorHandler=${errorHandler}
        setAccounts=${setAccounts}
      />

      <div tw="mb-8 text-center">
        <${Calendar}
          initialYear=${date && Number(date.split('-')[0])}
          inventory=${inventory}
          setDate=${setDate}
        />
      </div>

      <div tw="text-center text-gray-300 text-sm">
        <p>
          Contract address:${' '}
          <a
            href="https://rinkeby.etherscan.io/address/${address.address}"
            target="_blank"
          >
            ${address.address}
          </a>
        </p>

        ${accounts?.[0] === contractInfo.owner &&
          html`
            <p>
              Contract balance: ${contractInfo.balance} ETH.${' '}

              <button onClick=${handleWithdraw} tw="mr-2" type="button">
                withdraw
              </button>

              <button onClick=${() => contract.pause()} tw="mr-2" type="button">
                pause
              </button>

              <button onClick=${() => contract.unpause()} type="button">
                unpause
              </button>
            </p>
          `}

        <p>
          Repo:${' '}
          <a
            href="https://github.com/kkkrist/nnft"
            target="_blank"
          >
            github.com/kkkrist/nnft
          </a>
        </p>

        <p>
          OpenSea:${' '}
          <a
            href="https://testnets.opensea.io/collection/nirvananft"
            target="_blank"
          >
            nirvananft
          </a>
        </p>

        <p tw="mb-4">
          Legal: This website is not intended for public use.
        </p>
      </div>

      <${ContractContext.Provider} value=${contract}>
        <${Dialog}
          account=${accounts[0]}
          addNotification=${addNotification}
          backendUri=${SNOWPACK_PUBLIC_BACKEND_URI}
          date=${date}
          errorHandler=${errorHandler}
          resetDate=${() => setDate('')}
        />
      </${ContractContext.Provider}>


      <${Notifications}
        notifications=${notifications}
        removeNotification=${removeNotification}
      />
    </div>
  `
}

const init = () =>
  render(
    html`
      <${App} />
    `,
    document.body
  )

detectEthereumProvider().then(init, console.error)
