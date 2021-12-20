import MetaMaskOnboarding from '@metamask/onboarding'
import { h } from 'preact'
import htm from 'htm'
import { setup } from '@twind/preact'
import LoginButton from './login-button'

const html = htm.bind(h)
const onboarding = new MetaMaskOnboarding()

setup()

const Header = ({ accounts, errorHandler, setAccounts }) => html`
  <div
    tw="flex flex-wrap items-center justify-center md:justify-between -m-2 pb-4 text-center"
  >
    <h1 tw="m-2 normal-case text-2xl tracking-wider underline">
      #NirvanaNFT
    </h1>

    <div tw="flex justify-center gap-2 m-4 w-full md:(m-2 w-auto)">
      <${LoginButton}
        color="yellow"
        errorHandler=${errorHandler}
        isMetaMaskInstalled=${MetaMaskOnboarding.isMetaMaskInstalled()}
        numAccounts=${accounts.length}
        setAccounts=${setAccounts}
        startOnboarding=${onboarding.startOnboarding}
        stopOnboarding=${onboarding.stopOnboarding}
      />
    </div>
  </div>
`

export default Header
