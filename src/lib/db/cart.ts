import { cookies } from "next/dist/client/components/headers";

import CryptoJS from "crypto-js";

import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

export type CartWithProducts = Prisma.CartGetPayload<{
  include: { items: { include: { product: true } } };
}>;

export type ShoppingCart = CartWithProducts & {
  size: number;
  subtotal: number;
};

export async function getCart(): Promise<ShoppingCart | null> {
  const localCartId = cookies().get("localCartId")?.value || "";
  const decryptedLocalCartId = decryptData(localCartId);

  const cart = decryptedLocalCartId
    ? await prisma.cart.findUnique({
        where: { id: decryptedLocalCartId },
        include: { items: { include: { product: true } } },
      })
    : null;

  if (!cart) {
    return null;
  }

  return {
    ...cart,
    size: cart.items.reduce((acc, item) => acc + item.quantity, 0),
    subtotal: cart.items.reduce(
      (acc, item) => acc + item.quantity * item.product.price,
      0,
    ),
  };
}

export async function createCart(): Promise<ShoppingCart> {
  const newCart = await prisma.cart.create({
    data: {},
  });

  const hashedCartId = encryptData(newCart.id);

  cookies().set("localCartId", hashedCartId, {
    secure: true, // Send the cookie over HTTPS only (in production)
    httpOnly: true, // Cookie cannot be accessed by client-side scripts
  });

  return {
    ...newCart,
    items: [],
    size: 0,
    subtotal: 0,
  };
}

export function encryptData(data: string): string {
  const encryptedData = CryptoJS.AES.encrypt(
    data,
    process.env.SECRET_KEY || "",
  ).toString();
  return encryptedData;
}

export function decryptData(encryptedData: string): string {
  const decryptedBytes = CryptoJS.AES.decrypt(
    encryptedData,
    process.env.SECRET_KEY || "",
  );
  const decryptedData = decryptedBytes.toString(CryptoJS.enc.Utf8);
  return decryptedData;
}
