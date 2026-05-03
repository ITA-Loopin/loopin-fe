export interface OAuthLoginRequest extends Record<string, unknown> {
    nickname: string; // max 10 (검증은 프론트에서 별도로)
    ticket: string;
}
