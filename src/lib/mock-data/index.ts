import type { Table, MenuItem, Order, Reservation, InventoryItem, UserProfile, RestaurantSettings } from "@/lib/types";

export const mockTables: Table[] = Array.from({ length: 20 }, (_, i) => {
  const num = i + 1;
  const statuses: Array<"available" | "occupied" | "reserved" | "cleaning"> = [
    "available",
    "occupied",
    "reserved",
    "cleaning",
  ];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  return {
    id: `t-${num}`,
    number: num,
    capacity: num <= 4 ? 2 : num <= 8 ? 4 : num <= 12 ? 6 : 8,
    status,
    location: num <= 10 ? "Main Hall" : "Garden",
  };
});

export const mockMenuItems: MenuItem[] = [
  { id: "m-1", name: "Margherita Pizza", description: "Classic tomato sauce, mozzarella, and basil", price: 12.99, category: "Pizza", isAvailable: true },
  { id: "m-2", name: "Pepperoni Pizza", description: "Tomato sauce, mozzarella, and pepperoni", price: 14.99, category: "Pizza", isAvailable: true },
  { id: "m-3", name: "BBQ Chicken Pizza", description: "BBQ sauce, chicken, red onions, cilantro", price: 15.99, category: "Pizza", isAvailable: true },
  { id: "m-4", name: "Classic Burger", description: "Beef patty, lettuce, tomato, onion, pickles", price: 10.99, category: "Burger", isAvailable: true },
  { id: "m-5", name: "Cheese Burger", description: "Beef patty with melted cheddar cheese", price: 11.99, category: "Burger", isAvailable: true },
  { id: "m-6", name: "Bacon Burger", description: "Beef patty with crispy bacon and BBQ sauce", price: 13.99, category: "Burger", isAvailable: true },
  { id: "m-7", name: "Coca Cola", description: "Refreshing cola drink", price: 2.99, category: "Drinks", isAvailable: true },
  { id: "m-8", name: "Orange Juice", description: "Freshly squeezed orange juice", price: 3.99, category: "Drinks", isAvailable: true },
  { id: "m-9", name: "Lemonade", description: "Homemade fresh lemonade", price: 2.99, category: "Drinks", isAvailable: true },
  { id: "m-10", name: "Tiramisu", description: "Classic Italian coffee-flavoured dessert", price: 6.99, category: "Desserts", isAvailable: true },
  { id: "m-11", name: "Chocolate Cake", description: "Rich chocolate layered cake", price: 5.99, category: "Desserts", isAvailable: true },
  { id: "m-12", name: "Cheesecake", description: "New York style cheesecake", price: 6.49, category: "Desserts", isAvailable: true },
  { id: "m-13", name: "Spaghetti Carbonara", description: "Creamy pasta with pancetta and parmesan", price: 13.99, category: "Pasta", isAvailable: true },
  { id: "m-14", name: "Penne Arrabbiata", description: "Penne with spicy tomato sauce", price: 11.99, category: "Pasta", isAvailable: true },
  { id: "m-15", name: "Fettuccine Alfredo", description: "Fettuccine in creamy Alfredo sauce", price: 12.99, category: "Pasta", isAvailable: true },
];

