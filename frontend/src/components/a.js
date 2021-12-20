import { h } from 'preact'
import htm from 'htm'

const html = htm.bind(h)

const A = props => html`
  <a
    tw="border-b text-yellow-800 transition-colors hover:text-yellow-600"
    ...${props}
  />
`

export default A
