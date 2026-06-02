import { EvenBetterSdk } from '@jappyjan/even-better-sdk';
import { savedata } from '../model/savedata';
import title from "../scene/title"

class Game {
  data: savedata = {}
  sdk:EvenBetterSdk
  constructor(sdk: EvenBetterSdk) {
    this.data.hoge = "aaaaa"
    this.sdk = sdk
  }
  init() {

  }
  start() {
    console.log(this.data.hoge);
    title(this.data);
    console.log(this.data.hoge);

  }
}

export default Game;
