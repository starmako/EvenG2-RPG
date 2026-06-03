import { EvenBetterSdk } from '@jappyjan/even-better-sdk';
import { savedata } from '../model/savedata';
import title from "../scene/title"

class Game {
  savedatas: savedata[]
  savedata: savedata = {}
  sdk:EvenBetterSdk
  
  constructor(sdk: EvenBetterSdk) {
    this.savedatas = JSON.parse(localStorage.getItem("savedatas") ?? '[]') 
    this.sdk = sdk
  }
  init() {

  }
  /*
   * ゲームの初期化とタイトル表示を行う
   */
  async start() {
    this.savedata = await title.run(this.savedatas);
    this.run()
  }
  
  run(){
    
  }
}

export default Game;
