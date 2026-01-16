import type { ISP, ISPPlan } from "@/types/isp";

export const ISPS: ISP[] = [
  {
    id: "jio",
    name: "Jio Fiber",
    color: "#0A2885",
    plans: [
      { id: "jio_30", name: "Jio Fiber 30", speed: 30, price: 399 },
      { id: "jio_100", name: "Jio Fiber 100", speed: 100, price: 699 },
      { id: "jio_150", name: "Jio Fiber 150", speed: 150, price: 999 },
      { id: "jio_300", name: "Jio Fiber 300", speed: 300, price: 1499 },
      { id: "jio_1000", name: "Jio Fiber 1 Gbps", speed: 1000, price: 3999 },
    ],
  },
  {
    id: "airtel",
    name: "Airtel Xstream",
    color: "#ED1C24",
    plans: [
      { id: "airtel_40", name: "Airtel 40 Mbps", speed: 40, price: 499 },
      { id: "airtel_100", name: "Airtel 100 Mbps", speed: 100, price: 699 },
      { id: "airtel_200", name: "Airtel 200 Mbps", speed: 200, price: 999 },
      { id: "airtel_300", name: "Airtel 300 Mbps", speed: 300, price: 1499 },
    ],
  },
  {
    id: "act",
    name: "ACT Fibernet",
    color: "#E31E25",
    plans: [
      { id: "act_150", name: "ACT Rapid", speed: 150, price: 749 },
      { id: "act_200", name: "ACT Blaze", speed: 200, price: 999 },
      { id: "act_300", name: "ACT Storm", speed: 300, price: 1049 },
    ],
  },
  {
    id: "bsnl",
    name: "BSNL Fiber",
    color: "#0066B3",
    plans: [
      { id: "bsnl_100", name: "BSNL Fiber Premium", speed: 100, price: 799 },
      { id: "bsnl_200", name: "BSNL Fiber Ultra", speed: 200, price: 999 },
    ],
  },
  {
    id: "tata",
    name: "Tata Play Fiber",
    color: "#002B5C",
    plans: [
      { id: "tata_150", name: "Tata 150 Mbps", speed: 150, price: 999 },
      { id: "tata_300", name: "Tata 300 Mbps", speed: 300, price: 1499 },
    ],
  },
];

export function getISPById(ispId: string) {
  return ISPS.find((isp) => isp.id === ispId);
}

export function getPlanById(ispId: string, planId: string): ISPPlan | undefined {
  return getISPById(ispId)?.plans.find((plan) => plan.id === planId);
}
