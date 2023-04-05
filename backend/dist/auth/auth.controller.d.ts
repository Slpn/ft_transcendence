import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
export declare class AuthController {
    private authService;
    private userService;
    constructor(authService: AuthService, userService: UserService);
    signin(req: any, res: any): Promise<void>;
    signin42(query: any, res: any): Promise<any>;
    getQrcode(req: any): Promise<any>;
    verifytwoFactorCode(req: any, res: any): Promise<any>;
    getProfile(req: any): string;
}
