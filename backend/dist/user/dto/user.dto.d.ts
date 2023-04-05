export declare class UserDto {
    readonly id: number;
    readonly login?: string;
    readonly username: string;
    readonly email: string;
    readonly password?: string;
    readonly twoFactorAuthenticationSecret?: string;
    readonly loginChallenge?: string;
    readonly twoFactorAuthEnabled: number;
}
export declare class UserSigninDto {
    readonly username: string;
    readonly password: string;
}
