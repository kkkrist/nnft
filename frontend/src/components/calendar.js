import { h } from 'preact'
import { useEffect, useRef, useState } from 'preact/hooks'
import htm from 'htm'
import CalendarButton from './calendar-button'
import CalendarMonth from './calendar-month'
import { play } from '../sounds'

const html = htm.bind(h)

const Calendar = ({ initialYear, inventory, setDate }) => {
  const containerRef = useRef()

  const [year, setYear] = useState(
    initialYear ||
      (/^20[1-2][0-9]$/.test(localStorage.year) ? localStorage.year : 2011)
  )
  const [nextYear, setNextYear] = useState(year)

  const handleClick = ({ target: { name } }) =>
    setNextYear(prevState => (name === 'inc' ? ++prevState : --prevState))

  useEffect(() => {
    if (nextYear !== year) {
      play('woosh')
      const inc = nextYear > year

      const animation = containerRef.current.animate(
        {
          opacity: 0.25,
          transform: inc ? 'translateX(-2rem)' : 'translateX(2rem)'
        },
        {
          duration: 150,
          fill: 'forwards',
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          iterations: 1
        }
      )

      animation.finished.then(() => {
        setYear(prevState => (inc ? ++prevState : --prevState))
      })

      return () => animation.finish()
    }
  }, [nextYear, year])

  useEffect(() => {
    localStorage.setItem('year', year)

    const animation = containerRef.current.animate(
      { opacity: 1, transform: 'none' },
      {
        duration: 50,
        fill: 'forwards',
        easing: 'cubic-bezier(1, 0.2, 0, 0.4)',
        iterations: 1
      }
    )

    return () => animation.finish()
  }, [year])

  return html`
    <div tw="flex gap-2 items-center justify-center">
      <${CalendarButton}
        disabled=${nextYear <= 2011 || nextYear !== year}
        onClick=${handleClick}
      >
        👈
      </${CalendarButton}>

      <h3 tw="text-xl">${nextYear}</h3>

      <${CalendarButton}
        disabled=${nextYear >= 2021 || nextYear !== year}
        name='inc'
        onClick=${handleClick}
      >
        👉
      </${CalendarButton}>
    </div>

    <div
      ref=${containerRef}
      style="will-change: opacity, transform"
      tw="inline-grid gap-8 grid-cols-1 transition-transform sm:(grid-cols-2) md:(grid-cols-3) lg:(grid-cols-4)"
    >
      ${Array(12)
        .fill(null)
        .map(
          (_, i) =>
            html`
              <${CalendarMonth}
                dateStr=${`${year}-${i + 1}`}
                inventory=${inventory}
                setDate=${setDate}
              />
            `
        )}
    </div>
  `
}

export default Calendar
