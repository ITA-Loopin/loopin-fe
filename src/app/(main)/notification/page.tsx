"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import Header from "@/components/common/Header";
import {
  fetchNotifications,
  markNotificationsAsRead,
  rejectTeamInvitation,
  acceptTeamInvitation,
  type Notification,
} from "@/lib/notification";

dayjs.locale("ko");

type NotificationGroup = {
  label: string;
  notifications: Notification[];
};

export default function NotificationPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 알림 목록 조회
  const loadNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetchNotifications({
        page: 0,
        size: 20,
      });

      if (response.data) {
        setNotifications(response.data);
      }
    } catch (err) {
      console.error("알림 로드 실패:", err);
      setError(
        err instanceof Error ? err.message : "알림을 불러오는데 실패했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // 알림을 날짜별로 그룹화
  const groupedNotifications = useMemo(() => {
    const groups: NotificationGroup[] = [];
    const today = dayjs().startOf("day");
    const tenDaysAgo = dayjs().subtract(10, "day").startOf("day");

    const todayNotifications: Notification[] = [];
    const recentNotifications: Notification[] = [];
    const olderNotifications: Notification[] = [];

    notifications.forEach((notif) => {
      const notifDate = dayjs(notif.createdAt).startOf("day");

      if (notifDate.isSame(today)) {
        todayNotifications.push(notif);
      } else if (
        notifDate.isAfter(tenDaysAgo) ||
        notifDate.isSame(tenDaysAgo)
      ) {
        recentNotifications.push(notif);
      } else {
        olderNotifications.push(notif);
      }
    });

    if (todayNotifications.length > 0) {
      groups.push({
        label: "오늘",
        notifications: todayNotifications,
      });
    }

    if (recentNotifications.length > 0) {
      groups.push({
        label: "최근 10일",
        notifications: recentNotifications,
      });
    }

    if (olderNotifications.length > 0) {
      groups.push({
        label: "이전",
        notifications: olderNotifications,
      });
    }

    return groups;
  }, [notifications]);

  const handleReject = async (notification: Notification) => {
    try {
      await rejectTeamInvitation(notification.objectId);
      await markNotificationsAsRead([notification.id]);
      await loadNotifications();
    } catch (err) {
      console.error("알림 거절 실패:", err);
    }
  };

  const handleAccept = async (notification: Notification) => {
    try {
      await acceptTeamInvitation(notification.objectId);
      await markNotificationsAsRead([notification.id]);
      await loadNotifications();
      router.push(`/team/${notification.objectId}`);
    } catch (err) {
      console.error("팀 참여 실패:", err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header leftType="back" centerTitle="알림" onBack={() => router.back()} />

      <div className="flex-1 px-4 py-6 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-gray-500">로딩 중...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-gray-500">알림이 없습니다.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {groupedNotifications.map((group) => (
              <div key={group.label} className="flex flex-col gap-4">
                <h2 className="text-sm font-semibold text-gray-700">
                  {group.label}
                </h2>
                <div className="flex flex-col gap-3">
                  {group.notifications.map((notification) => (
                    <NotificationCard
                      key={notification.id}
                      notification={notification}
                      onReject={handleReject}
                      onAccept={handleAccept}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

type NotificationCardProps = {
  notification: Notification;
  onReject: (notification: Notification) => void;
  onAccept: (notification: Notification) => void;
};

function NotificationCard({
  notification,
  onReject,
  onAccept,
}: NotificationCardProps) {
  return (
    <div className="rounded-lg bg-gray-50 border border-gray-100 p-4">
      <p className="text-sm text-gray-900 mb-4 leading-relaxed">
        {notification.content}
      </p>

      <div className="flex gap-2">
        <button
          onClick={() => onReject(notification)}
          className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg"
        >
          거절하기
        </button>
        <button
          onClick={() => onAccept(notification)}
          className="flex-1 px-4 py-2 text-sm font-medium text-red-600 bg-white rounded-lg"
        >
          팀 참여하기
        </button>
      </div>
    </div>
  );
}
