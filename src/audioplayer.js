/**
 * AudioPlayer default options; all can be overriden
 */
const defaultOptions = {
  /**
   * DOM elements used for controls and labels
   *
   * * toggle: `<button>` used to play/pause the player
   * * prev: `<button>` used to play the previous song
   * * next: `<button>` used to play the next song
   * * volume: `<input type=range>` used to change player volume
   * * seek: `<input type=range>` used to change show/change song current playing time
   * * currentTime: `<span>` used to display current playing time
   * * duration: `<span>` used to show song duration
   * * track: `<span>` used to show track number (song index in playlist)
   * * artist: `<span>` used to show song artist
   * * title: `<span>` used to show song title
   * * thumbnail: `<img>` used to show song thumbnail
   * * playlist: `[ <ul> | <ol> ]` used to show list playlist songs (`<li>`)
   */
  controls: {
    toggle: document.createElement('button'),
    prev: document.createElement('button'),
    next: document.createElement('button'),
    volume: document.createElement('input'),
    volumePerc: document.createElement('span'),
    seek: document.createElement('input'),
    currentTime: document.createElement('span'),
    duration: document.createElement('span'),
    track: document.createElement('span'),
    artist: document.createElement('span'),
    title: document.createElement('span'),
    thumbnail: document.createElement('img'),
    playlist: document.createElement('ul'),
  },
  labels: {
    /**
     * HTML text used in toggle button when player is playing
     */
    play: '&#x25b6;',
    /**
     * HTML text used in toggle button when player is paused
     */
    pause: '||',
    /**
     * Text used in playlist item/entry.
     *
     * The following special keys can be replaced with values from playlist entry
     *
     * ```
     * {
     *   '%N': "song index in playlist",
     *   '%A': "song artist",
     *   '%A': "song artist",
     * }
     * ```
     */
    playlistItem: '%N. %A - %T',
  },
  /**
   * List of songs used in player
   *
   * The format of each entry is:
   *
   * ```
   * {
   *   src: "song URL",
   *   artist: "song artist",
   *   title: "song title",
   *   thumbnail: "song thumbnail URL",
   * }
   * ```
   */
  playlist: [],
  /**
   * Current song index in playlist
   */
  currentSong: 0,
  /**
   * Audio instance
   */
  player: new Audio(),
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
    const ap = this

    initControls(ap, options.controls || {})
    initLabels(ap, options.labels || {})

    if (options.playlist) {
      ap.setPlaylist(options.playlist)
    }
    if (options.currentSong) {
      ap.currentSong = options.currentSong
    }

    if (! (ap.player instanceof Audio)) {
      if (ap.playlist.length > 0) {
        ap.player = new Audio(ap.playlist[ap.currentSong].src)
      } else {
        ap.player = new Audio()
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
   * @return {boolean} True if audio is being played, false otherwise
   */
  isPlaying.get = function() {
    if (this.player.paused) {
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

  ap.player.addEventListener('timeupdate', ap.updateTimestamps.bind(ap))
  ap.player.addEventListener('ended', ap.onSongEnd.bind(ap))
}

const initMethods = function(AudioPlayer) {
  const audioPlayerMethods = {
    /**
     * Set playlist
     *
     * @param {array} newPlaylist Array of objects
     */
    setPlaylist(newPlaylist) {
      this.playlist = newPlaylist
      this.refreshPlaylist()
      this.setSong(0)
    },

    /**
     * Set current song
     *
     * @param {number} i song index
     * @param {boolean} forcePlay if True, play song
     */
    setSong(i, forcePlay) {
      this.player.src = this.playlist[i].src
      this.currentSong = i
      this.setSongInfo(i)
      this.updateTimestamps()
      this.setPlaylistActiveSong()

      if (forcePlay && !this.isPlaying) {
        this.player.play()
      }
    },

    /**
     * Play next song
     */
    playNextSong() {
      if (this.currentSong < (playlist.length - 1)) {
        this.setSong(this.currentSong + 1, true)
      }
    },

    /**
     * Play previous song
     */
    playPrevSong() {
      if (this.currentSong > 0) {
        this.setSong(this.currentSong - 1, true)
      }
    },

    /**
     * Update `controls.playlist` control with `playlist` entries
     */
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

    /**
     * Play next song or loop if last song ended
     */
    onSongEnd() {
      if (this.currentSong === (this.playlist.length - 1)) {
        this.setSong(0, true)
      } else {
        this.setSong(this.currentSong + 1, true)
      }
    },

    /**
     * Update label controls with current song data
     */
    setSongInfo(i) {
      this.controls.track.textContent = i + 1
      this.controls.artist.textContent = this.playlist[i].artist
      this.controls.title.textContent = this.playlist[i].title
      this.controls.thumbnail.src = this.playlist[i].thumbnail
    },

    /**
     * Update playlist entries to add `active` CSS class to current song
     */
    setPlaylistActiveSong() {
      this.controls.playlist.childNodes.forEach((el, i) => {
        if (i === this.currentSong) {
          el.classList.add('active')
        } else {
          el.classList.remove('active')
        }
      })
    },

    /**
     * Update `controls.seek` and `controls.currentTime`
     */
    updateTimestamps(ev) {
      const timeZero = '00:00'

      if (this.player.currentTime) {
        this.controls.seek.value = this.player.currentTime
        this.controls.currentTime.textContent = this.formatSongTime(this.player.currentTime)
      } else {
        this.controls.currentTime.textContent = timeZero
      }
      if (this.player.duration) {
        this.controls.seek.max = this.player.duration
        this.controls.duration.textContent = this.formatSongTime(this.player.duration)
      } else {
        this.controls.duration.textContent = timeZero
      }
    },

    /**
     * Set player's current time
     *
     * @param {Event} ev Tested with `input[type=range]` change event
     */
    setSongCurrentTime(ev) {
      this.player.currentTime = ev.target.value
    },

    /**
     * Set player's volume
     *
     * @param {Event} ev Tested with `input[type=range]` change event
     */
    setVolume(ev) {
      let val = (ev.target !== undefined)
          ? ev.target.value
          : ev
      while (val > 1) {
        val /= 100
      }

      if (this.player) {
        this.player.volume = val

        let str = new Number(this.player.volume * 100).toFixed(1)
        this.controls.volumePerc.textContent = `${str}%`
      }
    },

    /**
     * Play/Pause player
     */
    togglePlay(ev) {
      if (this.isPlaying) {
        this.player.pause()
      } else {
        this.player.play()
      }
    },

    /**
     * Format number into MM:SS string
     */
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

/**
 * AudioPlayer constructor
 */
function AudioPlayer (options) {
  options = options || {}
  this._init(options)
}

initMixin(AudioPlayer)
initProperties(AudioPlayer)
initMethods(AudioPlayer)
