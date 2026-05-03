export const ChatRoomType = {
    ALL: "ALL",
    AI: "AI",
    TEAM: "TEAM",
} as const;

export type ChatRoomType = (typeof ChatRoomType)[keyof typeof ChatRoomType];
