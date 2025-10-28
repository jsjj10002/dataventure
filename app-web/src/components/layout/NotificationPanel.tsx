'use client';

import { useState } from 'react';
import { Bell, Check, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'EVALUATION_COMPLETED' | 'NEW_RECOMMENDATION' | 'APPLICATION_UPDATE' | 'NEW_MESSAGE' | 'SYSTEM';
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

// 임시 데이터
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'EVALUATION_COMPLETED',
    title: 'AI 인터뷰 평가 완료',
    message: '10월 28일에 진행한 인터뷰의 평가가 완료되었습니다. 결과를 확인해보세요.',
    link: '/evaluation/123',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30) // 30분 전
  },
  {
    id: '2',
    type: 'NEW_RECOMMENDATION',
    title: '새로운 채용 공고 추천',
    message: '당신의 역량에 맞는 5개의 새로운 채용 공고가 추천되었습니다.',
    link: '/recommendations',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2시간 전
  },
  {
    id: '3',
    type: 'APPLICATION_UPDATE',
    title: '지원 상태 업데이트',
    message: '플렉스 AI에 지원하신 서류가 검토 중입니다.',
    link: '/applications/456',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1일 전
  }
];

export default function NotificationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'EVALUATION_COMPLETED':
        return '📊';
      case 'NEW_RECOMMENDATION':
        return '🎯';
      case 'APPLICATION_UPDATE':
        return '📝';
      case 'NEW_MESSAGE':
        return '💬';
      case 'SYSTEM':
        return '⚙️';
      default:
        return '🔔';
    }
  };

  return (
    <div className="relative">
      {/* 알림 버튼 */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {unreadCount}
          </span>
        )}
      </Button>

      {/* 알림 패널 */}
      {isOpen && (
        <>
          {/* 오버레이 */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* 패널 */}
          <div className="absolute right-0 top-12 z-50 w-96 rounded-lg border border-gray-200 bg-white shadow-lg">
            {/* 헤더 */}
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">알림</h3>
                {unreadCount > 0 && (
                  <Badge variant="destructive">{unreadCount}</Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="text-xs"
                  >
                    모두 읽음
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* 알림 리스트 */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="mx-auto mb-2 h-12 w-12 text-gray-300" />
                  <p className="text-sm text-gray-500">새로운 알림이 없습니다</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`group relative px-4 py-3 transition-colors hover:bg-gray-50 ${
                        !notification.isRead ? 'bg-primary-50/50' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        {/* 아이콘 */}
                        <div className="flex-shrink-0 text-2xl">
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* 내용 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-sm text-gray-900">
                              {notification.title}
                            </h4>
                            {!notification.isRead && (
                              <div className="h-2 w-2 flex-shrink-0 rounded-full bg-primary-600" />
                            )}
                          </div>
                          <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            {formatRelativeTime(notification.createdAt)}
                          </p>

                          {/* 액션 버튼 */}
                          <div className="mt-2 flex gap-2">
                            {notification.link && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 gap-1 text-xs"
                                onClick={() => {
                                  handleMarkAsRead(notification.id);
                                  window.location.href = notification.link!;
                                }}
                              >
                                <ExternalLink className="h-3 w-3" />
                                보기
                              </Button>
                            )}
                            {!notification.isRead && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 gap-1 text-xs"
                                onClick={() => handleMarkAsRead(notification.id)}
                              >
                                <Check className="h-3 w-3" />
                                읽음
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 gap-1 text-xs text-red-600 hover:text-red-700"
                              onClick={() => handleDelete(notification.id)}
                            >
                              <X className="h-3 w-3" />
                              삭제
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 푸터 */}
            {notifications.length > 0 && (
              <div className="border-t border-gray-200 px-4 py-2 text-center">
                <Button variant="link" size="sm" className="text-xs">
                  모든 알림 보기
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
