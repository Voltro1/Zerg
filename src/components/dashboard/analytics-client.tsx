"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { AnalyticsData, DashboardStats } from "@/types";

export function AnalyticsClient({
  data,
  stats,
  isPremium,
}: {
  data: AnalyticsData;
  stats: DashboardStats;
  isPremium: boolean;
}) {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Analytics</h1>
          <p className="mt-1 text-muted-foreground">Track your performance over the last 30 days</p>
        </div>
        {isPremium && <Badge>Premium Analytics</Badge>}
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-xs text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(stats.totalRevenue || 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-xs text-muted-foreground">Commission Revenue</p>
            <p className="text-2xl font-bold">{formatCurrency(stats.commissionRevenue || 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-xs text-muted-foreground">Product Views</p>
            <p className="text-2xl font-bold">{stats.productViews || 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Sales</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.sales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#b3b3b3" />
                <YAxis tick={{ fontSize: 10 }} stroke="#b3b3b3" />
                <Tooltip contentStyle={{ background: "#181818", border: "1px solid #2a2a2a" }} />
                <Line type="monotone" dataKey="amount" stroke="#ffdd33" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Commission Revenue</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.commissionRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#b3b3b3" />
                <YAxis tick={{ fontSize: 10 }} stroke="#b3b3b3" />
                <Tooltip contentStyle={{ background: "#181818", border: "1px solid #2a2a2a" }} />
                <Line type="monotone" dataKey="amount" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Profile Views</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.views}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#b3b3b3" />
                <YAxis tick={{ fontSize: 10 }} stroke="#b3b3b3" />
                <Tooltip contentStyle={{ background: "#181818", border: "1px solid #2a2a2a" }} />
                <Bar dataKey="count" fill="#ffdd33" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Popular Products</CardTitle></CardHeader>
          <CardContent>
            {data.popularProducts.length > 0 ? (
              <div className="space-y-3">
                {data.popularProducts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm truncate flex-1">{p.name}</span>
                    <span className="text-sm font-medium text-primary ml-2">{p.sales} sales</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No sales data yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
