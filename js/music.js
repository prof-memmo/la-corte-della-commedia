const MusicPlayer = {
    tracks: [
        "Hoffy Beats - Riding the Waves (freetouse.com).mp3",
        "NVL8 - Airplane Mode (freetouse.com).mp3",
        "Project Ex - Area 16 (freetouse.com).mp3",
        "Pufino - Recovery (freetouse.com).mp3",
        "Zambolino - Heist (freetouse.com).mp3"
    ],
    currentTrackIndex: 0,
    audioElement: null,
    isPlaying: false,

    init: function() {
        if (!this.audioElement) {
            this.audioElement = new Audio();
            this.audioElement.loop = false;
            this.audioElement.volume = 0.3;
            this.audioElement.addEventListener('ended', () => this.nextTrack());
            
            // Randomizza la prima traccia
            this.currentTrackIndex = Math.floor(Math.random() * this.tracks.length);
            this.loadTrack(this.currentTrackIndex);
        }
    },

    loadTrack: function(index) {
        if (index < 0) index = this.tracks.length - 1;
        if (index >= this.tracks.length) index = 0;
        this.currentTrackIndex = index;
        this.audioElement.src = `public/assets/Musica/${this.tracks[this.currentTrackIndex]}`;
        this.updateUI();
    },

    togglePlay: function() {
        if (!this.audioElement) this.init();

        if (this.isPlaying) {
            this.audioElement.pause();
            this.isPlaying = false;
            this.updateUI();
        } else {
            this._doPlay();
        }
    },

    _doPlay: function() {
        if (!this.audioElement) this.init();
        if (localStorage.getItem('corte_audio_muted') === 'true') return;

        const playPromise = this.audioElement.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                this.isPlaying = true;
                this.updateUI();
            }).catch(() => {
                this.isPlaying = false;
                this.updateUI();
            });
        } else {
            this.isPlaying = true;
            this.updateUI();
        }
    },

    nextTrack: function() {
        if (!this.audioElement) this.init();
        let nextIndex;
        do {
            nextIndex = Math.floor(Math.random() * this.tracks.length);
        } while (nextIndex === this.currentTrackIndex && this.tracks.length > 1);
        
        this.loadTrack(nextIndex);
        if (this.isPlaying) {
            this.audioElement.play().catch(() => {
                this.isPlaying = false;
                this.updateUI();
            });
        }
    },

    prevTrack: function() {
        this.nextTrack();
    },

    updateUI: function() {
        const playBtn = document.getElementById('music-play-btn');
        const titleEl = document.getElementById('music-track-title');
        if (playBtn) {
            playBtn.innerHTML = this.isPlaying ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
        }
        if (titleEl) {
            const filename = this.tracks[this.currentTrackIndex].split('/').pop().replace(' (freetouse.com).mp3', '');
            titleEl.textContent = filename;
        }
    }
};

window.MusicPlayer = MusicPlayer;

document.addEventListener('DOMContentLoaded', () => {
    MusicPlayer.init();
    setTimeout(() => {
        MusicPlayer._doPlay();
    }, 800);
});

(function() {
    let _started = false;
    function startOnInteraction(e) {
        if (_started) return;
        if (e && e.target) {
            const isAudioBtn = e.target.closest('#music-play-btn');
            if (isAudioBtn) {
                _started = true;
                document.removeEventListener('click', startOnInteraction, true);
                document.removeEventListener('touchstart', startOnInteraction, true);
                document.removeEventListener('keydown', startOnInteraction, true);
                return;
            }
        }
        
        _started = true;
        document.removeEventListener('click', startOnInteraction, true);
        document.removeEventListener('touchstart', startOnInteraction, true);
        document.removeEventListener('keydown', startOnInteraction, true);
        setTimeout(() => {
            if (window.MusicPlayer && !window.MusicPlayer.isPlaying) {
                window.MusicPlayer._doPlay();
            }
        }, 300);
    }
    document.addEventListener('click', startOnInteraction, true);
    document.addEventListener('touchstart', startOnInteraction, true);
    document.addEventListener('keydown', startOnInteraction, true);
})();
