export type TableStatus = "available" | "occupied" | "reserved" | "cleaning";

export interface Table {
  id: string;
  number: number;
  capacity: number;
  status: TableStatus;
  location?: string;
}

export type MenuCategory = "Pizza" | "Burger" | "Drinks" | "Desserts" | "Pasta";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  image?: string;
  isAvailable: boolean;
}

export type OrderStatus = "pending" | "cooking" | "ready" | "served";

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  tableId: string;
  tableNumber: number;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: string;
  total: number;
  tax: number;
  discount: number;
  finalTotal: number;
}

export interface Reservation {
  id: string;
  customerName: string;
  phone: string;
  tableId: string;
  tableNumber: number;
  date: string;
  time: string;
  guests: number;
  notes?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  minThreshold: number;
  supplier?: string;
  lastUpdated: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  phone?: string;
}

export interface RestaurantSettings {
  name: string;
  logo?: string;
  primaryColor: string;
  taxRate: number;
  currency: string;
  openingHours: {
    open: string;
    close: string;
  };
  address?: string;
  phone?: string;
}