export const mockOrders: Order[] = [
  {
    id: "o-1",
    tableId: "t-2",
    tableNumber: 2,
    items: [
      { menuItemId: "m-1", name: "Margherita Pizza", price: 12.99, quantity: 1 },
      { menuItemId: "m-7", name: "Coca Cola", price: 2.99, quantity: 2 },
    ],
    status: "pending",
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    total: 18.97,
    tax: 1.52,
    discount: 0,
    finalTotal: 20.49,
  },
  {
    id: "o-2",
    tableId: "t-5",
    tableNumber: 5,
    items: [
      { menuItemId: "m-4", name: "Classic Burger", price: 10.99, quantity: 2 },
      { menuItemId: "m-9", name: "Lemonade", price: 2.99, quantity: 2 },
    ],
    status: "cooking",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    total: 27.96,
    tax: 2.24,
    discount: 2,
    finalTotal: 28.2,
  },
  {
    id: "o-3",
    tableId: "t-3",
    tableNumber: 3,
    items: [
      { menuItemId: "m-2", name: "Pepperoni Pizza", price: 14.99, quantity: 1 },
      { menuItemId: "m-10", name: "Tiramisu", price: 6.99, quantity: 1 },
    ],
    status: "ready",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    total: 21.98,
    tax: 1.76,
    discount: 0,
    finalTotal: 23.74,
  },
  {
    id: "o-4",
    tableId: "t-7",
    tableNumber: 7,
    items: [
      { menuItemId: "m-13", name: "Spaghetti Carbonara", price: 13.99, quantity: 1 },
      { menuItemId: "m-8", name: "Orange Juice", price: 3.99, quantity: 1 },
    ],
    status: "served",
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    total: 17.98,
    tax: 1.44,
    discount: 0,
    finalTotal: 19.42,
  },
  {
    id: "o-5",
    tableId: "t-1",
    tableNumber: 1,
    items: [
      { menuItemId: "m-5", name: "Cheese Burger", price: 11.99, quantity: 1 },
      { menuItemId: "m-11", name: "Chocolate Cake", price: 5.99, quantity: 1 },
      { menuItemId: "m-7", name: "Coca Cola", price: 2.99, quantity: 1 },
    ],
    status: "pending",
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    total: 20.97,
    tax: 1.68,
    discount: 0,
    finalTotal: 22.65,
  },
];

export const mockReservations: Reservation[] = [
  {
    id: "r-1",
    customerName: "John Smith",
    phone: "+1 555-0101",
    tableId: "t-10",
    tableNumber: 10,
    date: new Date().toISOString().split("T")[0],
    time: "19:00",
    guests: 4,
    notes: "Birthday celebration",
  },
  {
    id: "r-2",
    customerName: "Sarah Johnson",
    phone: "+1 555-0102",
    tableId: "t-12",
    tableNumber: 12,
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    time: "20:00",
    guests: 6,
  },
  {
    id: "r-3",
    customerName: "Michael Brown",
    phone: "+1 555-0103",
    tableId: "t-4",
    tableNumber: 4,
    date: new Date().toISOString().split("T")[0],
    time: "18:30",
    guests: 2,
    notes: "Window seat preferred",
  },
];

export const mockInventory: InventoryItem[] = [
  { id: "i-1", name: "Tomato Sauce", quantity: 50, unit: "kg", minThreshold: 10, supplier: "Fresh Foods Inc.", lastUpdated: new Date().toISOString() },
  { id: "i-2", name: "Mozzarella Cheese", quantity: 25, unit: "kg", minThreshold: 5, supplier: "Dairy Best", lastUpdated: new Date().toISOString() },
  { id: "i-3", name: "Ground Beef", quantity: 30, unit: "kg", minThreshold: 10, supplier: "Meat Masters", lastUpdated: new Date().toISOString() },
  { id: "i-4", name: "Pasta", quantity: 100, unit: "kg", minThreshold: 20, supplier: "Italian Imports", lastUpdated: new Date().toISOString() },
  { id: "i-5", name: "Flour", quantity: 200, unit: "kg", minThreshold: 50, supplier: "Grain Co.", lastUpdated: new Date().toISOString() },
  { id: "i-6", name: "Olive Oil", quantity: 15, unit: "L", minThreshold: 5, supplier: "Mediterranean Oils", lastUpdated: new Date().toISOString() },
  { id: "i-7", name: "Coca Cola Cans", quantity: 8, unit: "cases", minThreshold: 10, supplier: "Beverage Distributors", lastUpdated: new Date().toISOString() },
  { id: "i-8", name: "Chocolate", quantity: 12, unit: "kg", minThreshold: 5, supplier: "Sweet Supplies", lastUpdated: new Date().toISOString() },
];

export const mockProfile: UserProfile = {
  id: "u-1",
  name: "Restaurant Manager",
  email: "manager@restaurant.com",
  role: "Manager",
  phone: "+1 555-0000",
};

export const mockSettings: RestaurantSettings = {
  name: "Gourmet Bistro",
  primaryColor: "#f97316",
  taxRate: 8,
  currency: "$",
  openingHours: { open: "09:00", close: "23:00" },
  address: "123 Main Street, Food City",
  phone: "+1 555-RESTAURANT",
};
