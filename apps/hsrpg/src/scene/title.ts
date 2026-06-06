import { Savedata } from "../model/savedata";
import Scene from "../core/scene";
import Game from  "../core/game";
import {
  CreateStartUpPageContainer,
  RebuildPageContainer,
  TextContainerProperty,
  TextContainerUpgrade,
  waitForEvenAppBridge,
  type EvenAppBridge,
} from "@evenrealities/even_hub_sdk";
import { appendEventLog } from '../../../_shared/log'

const title = async (game: Game) => {
  console.log("title!" )
  //game.scene_init(() => title(game))
  
  // 画面にNew Continue の選択肢を表示する

  // ユーザ操作待ち受ける

  // New選択時
  // セーブデータの初期値を返却する

  // Continue選択時
  // savedatasのid level scene datetimeを表示しユーザ操作を待ち受ける
  // 選択したセーブデータを返却する

  const page = game.sdk.createPage("my-page");

  // 3. テキスト要素を追加
  const title = page.addTextElement("Hello, Even G2!");
  title
    .setPosition((p) => p.setX(100).setY(80))
    .setSize((s) => s.setWidth(400).setHeight(60));

  const info = page.addTextElement("Tap ring to interact");
  info
    .setPosition((p) => p.setX(100).setY(160))
    .setSize((s) => s.setWidth(400).setHeight(60))
    .markAsEventCaptureElement();

  // 4. グラスに描画
  await page.render();
  //statusEl.textContent = 'Displayed on glasses!'

  // 5. リングイベントをリスン
  game.sdk.addEventListener((event: any) => {
    appendEventLog(`Event: ${JSON.stringify(event)}`);
  });
};

export default title;
