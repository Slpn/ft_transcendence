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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const user_service_1 = require("../user/user.service");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
const axios_1 = require("axios");
const crypto = require("crypto");
let AuthController = class AuthController {
    constructor(authService, userService) {
        this.authService = authService;
        this.userService = userService;
    }
    async signin(req, res) {
        let user = await this.authService.validateUser(req.body.username, req.body.password);
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        if (user != null) {
            if (user.twoFactorAuthEnabled == 1) {
                const loginChallenge = crypto.randomUUID();
                user = await this.userService.setLoginChallenge(loginChallenge, user.id);
                res.json({ state: "success", loginChallenge: loginChallenge });
            }
            else {
                const token = await this.authService.signin(user);
                res.cookie('Auth', token);
            }
        }
        else {
            res.json({ state: 'failure', message: "Wrong login or password" });
        }
    }
    async signin42(query, res) {
        const code = query.code;
        const token = await this.authService.get_42access_token(code);
        const user_data = await axios_1.default.get('https://api.intra.42.fr/v2/me?access_token=' + token, { headers: { 'Content-type': 'application/json' } });
        await this.authService.check42User(user_data.data.login, user_data.data.login, user_data.data.email, user_data.data.image.link);
        let user = await this.userService.getUserByLogin(user_data.data.login);
        if (user.twoFactorAuthEnabled == 1) {
            const loginChallenge = crypto.randomUUID();
            user = await this.userService.setLoginChallenge(loginChallenge, user.id);
            return res.redirect('http://localhost:3000/user/2faSignin?loginchallenge=' + loginChallenge);
        }
        const jwtToken = await this.authService.signin(user);
        res.cookie('Auth', jwtToken);
        return res.redirect('http://localhost:3000/home');
    }
    async getQrcode(req) {
        const loginchallenge = req.body.loginchallenge;
        let user = await this.userService.getUserByLoginChallenge(loginchallenge);
        if (!user)
            throw new common_2.UnauthorizedException();
        if (user.qrcode)
            return null;
        const tfaObject = await this.authService.generateTwoFactorAuthenticationSecret(user);
        user = await this.userService.setTwoFactorAuthenticationSecret(tfaObject.secret, user.id);
        const qrcode = await this.authService.generateQrCodeDataURL(tfaObject.otpauthUrl);
        if (qrcode)
            await this.userService.addQrcode(qrcode, user.id);
        return qrcode;
    }
    async verifytwoFactorCode(req, res) {
        const code = req.body.code;
        const user = await this.userService.getUserByLoginChallenge(req.body.loginchallenge);
        const ret = await this.authService.isTwoFactorAuthenticationCodeValid(code, user);
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        if (ret) {
            const jwtToken = await this.authService.signin(user);
            res.cookie('Auth', jwtToken);
            return res.json({ message: "success" });
        }
        else {
            return res.json({ message: "failure" });
        }
    }
    getProfile(req) {
        return JSON.stringify(req.user);
    }
};
__decorate([
    (0, common_2.Post)('/signin'),
    __param(0, (0, common_2.Request)()),
    __param(1, (0, common_2.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signin", null);
__decorate([
    (0, common_2.Get)('/signin42'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_2.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signin42", null);
__decorate([
    (0, common_2.Post)('/qrcode'),
    __param(0, (0, common_2.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getQrcode", null);
__decorate([
    (0, common_2.Post)('/verifyTwoFactorCode'),
    __param(0, (0, common_2.Request)()),
    __param(1, (0, common_2.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifytwoFactorCode", null);
__decorate([
    (0, common_2.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_2.Get)('/profile'),
    __param(0, (0, common_2.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getProfile", null);
AuthController = __decorate([
    (0, common_2.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        user_service_1.UserService])
], AuthController);
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map