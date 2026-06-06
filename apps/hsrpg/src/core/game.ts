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
    await title(this);
    this.run()
  }
  
  run(){
    // this.scene.next に 関数が設定されていたらその関数を呼び出し
    // this.scene.next が 空の場合は this.scene.current を実行
  }
  
  scene_init(scene: () => void){
    this.savedata.scene.next = null;
    this.scene.current = scene;
  }
  
  save_exec() {
    // savedata を savedatasに組み込んで、ローカルストレージに保存する
    // savedata.id で 検索かける
    
  }
  save_delete(id: string) {
    // savedatas から 一致するidを削除する
    // ローカルストレージに保存する
  }
  
  save_load(id: string) {
    // savedatas から 一致するidをsavedataにコピーする
  }
}

export default Game;
