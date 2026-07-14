import type { Table, MenuItem, Order, Reservation, InventoryItem, UserProfile, RestaurantSettings } from "./types";

const TABLES_KEY = "rms_tables";
const MENU_KEY = "rms_menu";
const ORDERS_KEY = "rms_orders";
const RESERVATIONS_KEY = "rms_reservations";
const INVENTORY_KEY = "rms_inventory";
const PROFILE_KEY = "rms_profile";
const SETTINGS_KEY = "rms_settings";
const INITIALIZED_KEY = "rms_initialized";

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export const storage = {
  getTables: (): Table[] => getItem(TABLES_KEY, []),
  setTables: (v: Table[]) => setItem(TABLES_KEY, v),

  getMenu: (): MenuItem[] => getItem(MENU_KEY, []),
  setMenu: (v: MenuItem[]) => setItem(MENU_KEY, v),

  getOrders: (): Order[] => getItem(ORDERS_KEY, []),
  setOrders: (v: Order[]) => setItem(ORDERS_KEY, v),

  getReservations: (): Reservation[] => getItem(RESERVATIONS_KEY, []),
  setReservations: (v: Reservation[]) => setItem(RESERVATIONS_KEY, v),

  getInventory: (): InventoryItem[] => getItem(INVENTORY_KEY, []),
  setInventory: (v: InventoryItem[]) => setItem(INVENTORY_KEY, v),

  getProfile: (): UserProfile | null => getItem(PROFILE_KEY, null),
  setProfile: (v: UserProfile) => setItem(PROFILE_KEY, v),

  getSettings: (): RestaurantSettings | null => getItem(SETTINGS_KEY, null),
  setSettings: (v: RestaurantSettings) => setItem(SETTINGS_KEY, v),

  isInitialized: (): boolean => getItem(INITIALIZED_KEY, false),
  markInitialized: () => setItem(INITIALIZED_KEY, true),
};
