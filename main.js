const playlist = [
  {
    src: 'assets/song61.mp3',
    artist: 'OpenBSD',
    title: 'Winter of 95',
    thumbnail: 'https://www.openbsd.org/images/61_right.jpg',
  },
  {
    src: 'assets/song62.mp3',
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
      toggle: '#toggle',
      prev: '#prev',
      next: '#next',
      volume: '#volume',
      volumePerc: '#volume_perc',
      seek: '#seek',
      currentTime: '#currentTime',
      duration: '#duration',
      thumbnail: '#thumbnail',
      artist: '#artist',
      title: '#title',
      playlist: '#playlist',
    },
    playlist: playlist,
    labels: {
      playlistItem: '%N. %A > %T',
    },
  })

  ap.player.volume = DEFAULT_VOLUME / 100
  ap.controls.volume.value = DEFAULT_VOLUME

  const hotkeys = {
    'Space': function() { ap.togglePlay() },
    'ArrowUp': function() { ap.setVolume(ap.player.volume+0.025) },
    'ArrowRight': function() { ap.playNextSong() },
    'ArrowDown': function() { ap.setVolume(ap.player.volume-0.025) },
    'ArrowLeft': function() { ap.playPrevSong() },
  }

  document.addEventListener('keydown', (ev) => {
    if (hotkeys[ev.code]) {
      ev.preventDefault();
      hotkeys[ev.code]()
    }
  })
})
