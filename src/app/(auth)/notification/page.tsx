"use client";

import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import { Button } from "@/components/common/Button";
import {
  acceptTeamInvitation,
  fetchNotifications,
  markNotificationsAsRead,
  rejectTeamInvitation,
  type Notification,
} from "@/lib/notification";

dayjs.locale("ko");

type NotificationGroup = {
  label: string;
  notifications: Notification[];
};

export default function NotificationPage() {
  const router = useRouter();
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: ({ pageParam }) =>
      fetchNotifications({ cursor: pageParam, size: 20 }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.page.hasNext ? lastPage.page.nextCursor : undefined,
  });

  const notifications =
    data?.pages.flatMap((page) => page.data) ?? [];

  const groupedNotifications = useMemo(() => {
    const groups: NotificationGroup[] = [];
    const today = dayjs().startOf("day");
    const tenDaysAgo = dayjs().subtract(10, "day").startOf("day");
    const todayNotifications: Notification[] = [];
    const recentNotifications: Notification[] = [];
    const olderNotifications: Notification[] = [];

    notifications.forEach((notification) => {
      const notificationDate = dayjs(notification.createdAt).startOf("day");

      if (notificationDate.isSame(today)) {
        todayNotifications.push(notification);
      } else if (
        notificationDate.isAfter(tenDaysAgo) ||
        notificationDate.isSame(tenDaysAgo)
      ) {
        recentNotifications.push(notification);
      } else {
        olderNotifications.push(notification);
      }
    });

    if (todayNotifications.length > 0) {
      groups.push({ label: "오늘", notifications: todayNotifications });
    }
    if (recentNotifications.length > 0) {
      groups.push({ label: "최근 10일", notifications: recentNotifications });
    }
    if (olderNotifications.length > 0) {
      groups.push({ label: "이전", notifications: olderNotifications });
    }

    return groups;
  }, [notifications]);

  const handleReject = async (notification: Notification) => {
    try {
      await rejectTeamInvitation(notification.objectId);
      await markNotificationsAsRead([notification.id]);
      await refetch();
    } catch (mutationError) {
      console.error("알림 거절 실패:", mutationError);
    }
  };

  const handleAccept = async (notification: Notification) => {
    try {
      await acceptTeamInvitation(notification.objectId);
      await markNotificationsAsRead([notification.id]);
      await refetch();
      router.push(`/team/${notification.objectId}`);
    } catch (mutationError) {
      console.error("팀 참여 실패:", mutationError);
    }
  };

  const loadMoreButton = hasNextPage ? (
    <Button
      variant="outline"
      className="w-full"
      disabled={isFetchingNextPage}
      onClick={() => fetchNextPage()}
    >
      {isFetchingNextPage ? "불러오는 중..." : "더 보기"}
    </Button>
  ) : null;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-gray-500">로딩 중...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-red-500">{error.message}</p>
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
            {loadMoreButton}
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
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
      <p className="mb-4 text-sm leading-relaxed text-gray-900">
        {notification.content}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => onReject(notification)}
        >
          거절하기
        </Button>
        <Button
          variant="subtleAccent"
          className="flex-1"
          onClick={() => onAccept(notification)}
        >
          팀 참여하기
        </Button>
      </div>
    </div>
  );
}
