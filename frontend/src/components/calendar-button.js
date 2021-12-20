import { h } from 'preact'
import htm from 'htm'

const html = htm.bind(h)

const CalendarButton = props => html`
  <button
    tw="disabled:grayscale filter focus:(outline-none brightness-125) hover:(brightness-110) outline-none text-2xl transition-all"
    type="button"
    ...${props}
  />
`

export default CalendarButton
