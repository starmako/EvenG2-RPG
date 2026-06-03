import Scene from "../core/scene";


export type savedata = {
  id?: string;
  datetime?: datetime;
  scene?: {
    prev?: Scene;
    current?: Scene;
    next?: Scene;
  }
  character?:{
    paramater?:{
      hp: number;
      str: number;
      def: number;
      spd: number;
    }
    status?:{
      hp: number;
      exp: number;
    }
    item?:{
      item_id: string;
      prefix_id: string;
      suffix_id: string;
      rank: number;
    }[]
    equip?:{
      equip_id: string;
      prefix_id: string;
      suffix_id: string;
      rank: number;
      is_used: boolean;
    }[]
  }
  explore?: {
    progress: number;
  }
    
  hoge?: string
}

  

