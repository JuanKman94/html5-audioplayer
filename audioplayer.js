'use strict'

const PLAY_CHARACTER = "&#x25b6;"
const PAUSE_CHARACTER = "||"
const INITIAL_VOLUME = 0.5
const audioPlayer = {
  controls: {
    toggle: null,
    prev: null,
    next: null,
    volume: null,
    seek: null,
    currentTime: null,
    duration: null,
    track: null,
    artist: null,
    title: null,
    playlist: null,
  },
  playlist: [],
  currentSong: 0,
  song: new Audio(),

  /**
   * Return whether the audio player is not paused
   *
   * This is a virtual property that updates the toggle button
   * @return True if audio is being played, false otherwise
   */
  get isPlaying() {
    if (audioPlayer.song.paused) {
      audioPlayer.controls.toggle.innerHTML = PLAY_CHARACTER
      return false
    } else {
      audioPlayer.controls.toggle.innerHTML = PAUSE_CHARACTER
      return true
    }
  },

  // methods 

  init(newControls) {
    return new Promise((resolve, reject) => {
      try {
        for (let k in audioPlayer.controls) {
          if (newControls[k]) {
            audioPlayer.controls[k] = newControls[k]
          }
        }
      } catch (err) {
        reject(err)
      }

      resolve(audioPlayer)
    }).then((player) => {
      // add event listeners
      audioPlayer.controls.toggle.addEventListener('click', audioPlayer.togglePlay)
      audioPlayer.controls.next.addEventListener('click', audioPlayer.playNextSong)
      audioPlayer.controls.prev.addEventListener('click', audioPlayer.playPrevSong)
      audioPlayer.controls.volume.addEventListener('change', audioPlayer.setVolume)
      audioPlayer.controls.seek.addEventListener('change', audioPlayer.setSongCurrentTime)

      audioPlayer.song.addEventListener('timeupdate', audioPlayer.updateSeekBar)
      audioPlayer.song.addEventListener('timeupdate', audioPlayer.updateTimestamps)
      audioPlayer.song.addEventListener('ended', audioPlayer.onSongEnd)

      return audioPlayer
    })
  },

  setPlaylist(newPlaylist) {
    audioPlayer.playlist = newPlaylist
    audioPlayer.setSong(0)
  },

  setSong(i, forcePlay) {
    audioPlayer.song.src = audioPlayer.playlist[i].src
    audioPlayer.currentSong = i
    audioPlayer.setSongInfo(i)
    audioPlayer.updateTimestamps()
    audioPlayer.refreshPlaylist()

    if (forcePlay && !audioPlayer.isPlaying) {
      audioPlayer.song.play()
    }
  },
  playNextSong() {
    if (audioPlayer.currentSong < (playlist.length - 1)) {
      audioPlayer.setSong(audioPlayer.currentSong + 1, true)
    }
  },
  playPrevSong() {
    if (audioPlayer.currentSong > 0) {
      audioPlayer.setSong(audioPlayer.currentSong - 1, true)
    }
  },
  refreshPlaylist() {
    let li = null
    audioPlayer.controls.playlist.innerHTML = ""

    audioPlayer.playlist.forEach((el, i) => {
      li = document.createElement('li')
      li.textContent = `${i+1} ${audioPlayer.playlist[i].artist} - ${audioPlayer.playlist[i].title}`
      if (audioPlayer.currentSong == i) {
        li.classList.add('active')
      }
      audioPlayer.controls.playlist.appendChild(li)
    })
  },
  onSongEnd() {
    if (audioPlayer.currentSong === (audioPlayer.playlist.length - 1)) {
      audioPlayer.setSong(0, true)
    } else {
      audioPlayer.setSong(audioPlayer.currentSong + 1, true)
    }
  },
  setSongInfo(i) {
    audioPlayer.controls.track.textContent = i + 1
    audioPlayer.controls.artist.textContent = audioPlayer.playlist[i].artist
    audioPlayer.controls.title.textContent = audioPlayer.playlist[i].title
  },

  updateSeekBar() {
    audioPlayer.controls.seek.max = audioPlayer.song.duration
    audioPlayer.controls.seek.value = audioPlayer.song.currentTime
  },

  updateTimestamps(ev) {
    if (audioPlayer.song.currentTime) {
      audioPlayer.controls.currentTime.textContent = audioPlayer.song.currentTime.toFixed()
    }
    if (audioPlayer.song.duration) {
      audioPlayer.controls.duration.textContent = audioPlayer.song.duration.toFixed()
    }
  },

  setSongCurrentTime(ev) {
    if (audioPlayer.song) {
      audioPlayer.song.currentTime = ev.target.value
    }
  },

  setVolume(ev) {
    let val = ev.target.value
    if (val > 1) {
      val /= 100
    }

    if (audioPlayer.song) {
      audioPlayer.song.volume = val
    }
  },

  togglePlay(ev) {
    if (audioPlayer.isPlaying) {
      audioPlayer.song.pause()
    } else {
      audioPlayer.song.play()
    }
  }
}
