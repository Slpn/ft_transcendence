"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("./user.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const platform_express_1 = require("@nestjs/platform-express");
const fs_1 = require("fs");
const path_1 = require("path");
const fs = require("fs");
let UserController = class UserController {
    constructor(userService) {
        this.userService = userService;
    }
    async signup(login, username, password, email, avatar42, res) {
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        return res.json(await this.userService.signup(login, username, password, email, avatar42));
    }
    async me(req, res) {
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        const user = await this.userService.getUserById(req.user.id);
        res.json(user);
        return user;
    }
    async getUserById(id, req, res) {
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        const user = await this.userService.getUserById(id);
        res.json(user);
        return user;
    }
    async getUserByUsername(username, req, res) {
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        const user = await this.userService.getUserByUsername(username);
        res.json(user);
        return user;
    }
    signout(res) {
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        res.clearCookie('Auth');
    }
    async saveSettings(request, res) {
        const decodedToken = await this.userService.decodeJwtToken(request.cookies.Auth);
        const id = decodedToken.sub;
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        if (request.body.username) {
            const userByUsername = await this.userService.getUserByUsername(request.body.username);
            if (userByUsername && userByUsername.username == request.body.username) {
                return res.json({ message: "username unavailable" });
            }
            this.userService.changeUsername(id, request.body.username);
        }
        if (request.body.email) {
            const userByEmail = await this.userService.getUserByEmail(request.body.email);
            if (userByEmail && userByEmail.email == request.body.email) {
                return res.json({ message: "email unavailable" });
            }
            this.userService.changeEmail(id, request.body.email);
        }
    }
    async twoFactorSwitch(request, res) {
        const decodedToken = await this.userService.decodeJwtToken(request.cookies.Auth);
        const id = decodedToken.sub;
        const user = await this.userService.twoFactorSwitch(id);
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        return res.json(user);
    }
    async searchUser(request, res) {
        const decodedToken = await this.userService.decodeJwtToken(request.cookies.Auth);
        const id = decodedToken.sub;
        const users = await this.userService.searchUser(request.body.username);
        const i = 0;
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        return res.json({ user: users });
    }
    async blockUser(request, res) {
        const blocked = request.body.blocked;
        const decodedToken = await this.userService.decodeJwtToken(request.cookies.Auth);
        const blocker = decodedToken.sub;
        const block = await this.userService.blockUser(blocker, blocked);
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        res.json(block);
    }
    async unblockUser(request, res) {
        const blocked = request.body.blocked;
        const decodedToken = await this.userService.decodeJwtToken(request.cookies.Auth);
        const blocker = decodedToken.sub;
        const block = await this.userService.unblockUser(blocker, blocked);
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        res.json(block);
    }
    async getBlockListById(request, res, id) {
        const decodedToken = await this.userService.decodeJwtToken(request.cookies.Auth);
        const blocked = id;
        const blocker = decodedToken.sub;
        const block = await this.userService.getBlockByBothId(blocker, blocked);
        let flag = 0;
        if (block) {
            flag = 1;
        }
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        res.json({ flag: flag, block: block });
    }
    async uploadFile(file, request, res) {
        const decodedToken = this.userService.decodeJwtToken(request.cookies.Auth);
        const path = (0, path_1.join)(__dirname, '..', 'user', file.originalname);
        const writeStream = (0, fs_1.createWriteStream)(path);
        writeStream.write(file.buffer);
        writeStream.end();
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        const uploadedFile = await this.userService.saveUploadedFile(decodedToken.sub, file.originalname);
        return res.json({ uploadedFile });
    }
    async deleteFile(request, res) {
        const decodedToken = this.userService.decodeJwtToken(request.cookies.Auth);
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        const uploadedFile = await this.userService.removeUploadedFile(decodedToken.sub);
        return res.json({ uploadedFile });
    }
    async serveImage(fileName, res) {
        const fileStream = fs.createReadStream(`dist/user/${fileName}`);
        fileStream.on('error', () => {
            res.sendStatus(404);
        });
        fileStream.pipe(res);
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    }
};
__decorate([
    (0, common_1.Post)('/signup'),
    __param(0, (0, common_1.Body)('login')),
    __param(1, (0, common_1.Body)('username')),
    __param(2, (0, common_1.Body)('password')),
    __param(3, (0, common_1.Body)('email')),
    __param(4, (0, common_1.Body)('avatar42')),
    __param(5, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "signup", null);
__decorate([
    (0, common_1.Get)('/me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "me", null);
__decorate([
    (0, common_1.Get)('/getUserById/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUserById", null);
__decorate([
    (0, common_1.Get)('/getUserByUsername/:username'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)("username")),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUserByUsername", null);
__decorate([
    (0, common_1.Get)('/signout'),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "signout", null);
__decorate([
    (0, common_1.Post)('/saveSettings'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "saveSettings", null);
__decorate([
    (0, common_1.Post)('/twoFactorSwitch'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "twoFactorSwitch", null);
__decorate([
    (0, common_1.Post)('/searchUser'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "searchUser", null);
__decorate([
    (0, common_1.Post)("/blockUser"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "blockUser", null);
__decorate([
    (0, common_1.Post)("/unblockUser"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "unblockUser", null);
__decorate([
    (0, common_1.Get)('/getBlockByBothId/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getBlockListById", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Post)('upload/delete'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "deleteFile", null);
__decorate([
    (0, common_1.Get)('upload/:name'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('name')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "serveImage", null);
UserController = __decorate([
    (0, common_1.Controller)('user'),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UserController);
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map