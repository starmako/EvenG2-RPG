import { EvenBetterSdk } from '@jappyjan/even-better-sdk';
import { Savedata, defaultSavedata } from '../model/savedata';
import title from "../scene/title"

class Game {
  savedatas: Savedata[]
  savedata: Savedata = {}
  sdk:EvenBetterSdk
  
  constructor(sdk: EvenBetterSdk) {
    this.savedatas = JSON.parse(localStorage.getItem("savedatas") ?? '[]') 
    this.sdk = sdk
  }
  
  /*
   * ゲームの初期化とタイトル表示を行う
   */
  async start() {
    await title(this);
    this.run()
  }
  
  run(){
    // this.savedata.scene.next に 関数が設定されていたらその関数を呼び出し
    // this.savedata.scene.current が 空の場合は this.scene.current を実行
    this.savedata.scene!.next && this.savedata.scene!.next() || this.savedata.scene!.current && this.savedata.scene!.current()
  }
  
  scene_init(scene: () => void){
    this.savedata.scene!.next = null;
    this.savedata.scene!.current = scene;
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
