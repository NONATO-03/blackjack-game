/**
 * AssetManager API Documentation
 *
 * Exemplos de uso:
 */

import { AssetManager } from '../AssetManager.js';

const assetManager = AssetManager.getInstance();

// ============ PRELOAD ============

// Pré-carrega assets críticos
await assetManager.preload();
// Carrega: cartas, inimigos, vendedores, UI

// ============ LOAD IMAGE ============

// 1. Carregar uma imagem (com cache)
try {
  const img = await assetManager.loadImage('cartas/a-copas.png');
  // img é uma Image object
} catch (error) {
  console.error('Falha ao carregar:', error);
}

// ============ GET ASSET URL ============

// Retornar URL de asset
const url = assetManager.getAssetUrl('cartas/a-copas.png');
// Retorna: '../assets/img/cartas/a-copas.png'

// ============ FALLBACK ============

// Tentar carregar com fallback
const url = await assetManager.getImageUrlWithFallback(
  'cartas/a-copas.png',
  ['cartas/costas-carta.png', 'cartas/placeholder.png']
);

// ============ LOAD MULTIPLE ============

// Carregar múltiplas imagens
const paths = [
  'cartas/a-copas.png',
  'cartas/k-copas.png',
  'sellers/vendedor/fundo_loja.png'
];

const results = await assetManager.loadImages(paths);
// Retorna: Map { path => url }

// ============ CACHE ============

// Ver tamanho do cache
console.log(assetManager.cacheSize);  // número de imagens

// Limpar cache (libera memória)
assetManager.clearCache();

// ============ PROGRESS ============

// Ver progresso de pré-load
const percent = assetManager.preloadProgress;
console.log(`${percent}% carregado`);

// ============ INTEGRATION COM DOM ============

// Exemplo de uso em elemento
const img = document.createElement('img');
img.src = assetManager.getAssetUrl('cartas/a-copas.png');
img.onerror = () => {
  img.src = assetManager.getAssetUrl('cartas/costas-carta.png');
};
document.body.appendChild(img);
