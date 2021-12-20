const sounds = {
  breaks: new Audio('https://freesound.org/data/previews/2/2856_4150-lq.mp3'),
  gunshot: new Audio(
    'https://freesound.org/data/previews/369/369528_6758928-lq.mp3'
  ),
  soundClose: new Audio(
    'https://freesound.org/data/previews/485/485111_9961300-lq.mp3'
  ),
  soundOpen: new Audio(
    'https://freesound.org/data/previews/201/201159_3659362-lq.mp3'
  ),
  woosh: new Audio(
    'https://freesound.org/data/previews/402/402183_7725148-lq.mp3'
  )
}

export const play = name => sounds[name] && sounds[name].play().catch(() => {})
