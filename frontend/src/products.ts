export type Product = {
  id: string;
  name: string;
  price: number;
  image?: string;
};

export const PRODUCTS: Product[] = [
  { id: "p1", name: "Softeis", price: 2.5 },
  { id: "p2", name: "Pommes", price: 3 },
  { id: "p3", name: "Nuggets", price: 3 },
  { id: "p4", name: "Pommes + Nuggets", price: 5 },
  { id: "p5", name: "Item 5", price: 2.0 },
  { id: "p6", name: "Item 6", price: 1.5 },
  { id: "p7", name: "Item 7", price: 2.0 },
  { id: "p8", name: "Item 8", price: 3.5 },
  { id: "p9", name: "Item 9", price: 1.5 },
  { id: "p10", name: "Item 10", price: 2.0 },
  { id: "p11", name: "Item 11", price: 3.5 },
  { id: "p12", name: "Item 12", price: 3.5 },
];

export type Order = {
  id: string;
  products: Record<string, number>;
  orderTime: number;
};

export type WsMessage = {
  type: "All" | "Add" | "Remove" | "Request";
  data: Object;
};
