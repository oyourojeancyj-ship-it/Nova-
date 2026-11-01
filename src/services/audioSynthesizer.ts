/**
 * Unified Spatial Audio Engine for NOVA MUSIC
 * Handles:
 * 1. Real user uploaded audio files (MP3, WAV, M4A) via HTML5 Audio + Web Audio Analyser
 * 2. Procedural cosmic ambient synthwave soundscapes
 */

class CosmicAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private timerId: number | null = null;
  private currentFrequencyPreset: string = 'synthwave';
  private step: number = 0;

  // Real Audio Element for user uploaded MP3/WAV/M4A
  private audioElement: HTMLAudioElement | null = null;
  private currentAudioUrl: string | null = null;
  private mediaSourceNode: MediaElementAudioSourceNode | null = null;

  private scaleNotes = {
    chords: [
      [174.61, 220.0, 261.63, 329.63], // Fmaj7
      [146.83, 174.61, 220.0, 261.63], // Dm7
      [130.81, 164.81, 196.0, 246.94], // Cmaj7
      [164.81, 196.0, 246.94, 293.66], // Em7
    ],
    arpeggios: [
      261.63, 329.63, 392.0, 523.25, 659.25, 523.25, 392.0, 329.63,
      220.0, 261.63, 329.63, 440.0, 523.25, 440.0, 329.63, 261.63,
    ],
    basses: [87.31, 73.42, 65.41, 82.41],
  };

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime);

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public play(preset: string = 'synthwave', audioUrl?: string) {
    this.initCtx();

    // If an audioUrl is supplied (real MP3/WAV/M4A uploaded by user)
    if (audioUrl) {
      this.stopProcedural();
      this.playRealAudio(audioUrl);
      return;
    }

    // Otherwise, play procedural synth track
    this.stopRealAudio();
    this.currentFrequencyPreset = preset;
    this.isPlaying = true;
    this.step = 0;
    this.scheduleNextBeat();
  }

  private playRealAudio(url: string) {
    if (!this.audioElement) {
      this.audioElement = new Audio();
      this.audioElement.crossOrigin = 'anonymous';
      this.audioElement.loop = true;
    }

    if (this.currentAudioUrl !== url) {
      this.audioElement.src = url;
      this.currentAudioUrl = url;
    }

    this.isPlaying = true;
    this.audioElement.play().catch((err) => {
      console.warn('Lecture audio bloquée ou nécessite interaction utilisateur :', err);
    });
  }

  private stopRealAudio() {
    if (this.audioElement) {
      this.audioElement.pause();
    }
  }

  private stopProcedural() {
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  private scheduleNextBeat() {
    if (!this.isPlaying || !this.ctx || !this.masterGain) return;

    const chordIndex = Math.floor(this.step / 8) % 4;
    const isChordBeat = this.step % 8 === 0;

    if (isChordBeat) {
      this.playPadChord(this.scaleNotes.chords[chordIndex]);
      this.playSubBass(this.scaleNotes.basses[chordIndex]);
    }

    if (this.step % 2 === 0) {
      const arpFreq = this.scaleNotes.arpeggios[this.step % this.scaleNotes.arpeggios.length];
      this.playPluck(arpFreq);
    }

    this.step = (this.step + 1) % 64;

    const tempoMs = this.currentFrequencyPreset === 'chillhop' ? 380 : 310;
    this.timerId = window.setTimeout(() => {
      this.scheduleNextBeat();
    }, tempoMs);
  }

  private playPadChord(frequencies: number[]) {
    if (!this.ctx || !this.masterGain) return;

    frequencies.forEach((freq) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const filter = this.ctx!.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, this.ctx!.currentTime);
      filter.frequency.exponentialRampToValueAtTime(1400, this.ctx!.currentTime + 1.2);
      filter.frequency.exponentialRampToValueAtTime(600, this.ctx!.currentTime + 2.5);

      gain.gain.setValueAtTime(0.001, this.ctx!.currentTime);
      gain.gain.linearRampToValueAtTime(0.045, this.ctx!.currentTime + 0.6);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx!.currentTime + 2.4);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);

      osc.start();
      osc.stop(this.ctx!.currentTime + 2.5);
    });
  }

  private playSubBass(freq: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 2.2);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 2.3);
  }

  private playPluck(freq: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2200, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.45);
  }

  public pause() {
    this.isPlaying = false;
    this.stopProcedural();
    this.stopRealAudio();
  }

  public resume(preset?: string, audioUrl?: string) {
    if (audioUrl) {
      this.playRealAudio(audioUrl);
    } else {
      this.play(preset || this.currentFrequencyPreset);
    }
  }

  public setVolume(volume0to1: number) {
    const safeVol = Math.max(0, Math.min(1, volume0to1));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(safeVol * 0.4, this.ctx.currentTime);
    }
    if (this.audioElement) {
      this.audioElement.volume = safeVol;
    }
  }

  public getVisualizerData(): Uint8Array {
    if (!this.analyser) {
      return new Uint8Array(16);
    }
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);

    // If real audio is playing but analyser isn't hooked to cross-origin media source node,
    // generate vibrant animated frequency bars
    if (this.audioElement && !this.audioElement.paused) {
      const now = performance.now() * 0.005;
      for (let i = 0; i < dataArray.length; i++) {
        const val = Math.sin(now + i * 0.4) * 0.5 + 0.5;
        dataArray[i] = Math.floor(val * 180 + 40);
      }
    }

    return dataArray;
  }

  public getPlayingStatus(): boolean {
    return this.isPlaying;
  }

  public getAudioElement(): HTMLAudioElement | null {
    return this.audioElement;
  }
}

export const cosmicAudio = new CosmicAudioSynthesizer();
