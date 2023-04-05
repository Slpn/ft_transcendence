export class UserDto {
  readonly id: number;
  readonly login?: string;
  readonly username: string;
  readonly email: string;
  readonly password?: string;
  readonly twoFactorAuthenticationSecret?: string;
  readonly loginChallenge?: string;
  readonly twoFactorAuthEnabled: number;
}

export class UserSigninDto {
  readonly username: string;
  readonly password: string;
}
