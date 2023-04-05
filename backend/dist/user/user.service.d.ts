import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Blocklist } from './banlist.entity';
import { JwtService } from '@nestjs/jwt';
export declare class UserService {
    private usersRepository;
    private banlistRepository;
    private jwtService;
    usersChannelMap(usersChannelMap: any): void;
    constructor(usersRepository: Repository<User>, banlistRepository: Repository<Blocklist>, jwtService: JwtService);
    getUserById(id: number): Promise<User>;
    getUserByUsername(username: string): Promise<User>;
    getUserByLogin(login: string): Promise<User>;
    searchUser(user: string): Promise<User[]>;
    getUserByEmail(email: string): Promise<User>;
    getUserByLoginChallenge(login: string): Promise<User>;
    signup(login: string, username: string, password: string, email: string, avatar42: string): Promise<{
        state: boolean;
        message: string;
    }>;
    decodeJwtToken(token: string): string | {
        [key: string]: any;
    };
    changeUsername(id: number, username: string): Promise<User>;
    changeEmail(id: number, email: string): Promise<User>;
    setTwoFactorAuthenticationSecret(secret: string, user_id: number): Promise<User>;
    setLoginChallenge(loginChallenge: string, user_id: number): Promise<User>;
    twoFactorSwitch(user_id: number): Promise<User>;
    blockUser(blocker: number, blocked: number): Promise<Blocklist>;
    unblockUser(blocker: number, blocked: number): Promise<Blocklist>;
    getBlockByBothId(blocker: number, blocked: number): Promise<Blocklist>;
    saveUploadedFile(id: number, path: string): Promise<User>;
    removeUploadedFile(id: number): Promise<User>;
    addXp(id: number): Promise<void>;
    addWin(id: number): Promise<void>;
    addLoose(id: number): Promise<void>;
    addQrcode(code: string, id: number): Promise<void>;
}
