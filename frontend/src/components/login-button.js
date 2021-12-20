import { h } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import htm from 'htm'
import Button from './button'

const html = htm.bind(h)

const LoginButton = ({
  errorHandler,
  isMetaMaskInstalled,
  numAccounts,
  setAccounts,
  startOnboarding,
  stopOnboarding,
  ...props
}) => {
  const [buttonText, setButtonText] = useState('install metamask!')
  const [isDisabled, setIsDisabled] = useState(false)

  const handleClick = () => {
    if (isMetaMaskInstalled) {
      window.ethereum
        .request({ method: 'eth_requestAccounts' })
        .then(newAccounts => setAccounts(newAccounts), errorHandler)
    } else {
      startOnboarding()
    }
  }

  useEffect(() => {
    if (!isMetaMaskInstalled) {
      return
    }

    if (numAccounts > 0) {
      setButtonText('connected')
      setIsDisabled(true)
      return stopOnboarding()
    }

    setButtonText('connect metamask')
    setIsDisabled(false)
  }, [isMetaMaskInstalled, numAccounts, stopOnboarding])

  useEffect(() => {
    const handleNewAccounts = newAccounts => setAccounts(newAccounts)

    if (isMetaMaskInstalled) {
      window.ethereum
        .request({ method: 'eth_requestAccounts' })
        .then(handleNewAccounts, errorHandler)

      window.ethereum.on('accountsChanged', handleNewAccounts)

      return () => {
        window.ethereum.off('accountsChanged', handleNewAccounts)
      }
    }
  }, [errorHandler, isMetaMaskInstalled, setAccounts])

  return html`
    <${Button} disabled=${isDisabled} onClick=${handleClick} ...${props}>
      ${buttonText}
    </${Button}>
  `
}

export default LoginButton
