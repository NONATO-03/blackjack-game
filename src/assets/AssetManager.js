/**
 * AssetManager - Singleton que gerencia carregamento e cache de assets
 * Suporta pré-carregamento, lazy loading e fallbacks
 */

export class AssetManager {
  static #instance = null;

  #imageCache = new Map();
  #loadingPromises = new Map();
  #assetBase = '../assets';
  #isPreloading = false;
  #preloadedCount = 0;
  #totalToPreload = 0;

  static getInstance() {
    if (!AssetManager.#instance) {
      AssetManager.#instance = new AssetManager();
    }
    return AssetManager.#instance;
  }

  /**
   * Pré-carrega assets críticos
   * Emit eventos de progresso
   */
  async preload() {
    if (this.#isPreloading) {
      console.warn('[AssetManager] Pré-carregamento já em andamento');
      return;
    }

    this.#isPreloading = true;
    this.#preloadedCount = 0;

    try {
      console.log('[AssetManager] Iniciando pré-carregamento...');

      // Assets críticos para iniciar
      const criticalAssets = [
        // Cartas (apenas faces e ases para demo)
        'cartas/a-copas.png',
        'cartas/k-copas.png',
        'cartas/costas-carta.png',

        // Inimigos (iniciante)
        'enemies/iniciantes/iniciante_1.png',

        // Vendedor
        'sellers/vendedor/fundo_loja.png',
        'sellers/vendedor/vendedor_1.png',
        'sellers/vendedor/vendedor_2.png',

        // UI
        'modos/blackjack/mesa_blackjack.png'
      ];

      this.#totalToPreload = criticalAssets.length;

      // Carregar em paralelo (máx 4 simultâneos)
      for (let i = 0; i < criticalAssets.length; i += 4) {
        const batch = criticalAssets.slice(i, i + 4);
        await Promise.all(batch.map(path => this.loadImage(path)));
      }

      console.log(`[AssetManager] Pré-carregamento completo (${this.#preloadedCount}/${this.#totalToPreload})`);

      this.#isPreloading = false;
    } catch (error) {
      console.error('[AssetManager] Erro no pré-carregamento:', error);
      this.#isPreloading = false;
      // Continue anyway - fallbacks funcionam
    }
  }

  /**
   * Carrega uma imagem (com cache)
   * @param {string} path - Caminho relativo (ex: 'cartas/a-copas.png')
   * @returns {Promise<Image>}
   */
  async loadImage(path) {
    // Retorna do cache se existe
    if (this.#imageCache.has(path)) {
      return this.#imageCache.get(path);
    }

    // Se já está carregando, espera a promise existente
    if (this.#loadingPromises.has(path)) {
      return this.#loadingPromises.get(path);
    }

    // Inicia novo carregamento
    const promise = new Promise((resolve, reject) => {
      const img = new Image();
      const fullPath = `${this.#assetBase}/img/${path}`;

      const timeout = setTimeout(() => {
        reject(new Error(`Timeout carregando ${path}`));
      }, 5000);

      img.onload = () => {
        clearTimeout(timeout);
        this.#imageCache.set(path, img);
        this.#loadingPromises.delete(path);
        this.#preloadedCount++;
        console.log(`[AssetManager] ✓ Carregou ${path}`);
        resolve(img);
      };

      img.onerror = () => {
        clearTimeout(timeout);
        this.#loadingPromises.delete(path);
        console.warn(`[AssetManager] ✗ Erro ao carregar ${path}`);
        reject(new Error(`Falha ao carregar imagem: ${path}`));
      };

      img.src = fullPath;
    });

    this.#loadingPromises.set(path, promise);
    return promise;
  }

  /**
   * Retorna URL de asset (com fallback)
   * @param {string} path - Caminho
   * @returns {string} URL public
   */
  getAssetUrl(path) {
    return `${this.#assetBase}/img/${path}`;
  }

  /**
   * Tenta carregar imagem ou fallback
   * @param {string} path - Caminho principal
   * @param {string|Array} fallback - Fallback (string ou array de alternativas)
   * @returns {Promise<string>} URL que resolveu
   */
  async getImageUrlWithFallback(path, fallback = 'cartas/costas-carta.png') {
    const fallbacks = Array.isArray(fallback) ? fallback : [fallback];
    const paths = [path, ...fallbacks];

    for (const p of paths) {
      try {
        await this.loadImage(p);
        return this.getAssetUrl(p);
      } catch (error) {
        // Tenta próximo
        continue;
      }
    }

    // Fallback final: placeholder
    console.warn(`[AssetManager] Todos fallbacks falharam para ${path}`);
    return this.getAssetUrl('cartas/costas-carta.png');
  }

  /**
   * Carregar múltiplas imagens
   * @param {Array<string>} paths
   * @returns {Promise<Map>}
   */
  async loadImages(paths) {
    const results = new Map();

    for (const path of paths) {
      try {
        await this.loadImage(path);
        results.set(path, this.getAssetUrl(path));
      } catch (error) {
        console.warn(`[AssetManager] Falha ao carregar ${path}`);
        results.set(path, null);
      }
    }

    return results;
  }

  /**
   * Limpa cache (por exemplo ao trocar de tela)
   */
  clearCache() {
    this.#imageCache.clear();
    console.log('[AssetManager] Cache limpo');
  }

  /**
   * Getters
   */
  get cacheSize() { return this.#imageCache.size; }
  get isPreloading() { return this.#isPreloading; }
  get preloadProgress() { return this.#totalToPreload > 0 ? (this.#preloadedCount / this.#totalToPreload) * 100 : 100; }

  /**
   * Debug
   */
  toString() {
    return `AssetManager(cache=${this.#imageCache.size}, preload=${this.#isPreloading})`;
  }
}

export default AssetManager;
