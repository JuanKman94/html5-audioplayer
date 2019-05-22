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
  },
  playlist: [],
  currentSong: 0,
  song: new Audio(),
}

const mergeStrategy = function (parentVal, childVal) {
  return (childVal === undefined)
    ? parentVal
    : childVal
}

const initMixin = function (AudioPlayer) {
  for (let k in defaultOptions) {
    AudioPlayer.prototype[k] = defaultOptions[k]
  }

  // inspired by Vue
  AudioPlayer.prototype._init = function(options) {
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

const initProperties = function (AudioPlayer) {
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

const initControls = function (ap, newControls) {
  for (let k in defaultOptions.controls) {
    ap.controls[k] = mergeStrategy(defaultOptions.controls[k], newControls[k])
  }
}

const initLabels = function (ap, newLabels) {
  for (let k in defaultOptions.labels) {
    ap.labels[k] = mergeStrategy(defaultOptions.labels[k], newLabels[k])
  }
}

const initListeners = function (ap) {
  ap.controls.toggle.addEventListener('click', ap.togglePlay.bind(ap))
  ap.controls.next.addEventListener('click', ap.playNextSong.bind(ap))
  ap.controls.prev.addEventListener('click', ap.playPrevSong.bind(ap))
  ap.controls.volume.addEventListener('change', ap.setVolume.bind(ap))
  ap.controls.seek.addEventListener('change', ap.setSongCurrentTime.bind(ap))

  ap.song.addEventListener('timeupdate', ap.updateSeekBar.bind(ap))
  ap.song.addEventListener('timeupdate', ap.updateTimestamps.bind(ap))
  ap.song.addEventListener('ended', ap.onSongEnd.bind(ap))
}

const initMethods = function (AudioPlayer) {
  AudioPlayer.prototype.setPlaylist = function(newPlaylist) {
    this.playlist = newPlaylist
    this.setSong(0)
  },

  AudioPlayer.prototype.setSong = function(i, forcePlay) {
    this.song.src = this.playlist[i].src
    this.currentSong = i
    this.setSongInfo(i)
    this.updateTimestamps()
    this.refreshPlaylist()

    if (forcePlay && !this.isPlaying) {
      this.song.play()
    }
  },

  AudioPlayer.prototype.playNextSong = function() {
    if (this.currentSong < (playlist.length - 1)) {
      this.setSong(this.currentSong + 1, true)
    }
  },

  AudioPlayer.prototype.playPrevSong = function() {
    if (this.currentSong > 0) {
      this.setSong(this.currentSong - 1, true)
    }
  },

  AudioPlayer.prototype.refreshPlaylist = function() {
    let li = null
    this.controls.playlist.innerHTML = ""

    this.playlist.forEach((el, i) => {
      li = document.createElement('li')
      li.textContent = `${i+1} ${this.playlist[i].artist} - ${this.playlist[i].title}`
      if (this.currentSong == i) {
        li.classList.add('active')
      }
      this.controls.playlist.appendChild(li)
    })
  },

  AudioPlayer.prototype.onSongEnd = function() {
    if (this.currentSong === (this.playlist.length - 1)) {
      this.setSong(0, true)
    } else {
      this.setSong(this.currentSong + 1, true)
    }
  },

  AudioPlayer.prototype.setSongInfo = function(i) {
    this.controls.track.textContent = i + 1
    this.controls.artist.textContent = this.playlist[i].artist
    this.controls.title.textContent = this.playlist[i].title
  },

  AudioPlayer.prototype.updateSeekBar = function() {
    this.controls.seek.max = this.song.duration
    this.controls.seek.value = this.song.currentTime
  },

  AudioPlayer.prototype.updateTimestamps = function(ev) {
    if (this.song.currentTime) {
      this.controls.currentTime.textContent = this.song.currentTime.toFixed()
    }
    if (this.song.duration) {
      this.controls.duration.textContent = this.song.duration.toFixed()
    }
  },

  AudioPlayer.prototype.setSongCurrentTime = function(ev) {
    if (this.song) {
      this.song.currentTime = ev.target.value
    }
  },

  AudioPlayer.prototype.setVolume = function(ev) {
    let val = ev.target.value
    while (val > 1) {
      val /= 100
    }

    if (this.song) {
      this.song.volume = val
    }
  },

  AudioPlayer.prototype.togglePlay = function(ev) {
    if (this.isPlaying) {
      this.song.pause()
    } else {
      this.song.play()
    }
  }
}

function AudioPlayer (options) {
  options = options || {}
  this._init(options)
}

initMixin(AudioPlayer)
initProperties(AudioPlayer)
initMethods(AudioPlayer)
