import {
  EvenAppBridge,
  ImageContainerProperty,
  ImageRawDataUpdate,
  CreateStartUpPageContainer,
  waitForEvenAppBridge,
} from "@evenrealities/even_hub_sdk";

const bridge = await waitForEvenAppBridge();

export const setupImageContainer = async () => {
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

export const screenshot = () => {
  console.log("screenshot")
  const video = document.querySelector("video");
  if (!video)  return;

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

      console.log("send image bytes:", bytes.length);

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

  setInterval(captureAndSend, 1000);
};