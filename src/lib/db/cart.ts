import { cookies } from "next/dist/client/components/headers";
import { getServerSession } from "next-auth";

import CryptoJS from "crypto-js";

import { Cart, CartItem, Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { env } from "../env";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export type CartWithProducts = Prisma.CartGetPayload<{
  include: { items: { include: { product: true } } };
}>;

export type CartItemWithProduct = Prisma.CartItemGetPayload<{
  include: { product: true };
}>;

export type ShoppingCart = CartWithProducts & {
  size: number;
  subtotal: number;
};
export async function getCart(): Promise<ShoppingCart | null> {
  const session = await getServerSession(authOptions);

  let cart: CartWithProducts | null = null;

  if (session) {
    cart = await prisma.cart.findFirst({
      where: { userId: session.user.id },
      include: { items: { include: { product: true } } },
    });
  } else {
    const localCartId = cookies().get("localCartId")?.value;
    const decryptedLocalCartId = decryptData(localCartId || "");

    cart = decryptedLocalCartId
      ? await prisma.cart.findUnique({
          where: { id: decryptedLocalCartId },
          include: { items: { include: { product: true } } },
        })
      : null;
  }

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
  const session = await getServerSession(authOptions);

  let newCart: Cart;

  if (session) {
    newCart = await prisma.cart.create({
      data: { userId: session.user.id },
    });
  } else {
    newCart = await prisma.cart.create({
      data: {},
    });

    const hashedCartId = encryptData(newCart.id);

    cookies().set("localCartId", hashedCartId, {
      secure: true, // Send the cookie over HTTPS only (in production)
      httpOnly: true, // Cookie cannot be accessed by client-side scripts);
    });
  }

  return {
    ...newCart,
    items: [],
    size: 0,
    subtotal: 0,
  };
}

export function encryptData(data: string): string {
  const encryptedData = CryptoJS.AES.encrypt(data, env.SECRET_KEY).toString();
  return encryptedData;
}

export function decryptData(encryptedData: string): string {
  const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, env.SECRET_KEY);
  const decryptedData = decryptedBytes.toString(CryptoJS.enc.Utf8);
  return decryptedData;
}

export async function mergeAnonymousCartIntoUserCart(userId: string) {
  const localCartId = cookies().get("localCartId")?.value;
  const decryptedLocalCartId = decryptData(localCartId || "");

  const localCart = decryptedLocalCartId
    ? await prisma.cart.findUnique({
        where: { id: decryptedLocalCartId },
        include: { items: true },
      })
    : null;

  if (!localCart) return;

  const userCart = await prisma.cart.findFirst({
    where: { userId },
    include: { items: true },
  });

  await prisma.$transaction(async (tx) => {
    if (userCart) {
      const mergedCartItems = mergeCartItems(localCart.items, userCart.items);

      await tx.cartItem.deleteMany({
        where: { cartId: userCart.id },
      });

      await tx.cart.update({
        where: { id: userCart.id },
        data: {
          items: {
            createMany: {
              data: mergedCartItems.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
              })),
            },
          },
        },
      });
    } else {
      await tx.cart.create({
        data: {
          userId,
          items: {
            createMany: {
              data: localCart.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
              })),
            },
          },
        },
      });
    }

    await tx.cart.delete({
      where: { id: localCart.id },
    });
    // throw Error("Transaction failed");
    cookies().set("localCartId", "");
  });
}

function mergeCartItems(...cartItems: CartItem[][]): CartItem[] {
  return cartItems.reduce((acc, items) => {
    items.forEach((item) => {
      const existingItem = acc.find((i) => i.productId === item.productId);
      if (existingItem) {
        existingItem.quantity += item.quantity;
      } else {
        acc.push(item);
      }
    });
    return acc;
  }, [] as CartItem[]);
}
