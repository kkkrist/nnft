import dayjs from 'dayjs'
import htm from 'htm'
import { h } from 'preact'
import { tw } from 'twind/css'
import TokenStatus from './token-status'
import { foldOut } from '../animations'
import data from '../data/log-stats.json'

const html = htm.bind(h)

const Dialog = ({
  account,
  addNotification,
  backendUri,
  date = '',
  errorHandler,
  resetDate
}) => {
  const index = Object.keys(data).findIndex(d => d === date)
  const numLines = data[date]

  return date
    ? html`
        <div tw="bg-black bottom-0 fixed left-0 opacity-30 right-0 top-0" />
        <div
          onClick=${e => {
            if (e.target === e.currentTarget) {
              resetDate()
            }
          }}
          tw="fixed bottom-0 flex items-center left-0 justify-center right-0 top-0"
        >
          <div
            class=${tw`${foldOut}`}
            tw="bg-white max-h-screen overflow-y-auto p-6 rounded shadow-xl text-gray-900 w-10/12 md:(w-8/12) lg:(w-7/12) xl:(w-6/12)"
          >
            <div tw="-m-4 text-right">
              <button
                onClick=${resetDate}
                tw="text-gray-400 hover:animate-pulse"
                type="button"
              >
                (X)
              </button>
            </div>

            <h2 tw="mb-3 mt-6 text-purple-800 text-xl">
              ${dayjs(date).format('dddd, MMMM DD, YYYY')}
            </h2>

            <p tw="mb-3">
              NFT <strong>no. ${index + 1}</strong> (${date}) grants you access
              to${' '} <strong>${numLines} lines</strong> of historical #nirvana
              chat log from that day.
            </p>

            <p tw="mb-3">
              ${numLines > 100
                ? `Wow, this was a pretty chatty day! The fine folks of #nirvana had lots to talk about. Maybe something special happened on that day? There's only one way to find out!`
                : numLines > 50
                ? `You've picked a day with a higher than usual chat volume. What was going on? Did they fight over something? Was someone upset about work and spilled some details not meant for public consumption? Find out!`
                : numLines > 30
                ? `Ok, ok. Judging by the chat volume, this seems to have been a rather ordinary day. But maybe this NFT is still really good for betting and scheming? Try it!`
                : `Ok, this was a rather calm day. Hardly anyone talked anything interesting it seems like. But who knows what's really in there? Maybe some passwords?`}
            </p>

            <hr tw="border-gray-400 my-4 w-16" />

            ${account ? html`
              <${TokenStatus}
                account=${account}
                addNotification=${addNotification}
                backendUri=${backendUri}
                errorHandler=${errorHandler}
                tokenId=${index + 1}
              />
            ` : html`
              <div tw="font-italic">
                Please connect wallet to Metamask!
              </div>
            `}

          </div>
        </div>
      `
    : null
}

export default Dialog
