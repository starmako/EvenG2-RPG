// src/scene/title.ts
import type Game from "../core/game";
import { Savedata, defaultSavedata } from "../model/savedata";

const clone = <T>(value: T): T => {
  return structuredClone(value);
};

const title = async (game: Game): Promise<void> => {
  console.log("title!");

  const page = game.sdk.createPage("title");

  page
    .addTextElement("EvenG2 RPG")
    .setPosition((position) => position.setX(8).setY(8))
    .setSize((size) => size.setWidth(280).setHeight(40));

  const menu = page
    .addListElement(["New", "Continue", "End"])
    .setPosition((position) => position.setX(8).setY(60))
    .setSize((size) => size.setWidth(280).setHeight(160))
    .setIsItemSelectBorderEn(true);

  menu.markAsEventCaptureElement();

  await page.render();

  await new Promise<void>((resolve) => {
    const listener = (event: any) => {
      const selected = event.listEvent?.currentSelectItemName;

      if (!selected) return;

      if (selected === "New") {
        const savedata: Savedata = clone(defaultSavedata);

        savedata.id = crypto.randomUUID();
        savedata.datetime = new Date().toISOString();

        game.savedata = savedata;

        game.sdk.removeEventListener(listener);
        resolve();
      }

      if (selected === "Continue") {
        game.sdk.removeEventListener(listener);
        showContinueList(game).then(resolve);
      }

      if (selected === "End") {
        game.sdk.removeEventListener(listener);
        showEnd(game);
      }
    };

    game.sdk.addEventListener(listener);
  });
};

const showContinueList = async (game: Game): Promise<void> => {
  const page = game.sdk.createPage("continue");

  page
    .addTextElement("Select SaveData")
    .setPosition((position) => position.setX(8).setY(8))
    .setSize((size) => size.setWidth(280).setHeight(40));

  const items =
    game.savedatas.length > 0
      ? game.savedatas.map((savedata) => {
          return `Lv.${savedata.level ?? "-"} ${savedata.datetime ?? "-"}`;
        })
      : ["No SaveData"];

  const list = page
    .addListElement([...items, "Back"])
    .setPosition((position) => position.setX(8).setY(60))
    .setSize((size) => size.setWidth(280).setHeight(160))
    .setIsItemSelectBorderEn(true);

  list.markAsEventCaptureElement();

  await page.render();

  await new Promise<void>((resolve) => {
    const listener = (event: any) => {
      const index = event.listEvent?.currentSelectItemIndex;
      const selected = event.listEvent?.currentSelectItemName;

      if (selected === "Back") {
        game.sdk.removeEventListener(listener);
        title(game).then(resolve);
        return;
      }

      if (selected === "No SaveData") {
        return;
      }

      if (typeof index === "number") {
        const savedata = game.savedatas[index];

        if (!savedata) return;

        game.savedata = clone(savedata);

        game.sdk.removeEventListener(listener);
        resolve();
      }
    };

    game.sdk.addEventListener(listener);
  });
};

const showEnd = async (game: Game): Promise<void> => {
  const page = game.sdk.createPage("end");

  page
    .addTextElement("Game End")
    .setPosition((position) => position.setX(8).setY(40))
    .setSize((size) => size.setWidth(280).setHeight(80));

  await page.render();
};

export default title;