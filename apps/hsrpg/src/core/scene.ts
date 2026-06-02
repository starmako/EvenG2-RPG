import {
  CreateStartUpPageContainer,
  RebuildPageContainer,
  TextContainerProperty,
  TextContainerUpgrade,
  waitForEvenAppBridge,
  type EvenAppBridge,
} from '@evenrealities/even_hub_sdk'

class Scene{
  name: string;
  
  constructor(name: string) {
    this.name = name
    
    const page = sdk.createPage('my-page')

    // 3. テキスト要素を追加
    const title = page.addTextElement('Hello, Even G2!')
    title
      .setPosition((p) => p.setX(100).setY(80))
      .setSize((s) => s.setWidth(400).setHeight(60))

    const info = page.addTextElement('Tap ring to interact')
    info
      .setPosition((p) => p.setX(100).setY(160))
      .setSize((s) => s.setWidth(400).setHeight(60))
      .markAsEventCaptureElement()

    // 4. グラスに描画
    await page.render()
    //statusEl.textContent = 'Displayed on glasses!'

    // 5. リングイベントをリスン
    sdk.addEventListener((event) => {
      appendEventLog(`Event: ${JSON.stringify(event)}`)
    })
  }


}

export default Scene;