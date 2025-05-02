export interface WSMessage {
    type: string;
    payload?: any;
}

export interface OnlineUser {
    id: number;
    username: string;
    role: string;
}