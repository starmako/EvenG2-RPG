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
const input_interval: HTMLInputElement = document.getElementsByTagName("input")[1];
const input_comp_rate: HTMLInputElement = document.getElementsByTagName("input")[2];
const button: HTMLButtonElement = document.getElementsByTagName("button")[0];

input_interval.value = 3000
input_comp_rate.value = 0.5

let interval = input_interval.value
let comp_rate = input_comp_rate.value

const setIntervalCycle = () => {
  interval = input_interval.value
}
const setCompRate = () => {
  comp_rate = input_comp_rate.value
}

let containerReady = false;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const playVideo = async () => {
  await video.play();

  if (!containerReady) {
    await setupImageContainers();
    containerReady = true;
  }
  screenshot();
};
button.onclick = playVideo;

const loadVideo = () => {
  if (!input.files) return;
  const file = input.files[0];

  const url = URL.createObjectURL(file);
  video.src = url;
  video.load();
};
input.onchange = loadVideo;

const bridge = await waitForEvenAppBridge();
let intervalId: number | null = null;

const setupImageContainers = async () => {
  const W = 200;
  const H = 100;
  const images = [
    new ImageContainerProperty({
      xPosition: 88,
      yPosition: 44,
      width: W,
      height: H,
      containerID: 2,
      containerName: "leftTop",
    }),/*
    new ImageContainerProperty({
      xPosition: 88,
      yPosition: 44,
      width: W,
      height: H,
      containerID: 3,
      containerName: "rightTop",
    }),
    new ImageContainerProperty({
      xPosition: 88,
      yPosition: 44,
      width: W,
      height: H,
      containerID: 4,
      containerName: "leftBottom",
    }),
    new ImageContainerProperty({
      xPosition: 88,
      yPosition: 44,
      width: W,
      height: H,
      containerID: 5,
      containerName: "rightBottom",
    }),*/
  ];
  const result = await bridge.createStartUpPageContainer(
    new CreateStartUpPageContainer({
      containerTotalNum: 4,
      imageObject: images,
    }),
  );
  console.log(result)
};

const screenshot = () => {
  if (!video) return;

  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }

  const captureAndSend4Parts = async () => {
    const FULL_W = 200;
    const FULL_H = 100;
    const PART_W = 200;
    const PART_H = 100;

    const fullCanvas = document.createElement("canvas");
    fullCanvas.width = FULL_W;
    fullCanvas.height = FULL_H;

    const fullCtx = fullCanvas.getContext("2d");
    if (!fullCtx) return;

    fullCtx.drawImage(video, 0, 0, FULL_W, FULL_H);

    applyG2Green16Quantize(fullCtx, FULL_W, FULL_H);

    const parts = [
      { id: 2, name: "leftTop", sx: 0, sy: 0 },
      /*{ id: 3, name: "rightTop", sx: 200, sy: 0 },
      { id: 4, name: "leftBottom", sx: 0, sy: 100 },
      { id: 5, name: "rightBottom", sx: 200, sy: 100 },*/
    ];

    for (const part of parts) {
      const partCanvas = document.createElement("canvas");
      partCanvas.width = PART_W;
      partCanvas.height = PART_H;

      const partCtx = partCanvas.getContext("2d");
      if (!partCtx) continue;

      partCtx.drawImage(
        fullCanvas,
        part.sx,
        part.sy,
        PART_W,
        PART_H,
        0,
        0,
        PART_W,
        PART_H,
      );

      const blob = await new Promise<Blob>((resolve, reject) => {
        partCanvas.toBlob((b) => (b ? resolve(b) : reject()), "image/jpeg",comp_rate);
        //partCanvas.toBlob((b) => (b ? resolve(b) : reject()), "image/png");
      });
      const bytes = new Uint8Array(await blob.arrayBuffer());

      await bridge.updateImageRawData(
        new ImageRawDataUpdate({
          containerID: part.id,
          //containerName: part.name,
          imageData: bytes,
        }),
      );
      await sleep(100);
      console.log(`Sent ${part.name}`);
      console.log(await bridge.getDeviceInfo())
    }
  };
  captureAndSend4Parts();
  intervalId = window.setInterval(captureAndSend4Parts, 5000);
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
