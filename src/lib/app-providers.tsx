"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type {
  Table,
  MenuItem,
  Order,
  Reservation,
  InventoryItem,
  UserProfile,
  RestaurantSettings,
} from "@/lib/types";
import { storage } from "@/lib/local-storage";
import {
  mockTables,
  mockMenuItems,
  mockOrders,
  mockReservations,
  mockInventory,
  mockProfile,
  mockSettings,
} from "@/lib/mock-data";

function initIfNeeded() {
  if (typeof window !== "undefined" && !storage.isInitialized()) {
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

// --- Tables Context ---
interface TablesContextType {
  tables: Table[];
  updateTable: (id: string, updates: Partial<Table>) => void;
}
const TablesContext = createContext<TablesContextType>({ tables: [], updateTable: () => {} });

export function TablesProvider({ children }: { children: React.ReactNode }) {
  const [tables, setTables] = useState<Table[]>([]);

  useEffect(() => {
    initIfNeeded();
    setTables(storage.getTables());
  }, []);

  const updateTable = useCallback((id: string, updates: Partial<Table>) => {
    setTables((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, ...updates } : t));
      storage.setTables(next);
      return next;
    });
  }, []);

  return <TablesContext.Provider value={{ tables, updateTable }}>{children}</TablesContext.Provider>;
}

export function useTables() {
  return useContext(TablesContext);
}

// --- Menu Context ---
interface MenuContextType {
  items: MenuItem[];
  addItem: (item: MenuItem) => void;
  updateItem: (id: string, updates: Partial<MenuItem>) => void;
  removeItem: (id: string) => void;
}
const MenuContext = createContext<MenuContextType>({
  items: [],
  addItem: () => {},
  updateItem: () => {},
  removeItem: () => {},
});

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    initIfNeeded();
    setItems(storage.getMenu());
  }, []);

  const addItem = useCallback((item: MenuItem) => {
    setItems((prev) => {
      const next = [...prev, item];
      storage.setMenu(next);
      return next;
    });
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<MenuItem>) => {
    setItems((prev) => {
      const next = prev.map((i) => (i.id === id ? { ...i, ...updates } : i));
      storage.setMenu(next);
      return next;
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id);
      storage.setMenu(next);
      return next;
    });
  }, []);

  return (
    <MenuContext.Provider value={{ items, addItem, updateItem, removeItem }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  return useContext(MenuContext);
}

// --- Orders Context ---
interface OrdersContextType {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  removeOrder: (id: string) => void;
}
const OrdersContext = createContext<OrdersContextType>({
  orders: [],
  addOrder: () => {},
  updateOrder: () => {},
  removeOrder: () => {},
});

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    initIfNeeded();
    setOrders(storage.getOrders());
  }, []);

  const addOrder = useCallback((order: Order) => {
    setOrders((prev) => {
      const next = [...prev, order];
      storage.setOrders(next);
      return next;
    });
  }, []);

  const updateOrder = useCallback((id: string, updates: Partial<Order>) => {
    setOrders((prev) => {
      const next = prev.map((o) => (o.id === id ? { ...o, ...updates } : o));
      storage.setOrders(next);
      return next;
    });
  }, []);

  const removeOrder = useCallback((id: string) => {
    setOrders((prev) => {
      const next = prev.filter((o) => o.id !== id);
      storage.setOrders(next);
      return next;
    });
  }, []);

  return (
    <OrdersContext.Provider value={{ orders, addOrder, updateOrder, removeOrder }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  return useContext(OrdersContext);
}

// --- Reservations Context ---
interface ReservationsContextType {
  reservations: Reservation[];
  addReservation: (r: Reservation) => void;
  updateReservation: (id: string, updates: Partial<Reservation>) => void;
  removeReservation: (id: string) => void;
}
const ReservationsContext = createContext<ReservationsContextType>({
  reservations: [],
  addReservation: () => {},
  updateReservation: () => {},
  removeReservation: () => {},
});

export function ReservationsProvider({ children }: { children: React.ReactNode }) {
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    initIfNeeded();
    setReservations(storage.getReservations());
  }, []);

  const addReservation = useCallback((r: Reservation) => {
    setReservations((prev) => {
      const next = [...prev, r];
      storage.setReservations(next);
      return next;
    });
  }, []);

  const updateReservation = useCallback((id: string, updates: Partial<Reservation>) => {
    setReservations((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, ...updates } : r));
      storage.setReservations(next);
      return next;
    });
  }, []);

  const removeReservation = useCallback((id: string) => {
    setReservations((prev) => {
      const next = prev.filter((r) => r.id !== id);
      storage.setReservations(next);
      return next;
    });
  }, []);

  return (
    <ReservationsContext.Provider value={{ reservations, addReservation, updateReservation, removeReservation }}>
      {children}
    </ReservationsContext.Provider>
  );
}

export function useReservations() {
  return useContext(ReservationsContext);
}

// --- Inventory Context ---
interface InventoryContextType {
  items: InventoryItem[];
  addItem: (item: InventoryItem) => void;
  updateItem: (id: string, updates: Partial<InventoryItem>) => void;
  removeItem: (id: string) => void;
}
const InventoryContext = createContext<InventoryContextType>({
  items: [],
  addItem: () => {},
  updateItem: () => {},
  removeItem: () => {},
});

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<InventoryItem[]>([]);

  useEffect(() => {
    initIfNeeded();
    setItems(storage.getInventory());
  }, []);

  const addItem = useCallback((item: InventoryItem) => {
    setItems((prev) => {
      const next = [...prev, item];
      storage.setInventory(next);
      return next;
    });
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<InventoryItem>) => {
    setItems((prev) => {
      const next = prev.map((i) => (i.id === id ? { ...i, ...updates, lastUpdated: new Date().toISOString() } : i));
      storage.setInventory(next);
      return next;
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id);
      storage.setInventory(next);
      return next;
    });
  }, []);

  return (
    <InventoryContext.Provider value={{ items, addItem, updateItem, removeItem }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  return useContext(InventoryContext);
}

// --- Profile Context ---
interface ProfileContextType {
  profile: UserProfile | null;
  updateProfile: (updates: Partial<UserProfile>) => void;
}
const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  updateProfile: () => {},
});

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    initIfNeeded();
    setProfile(storage.getProfile());
  }, []);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile((prev) => {
      const next = prev ? { ...prev, ...updates } : null;
      if (next) storage.setProfile(next);
      return next;
    });
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}

// --- Settings Context ---
interface SettingsContextType {
  settings: RestaurantSettings | null;
  updateSettings: (updates: Partial<RestaurantSettings>) => void;
}
const SettingsContext = createContext<SettingsContextType>({
  settings: null,
  updateSettings: () => {},
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);

  useEffect(() => {
    initIfNeeded();
    setSettings(storage.getSettings());
  }, []);

  const updateSettings = useCallback((updates: Partial<RestaurantSettings>) => {
    setSettings((prev) => {
      const next = prev ? { ...prev, ...updates } : null;
      if (next) storage.setSettings(next);
      return next;
    });
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}

// --- App Providers Wrapper ---
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <TablesProvider>
      <MenuProvider>
        <OrdersProvider>
          <ReservationsProvider>
            <InventoryProvider>
              <ProfileProvider>
                <SettingsProvider>{children}</SettingsProvider>
              </ProfileProvider>
            </InventoryProvider>
          </ReservationsProvider>
        </OrdersProvider>
      </MenuProvider>
    </TablesProvider>
  );
}
