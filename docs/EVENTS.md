# Events Documentation

Complete reference for all events in the Blackjack Game event system.

## Event Naming Convention

Events follow the pattern: **`domain:action`**

Examples:
- `game:round-started` (domain=game, action=round-started)
- `player:hit` (domain=player, action=hit)
- `card:drawn` (domain=card, action=drawn)

---

## 🎮 Game Events

Events for main game flow and state management.

### game:initialized

**Emitted by:** GameEngine (on init)
**Payload:** None
**Listeners:** EventBus setup, UI initialization

```javascript
EventBus.emit('game:initialized');

EventBus.on('game:initialized', () => {
  console.log('Game ready');
  showMainScreen();
});
```

**Used for:** One-time setup after all managers initialized.

### game:state-changed

**Emitted by:** GameEngine.transitionTo()
**Payload:**
```typescript
{
  from: string;       // Current state before
  to: string;         // New state after
  data?: object;      // Optional context
}
```

**Listeners:** UIManager, SaveManager

```javascript
EventBus.on('game:state-changed', ({from, to, data}) => {
  console.log(`Game state: ${from} → ${to}`);

  if (to === GameState.SHOP) {
    showShopUI();
  } else if (to === GameState.PLAYER_TURN) {
    enablePlayerControls();
  }
});
```

**Example transitions:**
```
MENU → SHOP
SHOP → BETTING
BETTING → PLAYER_TURN
PLAYER_TURN → DEALER_TURN
DEALER_TURN → RESULT
RESULT → SHOP (new round)
```

### game:round-started

**Emitted by:** RoundManager.start()
**Payload:**
```typescript
{
  dealer: Dealer;
  player: Player;
  deck: Deck;
}
```

**Listeners:** UIManager (initialize round display), AudioManager

```javascript
EventBus.on('game:round-started', ({dealer, player}) => {
  displayDealer(dealer);
  displayPlayer(player);
  playSound('round-start');
});
```

### game:round-result

**Emitted by:** RoundManager.resolve()
**Payload:**
```typescript
{
  result: 'win' | 'loss' | 'push';
  gain: number;              // Balance change
  playerValue: number;       // Final hand value
  dealerValue: number;       // Final hand value
  timestamp: number;         // UTC millis
}
```

**Listeners:** UIManager (show result), AudioManager (play result sound), SaveManager (dirty flag)

```javascript
EventBus.on('game:round-result', ({result, gain, playerValue, dealerValue}) => {
  const message = {
    win: `Vitória! +${gain} créditos`,
    loss: `Derrota! -${Math.abs(gain)} créditos`,
    push: `Empate! Aposta devolvida`,
  }[result];

  showResultPanel(message);
  playResultSound(result);
});
```

### game:player-bust

**Emitted by:** RoundManager.playerHit() (when hand > 21)
**Payload:**
```typescript
{
  finalValue: number;
}
```

**Listeners:** UIManager, AudioManager

```javascript
EventBus.on('game:player-bust', ({finalValue}) => {
  showNotification(`BUST! ${finalValue} > 21`);
  playSound('bust');
});
```

### game:dealer-bust

**Emitted by:** RoundManager.dealerTurn() (when dealer > 21)
**Payload:**
```typescript
{
  finalValue: number;
}
```

```javascript
EventBus.on('game:dealer-bust', ({finalValue}) => {
  showNotification(`Dealer busted! ${finalValue} > 21`);
  announceWin();
});
```

---

## 🎴 Card Events

Events for card operations.

### card:drawn

**Emitted by:** RoundManager.playerHit() / dealerTurn()
**Payload:**
```typescript
{
  who: 'player' | 'dealer';
  card: Card;
  index: number;            // Position in hand
}
```

**Listeners:** UIManager (render card), AudioManager (play sound), SaveManager

```javascript
EventBus.on('card:drawn', ({who, card, index}) => {
  if (who === 'player') {
    addCardToPlayerDisplay(card, index);
  } else {
    addCardToDealerDisplay(card, index);
  }

  playSound('card-draw');
  updateHandValue(who);
});
```

### card:revealed

