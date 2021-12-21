# HTML5 AudioPlayer

HTML5 audio player library (using browser native support).

See the [demo](https://juankman94.github.io/html5-audioplayer/index.html)!!

## How To

```javascript
const playlist = [
  {
    src: 'assets/song68.mp3',
    artist: 'OpenBSD',
    title: 'Hacker People',
    thumbnail: 'https://www.openbsd.org/images/68_right.gif',
  },
  {
    src: 'assets/song62.mp3',
    artist: 'OpenBSD',
    title: 'A 3 line diff',
    thumbnail: 'https://www.openbsd.org/images/62_right.gif',
  },
  {
    src: 'assets/song61.mp3',
    artist: 'OpenBSD',
    title: 'Winter of 95',
    thumbnail: 'https://www.openbsd.org/images/61_right.jpg',
  },
]

const ap = new AudioPlayer({
  controls: {
    toggle: '#toggle', // play/pause button
    prev: '#prev',
    next: '#next',
    volume: '#volume', // volume (input[type=range])
    seek: '#seek', // song progress (time) (input[type=range])
    currentTime: '#currentTime', // song current time, e.g., 02:34
    duration: '#duration', // song duration, e.g., 04:27
    thumbnail: '#thumbnail', // img where to display the thumbnail
    artist: '#artist',
    title: '#title',
    // <ul>/<ol> where to add the playlist entries (<li>)
    playlist: '#playlist',
  },
  playlist: playlist,
  labels: {
    // format used for the text in playlist entries
    // %N = index in `playlist`, %A = artist, %T = title
    playlistItem: '%N. %A > %T',
    pause: '||', // HTML-text used in toggle button when in pause
    play: '>', // HTML-text used in toggle button when in play
  },
})

// subscribe to any <audio> events
ap.player.addEventListener('ended', () => { alert('that was a blast!') })
```
