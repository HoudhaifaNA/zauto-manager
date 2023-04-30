import uid from "utils/uniqid";
import { Values } from "./types";

export const INITIAL_VALUES: Values = {
  step: 1,
  carType: "importé",
  brand: "",
  serie: "",
  model: "",
  serialNumber: "",
  registrationNumber: "",
  color: "",
  year: "",
  seller: "",
  euroCost: 0,
  euroPrice: 0,
  purchasingPrice: 0,
  lisence: { name: "", price: 0 },
  expenses: [
    {
      id: uid(),
      type: "À l'étranger",
      raison: "",
      euroCost: 0,
      euroPrice: 0,
      totalCost: 0,
    },
  ],
  euroAmount: 0,
  dzdAmount: 0,
  transactionAgreement: true,
};
