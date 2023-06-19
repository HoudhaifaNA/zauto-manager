import dayjs from "dayjs";

import * as S from "../statments/carStatments";
import { getLicenceById } from "../statments/licenceStatments";
import {
  createTransaction,
  deleteTransactionByProduct,
  deleteTransactionByType,
} from "../statments/transactionStatments";
import tryCatch from "../utils/tryCatch";
import AppError from "../utils/AppError";

interface Licence {
  isValid?: string;
  price?: number;
}

export const getCars = tryCatch((req, res) => {
  const cars = S.getCars.all();

  return res
    .status(200)
    .json({ status: "success", results: cars.length, cars });
});

export const getCarById = tryCatch((req, res, next) => {
  const { carId } = req.params;

  const car = S.getCarById.get(carId);

  if (!car) return next(new AppError("Voiture n'existe pas", 404));

  return res.status(200).json({ status: "success", car });
});

export const createCar = tryCatch((req, res, next) => {
  const {
    type,
    brand,
    model,
    serialNumber,
    registrationNumber,
    keys,
    mileage,
    color,
    year,
    sellerId,
    ownerId,
    ownerName,
    costInEuros,
    euroPrice,
    purchasingPrice,
    expenses,
    totalExpensesCost,
    totalEurosAmount,
    totalCost,
    created_at,
  } = req.body;

  if (ownerId !== 0) {
    const currLicence: Licence = getLicenceById.get(ownerId);

    if (!currLicence || currLicence.isValid === "false") {
      return next(new AppError("Licence invalide", 400));
    }
  }
  const carName = `${brand} ${model}`;

  const { lastInsertRowid } = S.creatCar.run([
    type,
    carName,
    brand,
    model,
    serialNumber,
    registrationNumber,
    keys,
    mileage,
    color,
    year,
    sellerId,
    ownerId,
    ownerName,
    costInEuros,
    euroPrice,
    purchasingPrice,
    JSON.stringify(expenses),
    totalExpensesCost,
    totalEurosAmount,
    totalCost,
    created_at,
  ]);
  const today = dayjs(created_at).format("YYYY-MM-DD");
  const transacrtionParams = [
    lastInsertRowid,
    sellerId,
    `${today}`,
    "car",
    carName,
    color,
    registrationNumber,
    year,
    totalCost,
    "entrante",
  ];

  createTransaction.run(transacrtionParams);

  const newCar = S.getCarById.get(lastInsertRowid);

  return res.status(201).json({ status: "success", car: newCar });
});

export const updateCar = tryCatch((req, res, next) => {
  const { carId } = req.params;
  const {
    brand,
    model,
    serialNumber,
    registrationNumber,
    keys,
    mileage,
    color,
    year,
    costInEuros,
    euroPrice,
    purchasingPrice,
    expenses,
    totalExpensesCost,
    totalEurosAmount,
    totalCost,
  } = req.body;

  let carName = null;

  if (brand && model) carName = `${brand} ${model}`;
  const { changes } = S.updateCar.run([
    carName,
    brand,
    model,
    serialNumber,
    registrationNumber,
    keys,
    mileage,
    color,
    year,
    costInEuros,
    euroPrice,
    purchasingPrice,
    JSON.stringify(expenses),
    totalEurosAmount,
    totalExpensesCost,
    totalCost,
    carId,
  ]);

  if (changes === 0) return next(new AppError("Voiture n'existe pas", 404));

  const updatedCar = S.getCarById.get(carId);

  return res.status(200).json({ status: "success", car: updatedCar });
});

export const sellCar = tryCatch((req, res, next) => {
  const { carId } = req.params;
  const { buyerId, soldPrice } = req.body;

  const car = S.getCarById.get(carId);

  if (!car) return next(new AppError("Voiture n'existe pas", 404));

  //@ts-ignore
  const { brand, model, color, registrationNumber, year } = car;

  //@ts-ignore
  if (car.soldPrice > 0) return next(new AppError("Voiture a été vendue", 403));

  if (!buyerId || !soldPrice)
    return next(new AppError("Mauvais paramètres", 400));

  S.sellCar.run([buyerId, soldPrice, carId]);

  const today = dayjs(new Date()).format("YYYY-MM-DD");
  const transacrtionParams = [
    carId,
    buyerId,
    `${today}`,
    "car",
    `${brand} ${model}`,
    color,
    registrationNumber,
    year,
    soldPrice,
    "sortante",
  ];

  createTransaction.run(transacrtionParams);

  const soldCar = S.getCarById.get(carId);

  return res.status(200).json({ status: "success", car: soldCar });
});

export const deleteCarById = tryCatch((req, res, next) => {
  const { carId } = req.params;

  const { changes } = S.deleteCarById.run(carId);
  if (changes === 0) return next(new AppError("Voiture n'existe pas", 404));

  deleteTransactionByProduct.run([carId, "car"]);

  return res.status(204).json({ status: "success" });
});

export const deleteCars = tryCatch((req, res) => {
  S.deleteAllCars.run();
  deleteTransactionByType.run("car");

  return res.status(204).json({ status: "success" });
});
