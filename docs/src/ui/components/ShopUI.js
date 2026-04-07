/**
 * ShopUI - Componente de renderização da loja
 * Exibe itens, vendedor animado, divisão de abas
 */

import { EventBus } from '../../events/EventBus.js';
import { SellerAvatar } from './SellerAvatar.js';
import { ItemAssets } from '../../assets/config/items.js';

export class ShopUI {
  #container;
  #seller;
  #currentTab = 'ITENS';
  #currentPage = 0;
  #balance = 4000;
  #inventory = {};
  #items = ItemAssets.getAllItems();

  #tabs = ['ITENS', 'MELHORIAS', 'BEBIDAS', 'OUTROS'];
  #pageSize = 6;

  constructor(container) {
    this.#container = container;
    this.#seller = new SellerAvatar();
  }

  /**
   * Renderiza a loja completa
   */
  render() {
    const html = `
      <div class="shop-layout">
        <div class="shop-title">
          <span class="title-text">[ LOJA DO SUBMUNDO ]</span>
        </div>

        <div class="shop-tabs" id="shop-tabs">
          ${this.#renderTabs()}
        </div>

        <div class="shop-main">
          <div class="shop-left">
            ${this.#seller.render()}
          </div>

          <div class="shop-right">
            <div class="shop-items" id="shop-items">
              ${this.#renderItems()}
            </div>

            <div class="shop-footer">
              <div class="balance-display">
                <span class="label">SALDO:</span>
                <span class="value">$ ${this.#balance.toFixed(2)}</span>
              </div>
              <button class="btn btn-primary" id="btn-start-round">INICIAR PARTIDA [ENTER]</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.#container.innerHTML = html;
    this.#attachEventListeners();
    this.#seller.startAnimation();
  }

  /**
   * Renderiza abas
   * @private
   */
  #renderTabs() {
    return this.#tabs.map((tab, idx) => `
      <button class="shop-tab ${tab === this.#currentTab ? 'active' : ''}"
              data-tab="${tab}"
              data-index="${idx}"
              title="Pressione ${idx + 1}">
        [${idx + 1}] ${tab}
      </button>
    `).join('');
  }

  /**
   * Renderiza itens da página atual
   * @private
   */
  #renderItems() {
    const filtered = this.#items.filter(item => item.category === this.#currentTab);
    const start = this.#currentPage * this.#pageSize;
    const end = start + this.#pageSize;
    const pageItems = filtered.slice(start, end);
    const totalPages = Math.ceil(filtered.length / this.#pageSize);

    let html = '<div class="items-grid">';

    pageItems.forEach((item, idx) => {
      const globalIdx = start + idx;
      const hasStock = item.stock === 'INF' || item.stock > 0;
      const canBuy = hasStock && this.#balance >= item.cost;

      html += `
        <div class="shop-item ${!hasStock ? 'sold-out' : ''} ${!canBuy ? 'cant-afford' : ''}">
          <div class="item-icon">${item.icon}</div>
          <div class="item-header">
            <div class="item-name">${item.name}</div>
            <div class="item-cost">$ ${item.cost}</div>
          </div>
          <div class="item-desc">${item.desc}</div>
          <div class="item-stock">
            ${item.stock === 'INF' ? '∞ ESTOQUE' : `${item.stock} DISPONÍVEL`}
          </div>
          <button class="btn btn-item ${!canBuy ? 'disabled' : ''}"
                  data-key="${item.key}"
                  ${!canBuy ? 'disabled' : ''}>
            COMPRAR
          </button>
        </div>
      `;
    });

    html += '</div>';

    // Pagination
    if (totalPages > 1) {
      html += `
        <div class="shop-pagination">
          <button class="btn-prev" ${this.#currentPage === 0 ? 'disabled' : ''}>← ANTERIOR</button>
          <span class="page-info">Página ${this.#currentPage + 1}/${totalPages}</span>
          <button class="btn-next" ${this.#currentPage >= totalPages - 1 ? 'disabled' : ''}>PRÓXIMA →</button>
        </div>
      `;
    }

    return html;
  }

  /**
   * Attach event listeners
   * @private
   */
  #attachEventListeners() {
    // Tab selection
    document.querySelectorAll('.shop-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        this.setTab(tab);
      });
    });

    // Buy item
    document.querySelectorAll('.btn-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.key;
        const item = this.#items.find(i => i.key === key);
        if (item) {
          EventBus.emit('ui:shop-buy-item', { item });
        }
      });
    });

    // Pagination
    const btnPrev = document.querySelector('.btn-prev');
    const btnNext = document.querySelector('.btn-next');
    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        this.#currentPage = Math.max(0, this.#currentPage - 1);
        this.#updateItems();
      });
    }
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        this.#currentPage += 1;
        this.#updateItems();
      });
    }

    // Start round
    const btnStart = document.getElementById('btn-start-round');
    if (btnStart) {
      btnStart.addEventListener('click', () => {
        EventBus.emit('ui:start-round-clicked');
      });
    }
  }

  /**
   * Atualiza só a grid de itens
   * @private
   */
  #updateItems() {
    const itemsContainer = document.getElementById('shop-items');
    if (itemsContainer) {
      itemsContainer.innerHTML = this.#renderItems();
      this.#attachEventListeners();
    }
  }

  /**
   * Muda de aba
   */
  setTab(tabName) {
    if (!this.#tabs.includes(tabName)) return;
    this.#currentTab = tabName;
    this.#currentPage = 0;
    this.#updateItems();

    // Update tab visual
    document.querySelectorAll('.shop-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    this.#seller.talk();
    EventBus.emit('shop:tab-changed', { tab: tabName });
  }

  /**
   * Atualiza balance
   */
  updateBalance(newBalance) {
    this.#balance = newBalance;
    const balanceDisplay = document.querySelector('.balance-display .value');
    if (balanceDisplay) {
      balanceDisplay.textContent = `$ ${newBalance.toFixed(2)}`;
    }
  }

  /**
   * Anuncia compra
   */
  announceItem(data) {
    this.#seller.buy();
    EventBus.emit('ui:purchase-notification', {
      item: data.item.name,
      balance: data.newBalance
    });
  }

  /**
   * Getters
   */
  get balance() { return this.#balance; }
}

export default ShopUI;
