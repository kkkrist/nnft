import { h } from 'preact'
import htm from 'htm'

const html = htm.bind(h)

const Input = props => html`
  <input
    tw="block bg-gray-100 border-2 px-3 py-2 rounded w-full"
    type="text"
    ...${props}
  />
`

export default Input
