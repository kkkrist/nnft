import { h } from 'preact'
import { useCallback, useEffect, useRef } from 'preact/hooks'
import htm from 'htm'
import { tw } from 'twind/css'
import { slideTopIn, slideTopOut } from '../animations'
import { play } from '../sounds'

const html = htm.bind(h)

const getColor = type => {
  switch (type) {
    case 'danger':
      return 'red'
    case 'warning':
      return 'yellow'
    default:
      return 'purple'
  }
}

const Notification = ({ id, message, removeNotification, type }) => {
  const color = getColor(type)
  const ref = useRef()

  const handleRemove = useCallback(() => {
    if (!ref.current) {
      return
    }

    ref.current.addEventListener('animationend', () => removeNotification(id))
    play('gunshot')
    ref.current.classList.add(tw`${slideTopOut}`)
  }, [id, removeNotification])

  useEffect(() => {
    play('breaks')

    if (!['danger', 'warning'].includes(type)) {
      window.setTimeout(handleRemove, 5000)
    }
  }, [handleRemove, type])

  return html`
    <div
      class=${tw`${slideTopIn}`}
      ref=${ref}
      tw=${`bg-${color}-600 border border-${color}-400 leading-4 m-4 p-4 rounded shadow-lg text-white`}
      style="will-change: transform;"
    >
      <div tw="-mr-3 -mt-3 pb-2 text-right">
        <button
          onClick=${handleRemove}
          tw=${`text-${color}-400 text-sm hover:animate-pulse`}
          type="button"
        >
          (X)
        </button>
      </div>
      ${message}
    </div>
  `
}

const Notifications = ({ notifications, removeNotification }) => html`
  <div style="width: 400px" tw="fixed max-w-full top-0 right-0">
    ${notifications.map(
      notification =>
        html`
          <${Notification}
            key=${notification.id}
            removeNotification=${removeNotification}
            ...${notification}
          />
        `
    )}
  </div>
`

export default Notifications
