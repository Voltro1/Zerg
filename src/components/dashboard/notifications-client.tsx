"use client";

import Link from "next/link";
import { toast } from "sonner";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/utils";
import { markNotificationReadAction, markAllNotificationsReadAction } from "@/actions/social";
import { useNotifications } from "@/hooks/use-notifications";
import type { Notification } from "@/types";

export function NotificationsClient({
  userId,
  initialNotifications,
}: {
  userId: string;
  initialNotifications: Notification[];
}) {
  const { notifications, setNotifications, setUnreadCount } = useNotifications(userId);
  const displayNotifications = notifications.length > 0 ? notifications : initialNotifications;

  const handleMarkRead = async (id: string) => {
    await markNotificationReadAction(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsReadAction();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    toast.success("All notifications marked as read");
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Notifications</h1>
          <p className="mt-1 text-muted-foreground">Stay updated on your activity</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
          Mark all read
        </Button>
      </div>

      {displayNotifications.length > 0 ? (
        <div className="space-y-2">
          {displayNotifications.map((n) => (
            <Card key={n.id} className={!n.read ? "border-primary/20 bg-primary/5" : ""}>
              <CardContent className="flex items-start justify-between p-4">
                <div className="flex-1">
                  {n.link ? (
                    <Link href={n.link} onClick={() => !n.read && handleMarkRead(n.id)}>
                      <p className="font-medium text-sm">{n.title}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                    </Link>
                  ) : (
                    <>
                      <p className="font-medium text-sm">{n.title}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                    </>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">{formatDate(n.created_at)}</p>
                </div>
                {!n.read && (
                  <Button variant="ghost" size="sm" onClick={() => handleMarkRead(n.id)}>
                    Mark read
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState icon={Bell} title="No notifications" description="You're all caught up!" />
      )}
    </div>
  );
}
