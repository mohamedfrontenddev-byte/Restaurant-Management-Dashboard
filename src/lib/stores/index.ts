import { create } from "zustand";
import type { Table, MenuItem, Order, Reservation, InventoryItem, UserProfile, RestaurantSettings } from "@/lib/types";
import { storage } from "@/lib/local-storage";
import { mockTables, mockMenuItems, mockOrders, mockReservations, mockInventory, mockProfile, mockSettings } from "@/lib/mock-data";

function initIfNeeded() {
  if (!storage.isInitialized()) {
    storage.setTables(mockTables);
    storage.setMenu(mockMenuItems);
    storage.setOrders(mockOrders);
    storage.setReservations(mockReservations);
    storage.setInventory(mockInventory);
    storage.setProfile(mockProfile);
    storage.setSettings(mockSettings);
    storage.markInitialized();
  }
}

// --- Table Store ---
interface TableStore {
  tables: Table[];
  load: () => void;
  updateTable: (id: string, updates: Partial<Table>) => void;
}
export const useTableStore = create<TableStore>((set) => ({
  tables: [],
  load: () => {
    initIfNeeded();
    set({ tables: storage.getTables() });
  },
  updateTable: (id, updates) => {
    set((state) => {
      const next = state.tables.map((t) => (t.id === id ? { ...t, ...updates } : t));
      storage.setTables(next);
      return { tables: next };
    });
  },
}));

// --- Menu Store ---
interface MenuStore {
  items: MenuItem[];
  load: () => void;
  addItem: (item: MenuItem) => void;
  updateItem: (id: string, updates: Partial<MenuItem>) => void;
  removeItem: (id: string) => void;
}
export const useMenuStore = create<MenuStore>((set) => ({
  items: [],
  load: () => {
    initIfNeeded();
    set({ items: storage.getMenu() });
  },
  addItem: (item) =>
    set((state) => {
      const next = [...state.items, item];
      storage.setMenu(next);
      return { items: next };
    }),
  updateItem: (id, updates) =>
    set((state) => {
      const next = state.items.map((i) => (i.id === id ? { ...i, ...updates } : i));
      storage.setMenu(next);
      return { items: next };
    }),
  removeItem: (id) =>
    set((state) => {
      const next = state.items.filter((i) => i.id !== id);
      storage.setMenu(next);
      return { items: next };
    }),
}));

// --- Order Store ---
interface OrderStore {
  orders: Order[];
  load: () => void;
  addOrder: (order: Order) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  removeOrder: (id: string) => void;
}
export const useOrderStore = create<OrderStore>((set) => ({
  orders: [],
  load: () => {
    initIfNeeded();
    set({ orders: storage.getOrders() });
  },
  addOrder: (order) =>
    set((state) => {
      const next = [...state.orders, order];
      storage.setOrders(next);
      return { orders: next };
    }),
  updateOrder: (id, updates) =>
    set((state) => {
      const next = state.orders.map((o) => (o.id === id ? { ...o, ...updates } : o));
      storage.setOrders(next);
      return { orders: next };
    }),
  removeOrder: (id) =>
    set((state) => {
      const next = state.orders.filter((o) => o.id !== id);
      storage.setOrders(next);
      return { orders: next };
    }),
}));

// --- Reservation Store ---
interface ReservationStore {
  reservations: Reservation[];
  load: () => void;
  addReservation: (r: Reservation) => void;
  updateReservation: (id: string, updates: Partial<Reservation>) => void;
  removeReservation: (id: string) => void;
}
export const useReservationStore = create<ReservationStore>((set) => ({
  reservations: [],
  load: () => {
    initIfNeeded();
    set({ reservations: storage.getReservations() });
  },
  addReservation: (r) =>
    set((state) => {
      const next = [...state.reservations, r];
      storage.setReservations(next);
      return { reservations: next };
    }),
  updateReservation: (id, updates) =>
    set((state) => {
      const next = state.reservations.map((r) => (r.id === id ? { ...r, ...updates } : r));
      storage.setReservations(next);
      return { reservations: next };
    }),
  removeReservation: (id) =>
    set((state) => {
      const next = state.reservations.filter((r) => r.id !== id);
      storage.setReservations(next);
      return { reservations: next };
    }),
}));

// --- Inventory Store ---
interface InventoryStore {
  items: InventoryItem[];
  load: () => void;
  addItem: (item: InventoryItem) => void;
  updateItem: (id: string, updates: Partial<InventoryItem>) => void;
  removeItem: (id: string) => void;
}
export const useInventoryStore = create<InventoryStore>((set) => ({
  items: [],
  load: () => {
    initIfNeeded();
    set({ items: storage.getInventory() });
  },
  addItem: (item) =>
    set((state) => {
      const next = [...state.items, item];
      storage.setInventory(next);
      return { items: next };
    }),
  updateItem: (id, updates) =>
    set((state) => {
      const next = state.items.map((i) => (i.id === id ? { ...i, ...updates, lastUpdated: new Date().toISOString() } : i));
      storage.setInventory(next);
      return { items: next };
    }),
  removeItem: (id) =>
    set((state) => {
      const next = state.items.filter((i) => i.id !== id);
      storage.setInventory(next);
      return { items: next };
    }),
}));

// --- Profile Store ---
interface ProfileStore {
  profile: UserProfile | null;
  load: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}
export const useProfileStore = create<ProfileStore>((set) => ({
  profile: null,
  load: () => {
    initIfNeeded();
    set({ profile: storage.getProfile() });
  },
  updateProfile: (updates) =>
    set((state) => {
      const next = state.profile ? { ...state.profile, ...updates } : null;
      if (next) storage.setProfile(next);
      return { profile: next };
    }),
}));

// --- Settings Store ---
interface SettingsStore {
  settings: RestaurantSettings | null;
  load: () => void;
  updateSettings: (updates: Partial<RestaurantSettings>) => void;
}
export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: null,
  load: () => {
    initIfNeeded();
    set({ settings: storage.getSettings() });
  },
  updateSettings: (updates) =>
    set((state) => {
      const next = state.settings ? { ...state.settings, ...updates } : null;
      if (next) storage.setSettings(next);
      return { settings: next };
    }),
}));
