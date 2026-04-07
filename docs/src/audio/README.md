/**
 * Audio System Documentation
 *
 * O sistema de áudio foi criado usando Web Audio API
 * Pronto para receber arquivos de áudio reais
 *
 * COMO ADICIONAR SONS:
 *
 * 1. Preparar arquivos de áudio
 *    - Formatos: MP3 (compatibilidade), WAV (qualidade)
 *    - SFX: 0.15s - 1.5s (sons curtos)
 *    - Música: loops (shop-theme, game-theme, etc)
 *    - Normalizar volume: -3dB
 *
 * 2. Organizar diretório
 *    public/assets/audio/
 *    ├── sfx/
 *    │   ├── card-draw.mp3
 *    │   ├── stand.mp3
 *    │   ├── win.mp3
 *    │   ├── lose.mp3
 *    │   ├── push.mp3
 *    │   ├── cha-ching.mp3
 *    │   ├── ui-click.mp3
 *    │   ├── error.mp3
 *    │   ├── button-hover.mp3
 *    │   ├── bust.mp3
 *    │   └── blackjack.mp3
 *    └── music/
 *        ├── shop-theme.mp3
 *        ├── game-theme.mp3
 *        ├── dealer-turn.mp3
 *        └── result-theme.mp3
 *
 * 3. Registrar no SoundBank.js (FEITO)
 *    - Adicionar path do arquivo
 *    - Definir duration/BPM
 *    - Assignar categoria
 *
 * 4. Mapear evento para som em AudioConfig.js (FEITO)
 *    - 'card:drawn' → 'card-draw'
 *    - 'player:stand' → 'stand'
 *    - etc
 *
 * EXEMPLOS DE USO:
 */

import { AudioManager } from '../AudioManager.js';
import { SoundBank } from '../SoundBank.js';

// ============ INICIALIZAR ============

const audioManager = AudioManager.getInstance();
// Injetar SoundBank
await audioManager.init(SoundBank);

// ============ TOCAR SFX ============

// 1. Simples
await audioManager.playSFX('card-draw');

// 2. Com opções
await audioManager.playSFX('win', {
  volume: 0.8,
  fadeIn: 0.2,
  delay: 0.5
});

// ============ TOCAR MÚSICA ============

// 1. Música de fundo (loops)
await audioManager.playMusic('shop', {
  volume: 0.5,
  fadeIn: 1.0
});

// 2. Trocar música (fadeOut automático)
await audioManager.playMusic('game-theme', {
  fadeOut: 0.5
});

// 3. Parar música
await audioManager.stopMusic(fadeOut = 1);

// ============ VOLUME ============

// Ajustar volumes
audioManager.setVolume('master', 0.7);  // 0-1
audioManager.setVolume('sfx', 0.8);
audioManager.setVolume('music', 0.5);

// Mute/Unmute
audioManager.setMute(true);
audioManager.setMute(false);

// ============ SEQUÊNCIAS ============

// Tocar múltiplos sons em sequência
const sequence = AudioConfig.getSequence('startRound');
// [
//   { sound: 'card-draw', delay: 0 },
//   { sound: 'card-draw', delay: 0.3 },
//   ...
// ]

for (const item of sequence) {
  await audioManager.playSFX(item.sound, {
    delay: item.delay
  });
}

// ============ EVENT-DRIVEN ============

// AudioManager já escuta eventos:
// EventBus.on('card:drawn') → playSFX('card-draw')
// EventBus.on('player:stand') → playSFX('stand')
// EventBus.on('game:round-result') → som customizado por resultado
// etc

// ============ GETTERS ============

audioManager.isMuted;              // boolean
audioManager.masterVolume;         // 0-1
audioManager.sfxVolume;            // 0-1
audioManager.musicVolume;          // 0-1
audioManager.activeAudioCount;     // número de sons tocando
audioManager.isInitialized;        // boolean

// ============ RECOMENDAÇÕES ============

// Volumes sugeridos:
// - Master: 0.7 (padrão)
// - SFX: 0.8 (pode ser mais alto)
// - Music: 0.5 (background, mais discreto)

// Fade times:
// - SFX no início: fadeIn 0.05-0.1s (rápido)
// - Música: fadeIn 1s, fadeOut 0.5-2s
// - Transições: 0.3s

// Categorias para melhor controle:
// - 'game' (card-draw, stand, bust, blackjack)
// - 'ui' (clicks, hovers, errors)
// - 'result' (win, lose, push)
// - 'ambient' (shop, game, dealer-turn)
