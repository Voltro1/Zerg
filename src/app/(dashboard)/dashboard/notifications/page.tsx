import { redirect } from "next/navigation";
import { NotificationsClient } from "@/components/dashboard/notifications-client";
import { getCurrentUser } from "@/actions/auth";
import { getNotifications } from "@/services/marketplace";

export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const notifications = await getNotifications(user.id);

  return <NotificationsClient userId={user.id} initialNotifications={notifications} />;
}
