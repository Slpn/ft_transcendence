import { UserService } from './user.service';
import { User } from './user.entity';
import { Response } from 'express';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    signup(login: string, username: string, password: string, email: string, avatar42: string, res: any): Promise<any>;
    me(req: any, res: any): Promise<User>;
    getUserById(id: any, req: any, res: any): Promise<User>;
    getUserByUsername(username: any, req: any, res: any): Promise<User>;
    signout(res: any): void;
    saveSettings(request: any, res: any): Promise<any>;
    twoFactorSwitch(request: any, res: any): Promise<any>;
    searchUser(request: any, res: any): Promise<any>;
    blockUser(request: any, res: any): Promise<void>;
    unblockUser(request: any, res: any): Promise<void>;
    getBlockListById(request: any, res: any, id: any): Promise<void>;
    uploadFile(file: any, request: any, res: any): Promise<any>;
    deleteFile(request: any, res: any): Promise<any>;
    serveImage(fileName: string, res: Response): Promise<void>;
}
