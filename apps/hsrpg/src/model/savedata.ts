import Scene from "../core/scene";
import { v4 as uuid } from "uuid";

export type Savedata = {
  id?: string;
  datetime?: Date;
  scene?: {
    prev: (() => void) | null;
    current: (() => void) | null;
    next: (() => void) | null;
  };
  character?: {
    paramater?: {
      hp: number;
      str: number;
      def: number;
      spd: number;
    };
    status?: {
      hp: number;
      exp: number;
    };
    item?: {
      item_id: string;
      prefix_id: string;
      suffix_id: string;
      rank: number;
    }[];
    equip?: {
      equip_id: string;
      prefix_id: string;
      suffix_id: string;
      rank: number;
      is_used: boolean;
    }[];
  };
  explore?: {
    progress: number;
  };

  hoge?: string;
};

export const defaultSavedata = () => {
  return {
    id: uuid(),
    datetime: new Date(),
    scene: {
      prev: null,
      current: null,
      next: null,
    },
  };
};
