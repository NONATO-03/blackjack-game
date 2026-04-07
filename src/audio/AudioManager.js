/**
 * AudioManager - Singleton que gerencia playback de áudio
 * Suporta SFX, música de fundo, volume control, mute
 */

import { EventBus } from '../events/EventBus.js';

export class AudioManager {
  static #instance = null;

  #audioContext = null;
  #masterGain = null;
  #sfxGain = null;
  #musicGain = null;
  #activeAudio = new Map(); // { key: AudioBufferSourceNode }
  #isMuted = false;
  #masterVolume = 0.7;     // 0-1
  #sfxVolume = 0.8;         // 0-1
  #musicVolume = 0.5;       // 0-1
  #soundCache = new Map();
  #isInitialized = false;
  #soundBank = null;

  static getInstance() {
    if (!AudioManager.#instance) {
      AudioManager.#instance = new AudioManager();
    }
    return AudioManager.#instance;
  }

  /**
   * Inicializa AudioManager
   * Cria Web Audio API context
   */
  async init(soundBank = null) {
    if (this.#isInitialized) {
      console.warn('[AudioManager] Já inicializado');
      return;
    }

    try {
      console.log('[AudioManager] Inicializando...');

      // Injetar SoundBank
      this.#soundBank = soundBank;

      // Criar context (user gesture required por browser policy)
      if (!this.#audioContext) {
        this.#audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }

      // Setup gain nodes for mixing
      this.#masterGain = this.#audioContext.createGain();
      this.#masterGain.gain.value = this.#masterVolume;
      this.#masterGain.connect(this.#audioContext.destination);

      // SFX layer
      this.#sfxGain = this.#audioContext.createGain();
      this.#sfxGain.gain.value = this.#sfxVolume;
      this.#sfxGain.connect(this.#masterGain);

      // Music layer
      this.#musicGain = this.#audioContext.createGain();
      this.#musicGain.gain.value = this.#musicVolume;
      this.#musicGain.connect(this.#masterGain);

      // Configurar listeners
      this.#setupListeners();

      // Requisitar user gesture para context
      this.#requestUserGesture();

      this.#isInitialized = true;
      console.log('[AudioManager] Inicializado com sucesso');
      EventBus.emit('audio:initialized');
    } catch (error) {
      console.error('[AudioManager] Erro na inicialização:', error);
    }
  }

  /**
   * Requisita user gesture para desbloquear audio context
   * @private
   */
  #requestUserGesture() {
    const resumeAudio = () => {
      if (this.#audioContext && this.#audioContext.state === 'suspended') {
        this.#audioContext.resume().then(() => {
          console.log('[AudioManager] Audio context resumido');
          EventBus.emit('audio:context-resumed');
        });
      }
      document.removeEventListener('click', resumeAudio);
      document.removeEventListener('touchend', resumeAudio);
    };

    document.addEventListener('click', resumeAudio);
    document.addEventListener('touchend', resumeAudio);
  }

  /**
   * Toca um SFX
   * @param {string} key - Identificador do som
   * @param {Object} options - { volume, loop, fadeIn, delay }
   */
  async playSFX(key, options = {}) {
    if (!this.#isInitialized) {
      console.warn('[AudioManager] Não inicializado ainda');
      return;
    }

    if (this.#isMuted) return;

    try {
      const buffer = await this.#getAudioBuffer(key);
      if (!buffer) {
        console.warn(`[AudioManager] Som não encontrado: ${key}`);
        return;
      }

      const {
        volume = this.#sfxVolume,
        loop = false,
        fadeIn = 0,
        delay = 0
      } = options;

      // Criar source
      const source = this.#audioContext.createBufferSource();
      const gainNode = this.#audioContext.createGain();

      source.buffer = buffer;
      source.loop = loop;

      // Setup volume
      gainNode.gain.value = fadeIn > 0 ? 0 : volume;
      if (fadeIn > 0) {
        gainNode.gain.linearRampToValueAtTime(volume, this.#audioContext.currentTime + fadeIn);
      }

      // Conectar ao graph
      source.connect(gainNode);
      gainNode.connect(this.#sfxGain);

      // Play
      if (delay > 0) {
        source.start(this.#audioContext.currentTime + delay);
      } else {
        source.start();
      }

      // Rastrear
      const id = `${key}-${Date.now()}`;
      this.#activeAudio.set(id, source);

      // Cleanup ao terminar
      source.onended = () => {
        this.#activeAudio.delete(id);
      };

      EventBus.emit('audio:sfx-played', { key, id });
      console.log(`[AudioManager] SFX tocado: ${key}`);

      return id;
    } catch (error) {
      console.error(`[AudioManager] Erro ao tocar ${key}:`, error);
    }
  }

  /**
   * Toca música de fundo
   * @param {string} key - Identificador da música
   * @param {Object} options - { volume, fadeIn, fadeOut }
   */
  async playMusic(key, options = {}) {
    if (!this.#isInitialized) {
      console.warn('[AudioManager] Não inicializado ainda');
      return;
    }

    try {
      // Parar música anterior se houver
      this.stopMusic();

      const buffer = await this.#getAudioBuffer(key);
      if (!buffer) {
        console.warn(`[AudioManager] Música não encontrada: ${key}`);
        return;
      }

      const {
        volume = this.#musicVolume,
        fadeIn = 1,
        fadeOut = 1
      } = options;

      // Criar source com loop
      const source = this.#audioContext.createBufferSource();
      const gainNode = this.#audioContext.createGain();

      source.buffer = buffer;
      source.loop = true;

      // Setup volume com fade-in
      gainNode.gain.value = 0;
      gainNode.gain.linearRampToValueAtTime(volume, this.#audioContext.currentTime + fadeIn);

      // Conectar
      source.connect(gainNode);
      gainNode.connect(this.#musicGain);

      // Play
      source.start();

      // Armazenar para parar depois
      this.#activeAudio.set('__music__', source);

      EventBus.emit('audio:music-started', { key });
      console.log(`[AudioManager] Música iniciada: ${key}`);

      return source;
    } catch (error) {
      console.error(`[AudioManager] Erro ao tocar música ${key}:`, error);
    }
  }

  /**
   * Para música
   * @param {number} fadeOut - Tempo de fade-out em segundos
   */
  async stopMusic(fadeOut = 1) {
    const source = this.#activeAudio.get('__music__');
    if (!source) return;

    try {
      // Fade out
      const gainNode = source.context.createGain();
      source.disconnect();
      source.connect(gainNode);
      gainNode.connect(this.#audioContext.destination);

      gainNode.gain.setValueAtTime(
        this.#musicVolume,
        this.#audioContext.currentTime
      );
      gainNode.gain.linearRampToValueAtTime(
        0,
        this.#audioContext.currentTime + fadeOut
      );

      source.stop(this.#audioContext.currentTime + fadeOut);
      this.#activeAudio.delete('__music__');

      console.log('[AudioManager] Música parada');
    } catch (error) {
      console.error('[AudioManager] Erro ao parar música:', error);
    }
  }

  /**
   * Para um SFX específico
   * @param {string} id - ID retornado por playSFX
   */
  stopSFX(id) {
    const source = this.#activeAudio.get(id);
    if (source) {
      try {
        source.stop();
        this.#activeAudio.delete(id);
      } catch (error) {
        console.warn(`[AudioManager] Erro ao parar SFX ${id}:`, error);
      }
    }
  }

  /**
   * Para todos os áudios
   */
  stopAll() {
    this.stopMusic(0.3);
    this.#activeAudio.forEach((source, key) => {
      if (key !== '__music__') {
        try {
          source.stop();
        } catch (error) {
          // Já parou
        }
      }
    });
    this.#activeAudio.clear();
    console.log('[AudioManager] Todos áudios parados');
  }

  /**
   * Carrega buffer de áudio (com cache)
   * @private
   */
  async #getAudioBuffer(key) {
    // Retorna do cache se existe
    if (this.#soundCache.has(key)) {
      return this.#soundCache.get(key);
    }

    // Se SoundBank foi injetado, pedir path
    if (!this.#soundBank) {
      console.warn('[AudioManager] SoundBank não configurado');
      return null;
    }

    try {
      const path = this.#soundBank.getPath(key);
      if (!path) {
        console.warn(`[AudioManager] Path não encontrado para ${key}`);
        return null;
      }

      // Fetch e decode
      const response = await fetch(path);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = await this.#audioContext.decodeAudioData(arrayBuffer);

      // Cache
      this.#soundCache.set(key, buffer);
      return buffer;
    } catch (error) {
      console.error(`[AudioManager] Erro ao carregar ${key}:`, error);
      return null;
    }
  }

  /**
   * Configura volume
   */
  setVolume(type, value) {
    // 0-1 range
    value = Math.max(0, Math.min(1, value));

    switch (type) {
      case 'master':
        this.#masterVolume = value;
        if (this.#masterGain) {
          this.#masterGain.gain.setValueAtTime(
            value,
            this.#audioContext.currentTime
          );
        }
        break;
      case 'sfx':
        this.#sfxVolume = value;
        if (this.#sfxGain) {
          this.#sfxGain.gain.setValueAtTime(
            value,
            this.#audioContext.currentTime
          );
        }
        break;
      case 'music':
        this.#musicVolume = value;
        if (this.#musicGain) {
          this.#musicGain.gain.setValueAtTime(
            value,
            this.#audioContext.currentTime
          );
        }
        break;
    }

    EventBus.emit('audio:volume-changed', { type, value });
  }

  /**
   * Muta/desmuta
   */
  setMute(muted) {
    this.#isMuted = muted;
    if (this.#masterGain) {
      this.#masterGain.gain.setValueAtTime(
        muted ? 0 : this.#masterVolume,
        this.#audioContext.currentTime
      );
    }
    EventBus.emit('audio:mute-changed', { muted });
    console.log(`[AudioManager] ${muted ? 'Mutado' : 'Desmutado'}`);
  }

  /**
   * Setup event listeners
   * @private
   */
  #setupListeners() {
    // Tocar SFX baseado em eventos de jogo
    EventBus.on('card:drawn', () => {
      this.playSFX('card-draw', { volume: 0.6, fadeIn: 0.05 });
    });

    EventBus.on('player:stand', () => {
      this.playSFX('stand', { volume: 0.5 });
    });

    EventBus.on('game:round-result', ({ result }) => {
      if (result === 'win') {
        this.playSFX('win', { volume: 0.8 });
      } else if (result === 'loss') {
        this.playSFX('lose', { volume: 0.6 });
      }
    });

    EventBus.on('shop:item-purchased', () => {
      this.playSFX('cha-ching', { volume: 0.7 });
    });

    EventBus.on('ui:player-action', ({ action }) => {
      this.playSFX('ui-click', { volume: 0.3 });
    });
  }

  /**
   * Getters
   */
  get isMuted() { return this.#isMuted; }
  get masterVolume() { return this.#masterVolume; }
  get sfxVolume() { return this.#sfxVolume; }
  get musicVolume() { return this.#musicVolume; }
  get isInitialized() { return this.#isInitialized; }
  get activeAudioCount() { return this.#activeAudio.size; }

  /**
   * Debug
   */
  toString() {
    return `AudioManager(muted=${this.#isMuted}, volume=${this.#masterVolume}, active=${this.#activeAudio.size})`;
  }
}

export default AudioManager;
