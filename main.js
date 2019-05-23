const playlist = [
  {
    src: 'assets/song61.ogg',
    artist: 'OpenBSD',
    title: 'Winter of 95',
    thumbnail: 'https://www.openbsd.org/images/61_right.jpg',
  },
  {
    src: 'assets/song62.ogg',
    artist: 'OpenBSD',
    title: 'A 3 line diff',
    thumbnail: 'https://www.openbsd.org/images/62_right.gif',
  },
]
let ap = null

window.addEventListener('DOMContentLoaded', (ev) => {
  const DEFAULT_VOLUME = 25
  ap = new AudioPlayer({
    controls: {
      toggle: document.querySelector('#toggle'),
      prev: document.querySelector('#prev'),
      next: document.querySelector('#next'),
      volume: document.querySelector('#volume'),
      seek: document.querySelector('#seek'),
      currentTime: document.querySelector('#currentTime'),
      duration: document.querySelector('#duration'),
      thumbnail: document.querySelector('#thumbnail'),
      artist: document.querySelector('#artist'),
      title: document.querySelector('#title'),
      playlist: document.querySelector('#playlist'),
    },
    playlist: playlist,
    labels: {
      playlistItem: '%N. %A > %T',
    },
  })

  ap.player.volume = DEFAULT_VOLUME / 100
  ap.controls.volume.value = DEFAULT_VOLUME
})
