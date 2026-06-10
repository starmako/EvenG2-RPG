import {
  EvenAppBridge,
  ImageContainerProperty,
  ImageRawDataUpdate,
  CreateStartUpPageContainer,
  waitForEvenAppBridge,
} from "@evenrealities/even_hub_sdk";
import "./styles.css";

const video: HTMLVideoElement = document.getElementsByTagName("video")[0];
const input: HTMLInputElement = document.getElementsByTagName("input")[0];
const button: HTMLButtonElement = document.getElementsByTagName("button")[0];

let intervalId: number | null = null;
let containerReady = false;

const playVideo = async () => {
  await video.play();

  if (!containerReady) {
    await setupImageContainer();
    containerReady = true;
  }

  screenshot();
};
button.onclick = playVideo;

const loadVideo = () => {
  if (!input.files) return;
  const file = input.files[0];

  const video: any = document.getElementById("video");

  const url = URL.createObjectURL(file);
  video.src = url;
  video.load();
};
input.onchange = loadVideo;

const applyGreen16LevelCorrection = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) => {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const brightness = -30; // 全体を暗くする
  const contrast = 0.75;  // コントラストを少し落とす
  const gamma = 1.6;      // 明るい部分を抑える

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // 輝度化
    let y = 0.299 * r + 0.587 * g + 0.114 * b;

    // 明るさ調整
    y += brightness;

    // コントラスト調整
    y = (y - 128) * contrast + 128;

    // 範囲制限
    y = Math.max(0, Math.min(255, y));

    // ガンマ補正
    y = 255 * Math.pow(y / 255, gamma);

    // 16階調化
    const level = Math.round((y / 255) * 15);
    const q = Math.round((level / 15) * 255);

    // グレースケールPNGとして送る
    data[i] = q;
    data[i + 1] = q;
    data[i + 2] = q;
    data[i + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);
};


const bridge = await waitForEvenAppBridge();

const setupImageContainer = async () => {
  const image = new ImageContainerProperty({
    xPosition: 188,
    yPosition: 34,
    width: 200,
    height: 100,
    containerID: 2,
    containerName: "videoCapture",
  });

  const result = await bridge.createStartUpPageContainer(
    new CreateStartUpPageContainer({
      containerTotalNum: 1,
      imageObject: [image],
    }),
  );

  console.log("createStartUpPageContainer result:", result);
};

const screenshot = () => {
  if (!video) return;

  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }

  const canvas = document.createElement("canvas");
  canvas.width = 200;
  canvas.height = 100;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let sending = false;

  async function captureAndSend() {
    if (sending || video.paused || video.ended || video.readyState < 2) return;

    sending = true;

    try {
      ctx.drawImage(video, 0, 0, 200, 100);

applyG2Green16Quantize(ctx, 200, 100);

const blob = await new Promise<Blob>((resolve, reject) => {
  canvas.toBlob((b) => (b ? resolve(b) : reject()), "image/png");
});

      const bytes = new Uint8Array(await blob.arrayBuffer());

      await bridge.updateImageRawData(
        new ImageRawDataUpdate({
          containerID: 2,
          containerName: "videoCapture",
          imageData: bytes,
        }),
      );
    } catch (e) {
      console.error("capture/send failed:", e);
    } finally {
      sending = false;
    }
  }

  captureAndSend();
  intervalId = window.setInterval(captureAndSend, 3000);
};

const applyG2Green16Quantize = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) => {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const brightness = -60;
  const contrast = 0.65;
  const gamma = 1.8;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    let y = 0.299 * r + 0.587 * g + 0.114 * b;

    y += brightness;
    y = (y - 128) * contrast + 128;
    y = Math.max(0, Math.min(255, y));

    y = 255 * Math.pow(y / 255, gamma);

    const level = Math.round((y / 255) * 15);
    const q = Math.round((level / 15) * 255);

    data[i] = q;
    data[i + 1] = q;
    data[i + 2] = q;
    data[i + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);
};