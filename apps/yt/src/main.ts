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

let interval_id: any

const playVideo = async () => {
  video.play();
  await setupImageContainer();
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

  const canvas = document.createElement("canvas");
  canvas.width = 200;
  canvas.height = 100;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let sending = false;

  async function captureAndSend() {
    console.log(video.paused, video.ended, video.readyState);
    if (sending || video.paused || video.ended || video.readyState < 2) return;

    sending = true;
    try {
      ctx.drawImage(video, 0, 0, 200, 100);

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

  interval_id = setInterval(captureAndSend, 3000);
  console.log(interval_id)
};
