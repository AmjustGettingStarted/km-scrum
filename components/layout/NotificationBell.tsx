"use client";

import { useState } from "react";
import { Bell, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { markNotificationAsReadAction } from "@/services/notification.service";
import Link from "next/link";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: Date | string;
}

export function NotificationBell({ initialNotifications = [] }: { initialNotifications?: NotificationItem[] }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsReadAction(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (e) {
      // Ignore
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="text-steel hover:text-charcoal p-1.5 rounded-inputs transition-colors relative cursor-pointer">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-electric-blue"></span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 p-2">
        <div className="flex items-center justify-between pb-2 border-b border-ash px-1">
          <span className="text-xs font-semibold text-charcoal">Notifications</span>
          <span className="text-[10px] text-fog font-medium">{unreadCount} unread</span>
        </div>

        <div className="divide-y divide-ash/60 max-h-64 overflow-y-auto py-1">
          {notifications.length === 0 ? (
            <div className="py-6 text-center text-xs text-fog italic">
              No notifications at this time.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-2 rounded-inputs text-xs transition-colors ${
                  n.is_read ? "opacity-75" : "bg-blue-50/50 font-medium"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-semibold text-charcoal block">{n.title}</span>
                    <p className="text-[11px] text-steel line-clamp-2 mt-0.5">{n.message}</p>
                  </div>
                  {!n.is_read && (
                    <button
                      type="button"
                      onClick={() => handleMarkAsRead(n.id)}
                      className="p-1 text-fog hover:text-electric-blue cursor-pointer"
                      title="Mark as read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                {n.link && (
                  <Link
                    href={n.link}
                    className="text-[10px] text-electric-blue hover:underline block mt-1"
                  >
                    View details &rarr;
                  </Link>
                )}
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
