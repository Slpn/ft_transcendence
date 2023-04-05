export declare class User {
    id: number;
    login: string;
    username: string;
    email: string;
    password?: string;
    avatar42: string;
    avatar: string;
    twoFactorAuthenticationSecret?: string;
    loginChallenge?: string;
    twoFactorAuthEnabled?: number;
    xp: number;
    gameWon: number;
    gameLost: number;
    qrcode?: string;
}
