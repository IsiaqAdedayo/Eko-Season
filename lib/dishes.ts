import dishes from "../data/dishes.json";

export type Dish = (typeof dishes)[number];

export const allDishes = dishes as Dish[];
