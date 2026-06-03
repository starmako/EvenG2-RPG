import { EvenBetterSdk } from '@jappyjan/even-better-sdk';
import { savedata } from '../model/savedata';
import title from "../scene/title"

class Game {
  savedatas: savedata[]
  data: savedata
  sdk:EvenBetterSdk
  
  constructor(sdk: EvenBetterSdk) {
    this.savedatas = localStorage.getItem("savedatas") ?? []
    this.sdk = sdk
  }
  init() {

  }
  /*
   * ゲームの初期化とタイトル表示を行う
   */
  start() {
    this.data = title(this.savedatas);
    this.run()
  }
  
  run(){
    
  }
}

export default Game;
