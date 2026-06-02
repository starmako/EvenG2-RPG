import './styles.css'
import {screenshot, setupImageContainer} from "./screenshot"

const appRoot = document.querySelector<HTMLDivElement>('#app')

if (!appRoot) {
  throw new Error('Missing #app')
}

const ssBtn = document.querySelector<HTMLButtonElement>('#ss')
ssBtn!.onclick = async() => {
  console.log("onclick")
  await setupImageContainer();
  screenshot()
}


