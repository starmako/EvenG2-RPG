// src/scene/base.ts
import type Game from "../core/game";

const base = async (game: Game): Promise<void> => {
  console.log("base!");

  const page = game.sdk.createPage("base");

  page
    .addTextElement("Base")
    .setPosition((position) => position.setX(8).setY(8))
    .setSize((size) => size.setWidth(280).setHeight(40));

  const menu = page
    .addListElement(["所持品", "装備", "探索"])
    .setPosition((position) => position.setX(8).setY(60))
    .setSize((size) => size.setWidth(280).setHeight(160))
    .setIsItemSelectBorderEn(true);

  menu.markAsEventCaptureElement();

  await page.render();

  await new Promise<void>((resolve) => {
    const listener = (event: any) => {
      const selected = event.listEvent?.currentSelectItemName;

      if (!selected) return;

      if (selected === "所持品") {
        game.sdk.removeEventListener(listener);
        showItems(game).then(resolve);
      }

      if (selected === "装備") {
        game.sdk.removeEventListener(listener);
        showEquipments(game).then(resolve);
      }

      if (selected === "探索") {
        game.sdk.removeEventListener(listener);

        // TODO: 探索シーン作成後に差し替え
        console.log("探索へ移動");

        resolve();
      }
    };

    game.sdk.addEventListener(listener);
  });
};

const showItems = async (game: Game): Promise<void> => {
  const page = game.sdk.createPage("items");

  page
    .addTextElement("所持品")
    .setPosition((position) => position.setX(8).setY(8))
    .setSize((size) => size.setWidth(280).setHeight(40));

  const items = game.savedata.items?.length
    ? game.savedata.items.map((item: any) => item.name ?? String(item))
    : ["所持品はありません"];

  const list = page
    .addListElement([...items, "戻る"])
    .setPosition((position) => position.setX(8).setY(60))
    .setSize((size) => size.setWidth(280).setHeight(160))
    .setIsItemSelectBorderEn(true);

  list.markAsEventCaptureElement();

  await page.render();

  await new Promise<void>((resolve) => {
    const listener = (event: any) => {
      const selected = event.listEvent?.currentSelectItemName;

      if (selected === "戻る") {
        game.sdk.removeEventListener(listener);
        base(game).then(resolve);
      }
    };

    game.sdk.addEventListener(listener);
  });
};

const showEquipments = async (game: Game): Promise<void> => {
  const page = game.sdk.createPage("equipments");

  page
    .addTextElement("装備")
    .setPosition((position) => position.setX(8).setY(8))
    .setSize((size) => size.setWidth(280).setHeight(40));

  const equipment = game.savedata.equipment;

  const items = equipment
    ? [
        `右手: ${equipment.rightHand?.name ?? "なし"}`,
        `左手: ${equipment.leftHand?.name ?? "なし"}`,
        `頭: ${equipment.head?.name ?? "なし"}`,
        `体: ${equipment.body?.name ?? "なし"}`,
        `足: ${equipment.legs?.name ?? "なし"}`,
      ]
    : ["装備情報がありません"];

  const list = page
    .addListElement([...items, "戻る"])
    .setPosition((position) => position.setX(8).setY(60))
    .setSize((size) => size.setWidth(280).setHeight(160))
    .setIsItemSelectBorderEn(true);

  list.markAsEventCaptureElement();

  await page.render();

  await new Promise<void>((resolve) => {
    const listener = (event: any) => {
      const selected = event.listEvent?.currentSelectItemName;

      if (selected === "戻る") {
        game.sdk.removeEventListener(listener);
        base(game).then(resolve);
      }
    };

    game.sdk.addEventListener(listener);
  });
};

export default base;