# HTML5 AudioPlayer

HTML5 audio player library (using browser native support).

See the [demo](https://juankman94.github.io/html5-audioplayer/index.html)!!

## How To

```javascript
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

const ap = new AudioPlayer({
  controls: {
    toggle: document.querySelector('#toggle'), // play/pause button
    prev: document.querySelector('#prev'),
    next: document.querySelector('#next'),
    volume: document.querySelector('#volume'), // volume (input[type=range])
    seek: document.querySelector('#seek'), // song progress (time) (input[type=range])
    currentTime: document.querySelector('#currentTime'), // song current time, e.g., 02:34
    duration: document.querySelector('#duration'), // song duration, e.g., 04:27
    thumbnail: document.querySelector('#thumbnail'), // img where to display the thumbnail
    artist: document.querySelector('#artist'),
    title: document.querySelector('#title'),
    // <ul>/<ol> where to add the playlist entries (<li>)
    playlist: document.querySelector('#playlist'),
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
