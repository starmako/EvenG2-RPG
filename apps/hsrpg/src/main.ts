import './styles.css'
import Game from './core/game'
import { EvenBetterSdk } from '@jappyjan/even-better-sdk'
import { withTimeout } from '../../_shared/async'

const appRoot = document.querySelector<HTMLDivElement>('#app')

if (!appRoot) {
  throw new Error('Missing #app')
}

appRoot.innerHTML = `
  <header class="hero card">
    <div>
      <p class="eyebrow">Even G2</p>
      <h1 class="page-title">H&S RPG</h1>
      <p class="page-subtitle">Standalone template app with browser preview panel and glasses sync.</p>
    </div>
    <div id="hero-pill" class="hero-pill is-ready" aria-live="polite">Ready</div>
  </header>

  <section class="card">
  </section>

  <section class="card">
    <p class="log-title">Event Log</p>
    <pre id="event-log" aria-live="polite"></pre>
  </section>
`
async function connectAndRender() {
  // 1. ブリッジ接続
  //statusEl.textContent = 'Connecting...'
  try {
    await withTimeout(EvenBetterSdk.getRawBridge(), 4000)
  } catch {
    //statusEl.textContent = 'Bridge not available'
    return
  }

  // 2. SDK 初期化 & ページ作成
  const sdk = new EvenBetterSdk()
  const game = new Game(sdk)
  game.start()
}

connectAndRender()



