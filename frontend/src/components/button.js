import { h } from 'preact'
import htm from 'htm'

const html = htm.bind(h)

const Button = ({ color = 'gray', ...props }) => html`
  <button
    tw=${`bg-${color}-200 border-2 border-${color}-400 disabled:(opacity-75) hover:(bg-${color}-300 border-${color}-500) focus:(border-${color}-200 outline-none) p-2 rounded-full text-${color}-800 transition-all`}
    type="button"
    ...${props}
  />
`

export default Button
