const AudioEngine = {
    ctx: null,
    bgmAudio: null,
    isMuted: false,

    init: function() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            console.log("AudioEngine inizializzato");
        } catch (e) {
            console.warn("Web Audio API non supportata in questo browser", e);
        }

        // Setup BGM
        this.bgmAudio = new Audio('assets/Musica/Project Ex - Area 16 (freetouse.com).mp3');
        this.bgmAudio.loop = true;
        this.bgmAudio.volume = 0.2; // Volume basso per sottofondo
        
        // Listen to first click to start audio context and BGM
        document.body.addEventListener('click', () => {
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
            if (this.bgmAudio.paused && !this.isMuted) {
                this.bgmAudio.play().catch(e => console.log("BGM autoplay impedito dal browser"));
            }
        }, { once: true });
    },

    toggleMute: function() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.bgmAudio.pause();
        } else {
            this.bgmAudio.play();
        }
        return this.isMuted;
    },

    // Generatore di bip generico
    playTone: function(freq, type, duration, vol) {
        if (!this.ctx || this.isMuted) return;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    },

    playClick: function() {
        // Un click morbido e legnoso
        this.playTone(300, 'sine', 0.1, 0.3);
    },

    playSuccess: function() {
        // Arpeggio per successo (campanellino)
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        osc.frequency.setValueAtTime(1046.50, now + 0.3); // C6
        
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 1);
    },

    playError: function() {
        // Suono grave e cupo
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.5);
        
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.5);
    },

    playGavel: function() {
        // Colpo di martelletto (rumore percussivo)
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(10, now + 0.1);
        
        gain.gain.setValueAtTime(1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
        
        // Eco del colpo
        setTimeout(() => {
             this.playTone(80, 'square', 0.1, 0.4);
        }, 150);
    }
};

window.AudioEngine = AudioEngine;
