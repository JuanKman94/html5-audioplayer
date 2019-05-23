const defaultOptions = {
  controls: {
    toggle: document.createElement('button'),
    prev: document.createElement('button'),
    next: document.createElement('button'),
    volume: document.createElement('input'),
    seek: document.createElement('input'),
    currentTime: document.createElement('span'),
    duration: document.createElement('span'),
    track: document.createElement('span'),
    artist: document.createElement('span'),
    title: document.createElement('span'),
    playlist: document.createElement('ul'),
  },
  labels: {
    play: '&#x25b6;',
    pause: '||',
    playlistItem: '%N. %A - %T',
  },
  playlist: [],
  currentSong: 0,
  song: new Audio(),
}

function pad(n, width, z) {
  z = z || '0'
  n = n + ''
  return n.length >= width
    ? n
    : new Array(width - n.length + 1).join(z) + n
}

const mergeStrategy = function(parentVal, childVal) {
  return (childVal === undefined)
    ? parentVal
    : childVal
}

const initMixin = (AudioPlayer) => {
  for (let k in defaultOptions) {
    AudioPlayer.prototype[k] = defaultOptions[k]
  }

  // inspired by Vue
  AudioPlayer.prototype._init = function(options) {
    console.debug('_init:', options)
    const ap = this

    initControls(ap, options.controls || {})
    initLabels(ap, options.labels || {})

    if (options.playlist) {
      ap.setPlaylist(options.playlist)
    }
    if (options.currentSong) {
      ap.currentSong = options.currentSong
    }

    if (! (ap.song instanceof Audio)) {
      if (ap.playlist.length > 0) {
        ap.song = new Audio(ap.playlist[ap.currentSong].src)
      } else {
        ap.song = new Audio()
      }
    }

    initListeners(ap)
  }
}

const initProperties = function(AudioPlayer) {
  const isPlaying = {}

  /**
   * Return whether the audio player is not paused
   *
   * This is a virtual property that updates the toggle button
   * @return True if audio is being played, false otherwise
   */
  isPlaying.get = function() {
    if (this.song.paused) {
      this.controls.toggle.innerHTML = this.labels.play
      return false
    } else {
      this.controls.toggle.innerHTML = this.labels.pause
      return true
    }
  }

  Object.defineProperty(AudioPlayer.prototype, 'isPlaying', isPlaying)
}

const initControls = function(ap, newControls) {
  for (let k in defaultOptions.controls) {
    ap.controls[k] = mergeStrategy(defaultOptions.controls[k], newControls[k])
  }
}

const initLabels = function(ap, newLabels) {
  for (let k in defaultOptions.labels) {
    ap.labels[k] = mergeStrategy(defaultOptions.labels[k], newLabels[k])
  }
}

const initListeners = function(ap) {
  ap.controls.toggle.addEventListener('click', ap.togglePlay.bind(ap))
  ap.controls.next.addEventListener('click', ap.playNextSong.bind(ap))
  ap.controls.prev.addEventListener('click', ap.playPrevSong.bind(ap))
  ap.controls.volume.addEventListener('change', ap.setVolume.bind(ap))
  ap.controls.seek.addEventListener('change', ap.setSongCurrentTime.bind(ap))

  ap.song.addEventListener('timeupdate', ap.updateTimestamps.bind(ap))
  ap.song.addEventListener('ended', ap.onSongEnd.bind(ap))
}

const initMethods = function(AudioPlayer) {
  const audioPlayerMethods = {
    setPlaylist(newPlaylist) {
      this.playlist = newPlaylist
      this.refreshPlaylist()
      this.setSong(0)
    },

    setSong(i, forcePlay) {
      this.song.src = this.playlist[i].src
      this.currentSong = i
      this.setSongInfo(i)
      this.updateTimestamps()
      this.setPlaylistActiveSong()

      if (forcePlay && !this.isPlaying) {
        this.song.play()
      }
    },

    playNextSong() {
      if (this.currentSong < (playlist.length - 1)) {
        this.setSong(this.currentSong + 1, true)
      }
    },

    playPrevSong() {
      if (this.currentSong > 0) {
        this.setSong(this.currentSong - 1, true)
      }
    },

    refreshPlaylist() {
      let li = null,
        a = null,
        k = null,
        keys = {
          N: null, // track number
          A: null, // artist
          T: null, // title
        },
        text = null
      const songClicked = (j) => this.setSong(j, true)
      this.controls.playlist.innerHTML = ""

      this.playlist.forEach((el, i) => {
        li = document.createElement('li')
        a = document.createElement('a')
        keys = { N: i+1, A: this.playlist[i].artist, T: this.playlist[i].title }
        text = this.labels.playlistItem

        for (k in keys) {
          text = text.replace(`%${k}`, keys[k])
        }

        a.textContent = text
        a.href = 'javascript:void(0)'

        a.addEventListener('click', songClicked.bind(this, i))
        li.appendChild(a)
        this.controls.playlist.appendChild(li)
      })
    },

    onSongEnd() {
      if (this.currentSong === (this.playlist.length - 1)) {
        this.setSong(0, true)
      } else {
        this.setSong(this.currentSong + 1, true)
      }
    },

    setSongInfo(i) {
      this.controls.track.textContent = i + 1
      this.controls.artist.textContent = this.playlist[i].artist
      this.controls.title.textContent = this.playlist[i].title
    },

    setPlaylistActiveSong() {
      this.controls.playlist.childNodes.forEach((el, i) => {
        if (i === this.currentSong) {
          el.classList.add('active')
        } else {
          el.classList.remove('active')
        }
      })
    },

    updateTimestamps(ev) {
      const timeZero = '00:00'

      if (this.song.currentTime) {
        this.controls.seek.value = this.song.currentTime
        this.controls.currentTime.textContent = this.formatSongTime(this.song.currentTime)
      } else {
        this.controls.currentTime.textContent = timeZero
      }
      if (this.song.duration) {
        this.controls.seek.max = this.song.duration
        this.controls.duration.textContent = this.formatSongTime(this.song.duration)
      } else {
        this.controls.duration.textContent = timeZero
      }
    },

    setSongCurrentTime(ev) {
      if (this.song) {
        this.song.currentTime = ev.target.value
      }
    },

    setVolume(ev) {
      let val = ev.target.value
      while (val > 1) {
        val /= 100
      }

      if (this.song) {
        this.song.volume = val
      }
    },

    togglePlay(ev) {
      if (this.isPlaying) {
        this.song.pause()
      } else {
        this.song.play()
      }
    },

    formatSongTime(t) {
      const s = (t % 60).toFixed()
      const m = (t / 60).toFixed()

      return `${pad(m, 2)}:${pad(s,2)}`
    },
  }

  for (let k in audioPlayerMethods) {
    AudioPlayer.prototype[k] = audioPlayerMethods[k]
  }
}

function AudioPlayer (options) {
  options = options || {}
  this._init(options)
}

initMixin(AudioPlayer)
initProperties(AudioPlayer)
initMethods(AudioPlayer)
