export interface ISPPlan {
  id: string;
  name: string;
  speed: number;
  price: number;
}

export interface ISP {
  id: string;
  name: string;
  color: string;
  plans: ISPPlan[];
}
