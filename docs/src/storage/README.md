/**
 * SaveManager API Documentation
 *
 * Exemplos de uso:
 */

// ============ LOADING ============

import { SaveManager } from '../SaveManager.js';

const saveManager = SaveManager.getInstance();

// 1. Carregar save completo
const saveData = saveManager.load();
// Retorna: { version, timestamp, player, game } ou null

// 2. Carregar só player
const playerData = saveManager.loadPlayer();
// Retorna: { name, balance, inventory, stats, skillsUnlocked } ou null

// ============ SAVING ============

// 1. Salvar estado completo
const gameState = {
  player: playerInstance,
  state: 'SHOP',
  totalRounds: 42
};

const success = saveManager.save(gameState);
// Retorna: true/false

// ============ AUTO-SAVE ============

// Escuta mudanças e auto-salva a cada 1 minuto
await saveManager.init();

// Ou para parar auto-save:
saveManager.stopAutoSave();

// ============ LISTAR SAVES ============

const lastSave = saveManager.lastSaveTime;
// Retorna: timestamp em ms ou null

const isDirty = saveManager.isDirty;
// true = há mudanças não-salvas
// false = tudo salvo

// ============ IMPORT/EXPORT ============

// Exportar como JSON (para download)
const json = saveManager.export();
const blob = new Blob([json], { type: 'application/json' });
const url = URL.createObjectURL(blob);
// ... criar link de download

// Importar de JSON (de arquivo)
const file = /* File do input */;
const text = await file.text();
const success = saveManager.import(text);

// ============ CLEAR/RESET ============

const success = saveManager.clear();
// Deleta o save de localStorage