**Emitted by:** RoundManager.playerStand() (dealer's hidden card)
**Payload:**
```typescript
{
  who: 'dealer';
  card: Card;
  index: number;            // Usually 1 (first face-down)
}
```

**Listeners:** UIManager (flip card)

```javascript
EventBus.on('card:revealed', ({who, card, index}) => {
  revealDealerCard(card, index);
  playSound('card-reveal');
});
```

---

## 👤 Player Events

Events for player actions and changes.

### player:hit

**Emitted by:** Input handler when player presses 'H'
**Payload:** None

**Triggers:** GameEngine.playerHit() → RoundManager.playerHit()

```javascript
EventBus.on('player:hit', () => {
  lockControls();  // Prevent double-click
});
```

### player:stand

**Emitted by:** Input handler when player presses 'S'
**Payload:** None

**Triggers:** GameEngine.playerStand() → RoundManager.dealerTurn()

```javascript
EventBus.on('player:stand', () => {
  disablePlayerControls();
  announceDealer Turn();
});
```

### player:balance-changed

**Emitted by:** Player.gainBalance() / loseBalance()
**Payload:**
```typescript
{
  newBalance: number;
  delta: number;             // Change amount (positive or negative)
  source?: string;           // 'round-win', 'item-purchase', etc
}
```

**Listeners:** UIManager (update balance display), SaveManager (trigger dirty flag)

```javascript
EventBus.on('player:balance-changed', ({newBalance, delta}) => {
  updateBalanceDisplay(newBalance);

  if (delta > 0) {
    showNotification(`+${delta} 💰`);
  } else if (delta < 0) {
    showNotification(`${delta} 💳`);
  }

  markDirtyForSave();
});
```

### player:item-purchased

**Emitted by:** Player.buyItem()
**Payload:**
```typescript
{
  item: Item;
  newBalance: number;
  quantity: number;          // Total in inventory
}
```

**Listeners:** UIManager (update shop display), AudioManager

```javascript
EventBus.on('player:item-purchased', ({item, newBalance, quantity}) => {
  playSound('purchase-success');
  showNotification(`Comprou ${item.name}! (x${quantity})`);
  updatePlayerBalance(newBalance);
});
```

### player:item-used

**Emitted by:** Player.useItem()
**Payload:**
```typescript
{
  itemKey: string;
  remaining: number;         // Quantity left in inventory
}
```

**Listeners:** GameEngine (apply effect), AudioManager, UIManager

```javascript
EventBus.on('player:item-used', ({itemKey, remaining}) => {
  const item = ItemConfigs[itemKey];
  applyItemEffect(item);
  playSound('item-activate');
  updateInventoryDisplay(itemKey, remaining);
});
```

### player:inventory-updated

**Emitted by:** Shop UI (after purchase)
**Payload:**
```typescript
{
  itemKey: string;
  quantity: number;
}
```

---

## 🛍️ Shop Events

Events for shop interactions.

### shop:item-purchased

**Emitted by:** ShopUI (buy button clicked)
**Payload:**
```typescript
{
  item: Item;
  newBalance: number;
}
```

**Flow:** ShopUI → GameEngine → Player.buyItem() → player:item-purchased

### shop:tab-changed

**Emitted by:** ShopUI (tab clicked)
**Payload:**
```typescript
{
  tab: 'itens' | 'melhorias' | 'bebidas' | 'outros';
  items: Item[];
}
```

**Listeners:** UIManager (show tab), AudioManager (button click sound)

```javascript
EventBus.on('shop:tab-changed', ({tab, items}) => {
  displayItemsInTab(items);
  playSound('menu-select');
});
```

### shop:page-changed

**Emitted by:** ShopUI (pagination)
**Payload:**
```typescript
{
  page: number;
  total: number;
  items: Item[];
}
```

---

## 🎨 UI Events

Events for UI interactions.

### ui:player-action

**Emitted by:** Input handler (H/S/Click buttons)
**Payload:**
```typescript
{
  action: 'hit' | 'stand' | 'purchase' | 'bet-change';
  data?: object;
}
```

**Listeners:** GameEngine (execute action)

```javascript
EventBus.on('ui:player-action', ({action, data}) => {
  if (action === 'hit') {
    gameEngine.playerHit();
  } else if (action === 'stand') {
    gameEngine.playerStand();
  }
});
```

### ui:lock-input

**Emitted by:** RoundManager (when waiting for animations/dealer)
**Payload:** None

**Listeners:** UIManager (disable buttons)

```javascript
EventBus.on('ui:lock-input', () => {
  disableAllControls();
  showSpinner();
});
```

### ui:unlock-input

**Emitted by:** RoundManager (ready for player input again)
**Payload:** None

**Listeners:** UIManager (enable buttons)

```javascript
EventBus.on('ui:unlock-input', () => {
  enablePlayerControls();
  hideSpinner();
});
```

### ui:show-notification

**Emitted by:** GameEngine (errors, warnings)
**Payload:**
```typescript
{
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  duration?: number;         // ms to auto-dismiss
}
```

**Listeners:** UIManager (display notification)

```javascript
EventBus.on('ui:show-notification', ({message, type}) => {
  const style = {
    success: 'green',
    error: 'red',
    warning: 'yellow',
    info: 'blue',
  }[type];

  showNotification(message, style);
});
```

---

## 🔊 Audio Events

Events for sound system.

### audio:play-sfx

**Emitted by:** GameEngine / RoundManager (triggered by other events)
**Payload:**
```typescript
{
  key: string;               // Sound key
  volume?: number;           // Override volume
}
```

**Listeners:** AudioManager

```javascript
// When card is drawn
EventBus.on('card:drawn', () => {
  EventBus.emit('audio:play-sfx', {key: 'card-draw', volume: 0.8});
});

// Listened by AudioManager
EventBus.on('audio:play-sfx', ({key, volume}) => {
  audioManager.playSFX(key, {volume});
});
```

### audio:play-music

**Emitted by:** GameEngine (state change)
**Payload:**
```typescript
{
  track: 'shop' | 'game' | 'dealer-turn' | 'result';
  volume?: number;
}
```

### audio:mute-toggled

**Emitted by:** AudioControls UI
**Payload:**
```typescript
{
  isMuted: boolean;
}
```

**Listeners:** AudioManager, UI (update button state)

---

## 💾 Storage Events

Events for persistence.

### save:auto-save-triggered

**Emitted by:** SaveManager (every 60s if dirty)
**Payload:**
```typescript
{
  timestamp: number;
  fileSizeBytes: number;
}
```

**Listeners:** Nothing by default (diagnostic)

```javascript
EventBus.on('save:auto-save-triggered', ({timestamp}) => {
  console.log('Auto-saved at', new Date(timestamp));
  logAnalytics('save');
});
```

### save:loaded

**Emitted by:** SaveManager.init() (if save exists)
**Payload:**
```typescript
{
  version: string;
  timestamp: number;
  playerBalance: number;
}
```

**Listeners:** GameEngine (restore state)

```javascript
EventBus.on('save:loaded', ({playerBalance}) => {
  console.log(`Loaded save. Balance: ${playerBalance}`);
});
```

---

## Event Flow Examples

### Complete Round Sequence

```
1. game:round-started
   ├─ Emitted by: RoundManager.start()
   └─ Shows: Initial dealer/player cards

2. card:drawn (player cards, then dealer)
   └─ Emitted: 4 times (2 to each)

3. (Player hits → card:drawn multiple times)
   OR (Player stands → card:revealed)

4. (Dealer turn → card:drawn multiple times)

5. game:round-result
   ├─ Emitted by: RoundManager.resolve()
   ├─ Shows: Result (WIN/LOSS/PUSH)
   └─ Updates: Player.balance

6. player:balance-changed
   └─ Triggers: Save, UI update
```

### Shop Purchase Flow

```
1. ui:player-action{action: 'purchase'}
   └─ User clicks buy button

2. ui:lock-input
   └─ Disable controls during purchase

3. player:item-purchased
   ├─ Updates: Player.balance, inventory
   ├─ Triggers: player:balance-changed
   └─ Play sound: 'purchase-success'

4. ui:unlock-input
   └─ Re-enable controls
```

---

## Event Best Practices

### ✅ DO

```javascript
// 1. Specific, meaningful names
EventBus.emit('card:drawn', {card});    // Good
// EventBus.emit('update', {card});     // ❌ Too vague

// 2. Include all relevant data
EventBus.emit('card:drawn', {who, card, index});

// 3. Handle errors gracefully
EventBus.on('event', () => {
  try {
    doSomething();
  } catch (err) {
    console.error('Handler error:', err);
  }
});

// 4. Remove listeners when done
const handler = () => {};
EventBus.on('event', handler);
// ...
EventBus.off('event', handler);
```

### ❌ DON'T

```javascript
// 1. Emit from too many places
// Bad: scattered EventBus.emit() calls make tracing hard

// 2. Global side effects
EventBus.on('event', () => {
  global.state.something = value;  // ❌
});

// 3. Circular event chains
EventBus.on('eventA', () => {
  EventBus.emit('eventB');  // Which emits eventA → infinite loop
});

// 4. Async without await
EventBus.emit('event');  // Fire and forget
// What if listener was async and failed?
```

