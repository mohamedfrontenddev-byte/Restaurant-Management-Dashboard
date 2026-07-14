"use client";

import { useOrders, useTables, useMenu, useInventory } from "@/lib/app-providers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  ClipboardList,
  Armchair,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import { Badge } from "@/components/ui/badge";

const COLORS = ["#f97316", "#3b82f6", "#22c55e", "#eab308", "#a855f7"];

export default function DashboardPage() {
  const { orders } = useOrders();
  const { tables } = useTables();
  const { items: menuItems } = useMenu();
  const { items: inventory } = useInventory();

  const totalRevenue = orders.reduce((sum, o) => sum + o.finalTotal, 0);
  const totalOrders = orders.length;
  const occupiedTables = tables.filter((t) => t.status === "occupied").length;
  const lowStock = inventory.filter((i) => i.quantity <= i.minThreshold).length;

  // Top selling products (mock aggregation)
  const productSales: Record<string, number> = {};
  orders.forEach((o) => {
    o.items.forEach((item) => {
      productSales[item.name] = (productSales[item.name] || 0) + item.quantity;
    });
  });
  const topProducts = Object.entries(productSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  // Revenue by day (mock data)
  const revenueByDay = [
    { day: "Mon", revenue: 1200 },
    { day: "Tue", revenue: 1800 },
    { day: "Wed", revenue: 1500 },
    { day: "Thu", revenue: 2100 },
    { day: "Fri", revenue: 2800 },
    { day: "Sat", revenue: 3500 },
    { day: "Sun", revenue: 3100 },
  ];

  // Orders by status
  const statusCounts = [
    { name: "Pending", value: orders.filter((o) => o.status === "pending").length },
    { name: "Cooking", value: orders.filter((o) => o.status === "cooking").length },
    { name: "Ready", value: orders.filter((o) => o.status === "ready").length },
    { name: "Served", value: orders.filter((o) => o.status === "served").length },
  ].filter((s) => s.value > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your restaurant performance</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All time revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ClipboardList className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">Orders placed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Occupied Tables</CardTitle>
            <Armchair className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupiedTables}</div>
            <p className="text-xs text-muted-foreground">Out of {tables.length} tables</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStock}</div>
            <p className="text-xs text-muted-foreground">Items need attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value}`} />
                <Bar dataKey="revenue" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusCounts}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label
                >
                  {statusCounts.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Top Selling Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sales data yet.</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">#{i + 1}</Badge>
                    <span className="text-sm font-medium">{p.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{p.value} sold</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
