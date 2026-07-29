// Mock/sample data for the mobile notification list (BottomNav/header badge + Drawer list).
// TODO: replace with real backend-backed notifications once push delivery is decided.

export type NotificationType = "program" | "schedule" | "ai_feedback";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  date: string; // YYYY-MM-DD
  read: boolean;
  href?: string; // program/schedule items navigate here
  action?: "open-chat"; // ai_feedback items open the existing ChatPopup instead
}

export const NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    type: "program",
    title: "새로운 지원사업이 등록되었습니다",
    message: "2026년 팁스(TIPS) 창업기업 지원 공고가 새로 올라왔어요.",
    date: "2026-07-27",
    read: false,
    href: "/programs",
  },
  {
    id: "n2",
    type: "schedule",
    title: "오늘 해야 할 일정입니다",
    message: "오늘의 미션을 확인하고 다음 단계를 이어가 보세요.",
    date: "2026-07-29",
    read: false,
    href: "/dashboard",
  },
  {
    id: "n3",
    type: "ai_feedback",
    title: "AI Coach가 피드백을 보냈습니다",
    message: "코치 요다가 최근 작성 내용에 대한 의견을 남겼어요.",
    date: "2026-07-26",
    read: false,
    action: "open-chat",
  },
];

export function unreadCount(items: NotificationItem[] = NOTIFICATIONS): number {
  return items.filter((n) => !n.read).length;
}
