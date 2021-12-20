import { animation } from 'twind/css'

const easingIn = 'cubic-bezier(1, 0.2, 0, 0.4)'
const easingOut = 'cubic-bezier(0.4, 0, 0.2, 1)'

export const foldOut = animation(`0.15s ${easingIn}`, {
  from: {
    transform: 'scale(1, 0)'
  },
  to: {
    transform: 'none'
  }
})

export const slideTopIn = animation(`0.5s ${easingIn}`, {
  from: {
    transform: 'translateY(-100vw)'
  },
  '90%': {
    transform: 'translateY(2vw)'
  },
  to: {
    transform: 'none'
  }
})

export const slideTopOut = animation(`0.5s ${easingOut})`, {
  from: {
    transform: 'none'
  },
  '10%': {
    transform: 'translateY(2vw)'
  },
  to: {
    transform: 'translateY(-100vw)'
  }
})
