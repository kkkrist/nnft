import dayjs from 'dayjs'
import { h } from 'preact'
import htm from 'htm'
import data from '../data/log-stats.json'

const html = htm.bind(h)

const CalendarMonth = ({ dateStr, inventory, setDate }) => {
  const date = dayjs(dateStr)
  const days = date.daysInMonth()
  let weeks = Math.ceil(days / 7)

  if (
    date
      .day(0)
      .add(weeks, 'week')
      .subtract(1, 'day')
      .isBefore(date.add(1, 'month'))
  ) {
    weeks++
  }

  const month = Array(weeks)
    .fill(null)
    .map((_, week) =>
      Array(7)
        .fill(null)
        .map((val, day) => {
          const current = date.day(day + week * 7)
          return date.isAfter(current) ||
            current.isAfter(date.add(1, 'month').subtract(1, 'day'))
            ? val
            : current
        })
    )

  return html`
    <div tw="h-52 hover:(shadow-2xl) p-2 rounded shadow-lg transition-shadow">
      <h3 tw="font-bold">${date.format('MMMM')}</h3>
      <div tw="flex">
        ${month[1].map(
          d => html`
            <div tw="italic text-pink-200 text-right w-7">
              <span style="padding-right:3px;">
                ${d?.format('dd')}
              </span>
            </div>
          `
        )}
      </div>

      ${month.map(
        month => html`
          <div tw="flex">
            ${month.map(day => {
              const date = day && day.format('YYYY-MM-DD')
              const num = date && data[date]

              return html`
                <div
                  tw=${`text-right w-7 ${
                    inventory.includes(date)
                      ? 'bg-yellow-200 text-gray-800 hover:bg-yellow-300'
                      : ''
                  }`}
                >
                  <button
                    disabled=${!num}
                    onClick=${() => setDate(day.format('YYYY-MM-DD'))}
                    tw="focus:(outline-none text-yellow-500) hover:text-gray-800 group relative transition-colors"
                    type="button"
                  >
                    <span
                      style="padding-right:3px"
                      tw=${`rounded ${
                        num > 100
                          ? 'font-bold'
                          : num > 50
                          ? ''
                          : num > 30
                          ? 'opacity-95'
                          : num > 10
                          ? 'opacity-90'
                          : num > 0
                          ? 'opacity-80'
                          : 'opacity-40'
                      }`}
                    >
                      ${day?.format('D')}
                    </span>

                    ${!!num &&
                      html`
                        <span
                          tw="absolute bg-white group-hover:visible -mt-6 invisible px-2 py-1 rounded shadow-lg text-gray-800 text-sm whitespace-nowrap z-10"
                          >${num} lines</span
                        >
                      `}
                  </button>
                </div>
              `
            })}
          </div>
        `
      )}
    </div>
  `
}

export default CalendarMonth
