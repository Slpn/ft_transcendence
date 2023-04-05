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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const typeorm_3 = require("typeorm");
const user_entity_1 = require("./user.entity");
const banlist_entity_1 = require("./banlist.entity");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
let UserService = class UserService {
    constructor(usersRepository, banlistRepository, jwtService) {
        this.usersRepository = usersRepository;
        this.banlistRepository = banlistRepository;
        this.jwtService = jwtService;
    }
    usersChannelMap(usersChannelMap) {
        throw new Error("Method not implemented.");
    }
    getUserById(id) {
        return this.usersRepository.findOneBy({ id });
    }
    async getUserByUsername(username) {
        return await this.usersRepository.findOne({
            where: [{ username: username }],
        });
    }
    async getUserByLogin(login) {
        return await this.usersRepository.findOne({
            where: [{ login: login }],
        });
    }
    async searchUser(user) {
        return await this.usersRepository.find({ where: { username: (0, typeorm_3.Like)(`${user}%`) } });
    }
    async getUserByEmail(email) {
        return await this.usersRepository.findOne({
            where: [{ email: email }],
        });
    }
    async getUserByLoginChallenge(login) {
        return await this.usersRepository.findOne({
            where: [{ loginChallenge: login }],
        });
    }
    async signup(login, username, password, email, avatar42) {
        const checkLogin = await this.usersRepository.findOne({ where: { login: login } });
        const checkUsername = await this.usersRepository.findOne({ where: { username: username } });
        const checkMail = await this.usersRepository.findOne({ where: { email: email } });
        if (checkLogin || checkUsername || checkMail) {
            return { state: false, message: "Loggin or email already used" };
        }
        const saltOrRounds = 10;
        const hashed_password = await bcrypt.hash(password, saltOrRounds);
        const newUser = await this.usersRepository.create({
            login,
            username,
            email,
            password: hashed_password,
            avatar42,
        });
        await this.usersRepository.save(newUser);
        return { state: true, message: "Account created" };
    }
    decodeJwtToken(token) {
        const decodedJwtAccessToken = this.jwtService.decode(token);
        return decodedJwtAccessToken;
    }
    async changeUsername(id, username) {
        const user = await this.getUserById(id);
        user.username = username;
        await this.usersRepository.save(user);
        return user;
    }
    async changeEmail(id, email) {
        const user = await this.getUserById(id);
        user.email = email;
        await this.usersRepository.save(user);
        return user;
    }
    async setTwoFactorAuthenticationSecret(secret, user_id) {
        const user = await this.getUserById(user_id);
        user.twoFactorAuthenticationSecret = secret;
        await this.usersRepository.save(user);
        return user;
    }
    async setLoginChallenge(loginChallenge, user_id) {
        const user = await this.getUserById(user_id);
        user.loginChallenge = loginChallenge;
        await this.usersRepository.save(user);
        return user;
    }
    async twoFactorSwitch(user_id) {
        const user = await this.getUserById(user_id);
        if (user.twoFactorAuthEnabled == 1) {
            user.twoFactorAuthEnabled = 0;
        }
        else {
            user.twoFactorAuthEnabled = 1;
        }
        await this.usersRepository.save(user);
        return user;
    }
    async blockUser(blocker, blocked) {
        const block = await this.banlistRepository.create({
            blocker: blocker,
            blocked: blocked
        });
        await this.banlistRepository.save(block);
        return (block);
    }
    async unblockUser(blocker, blocked) {
        const block = await this.banlistRepository.findOne({ where: { blocker: blocker, blocked: blocked } });
        this.banlistRepository.delete(block);
        return (block);
    }
    async getBlockByBothId(blocker, blocked) {
        const block = await this.banlistRepository.findOne({ where: { blocker: blocker, blocked: blocked } });
        return (block);
    }
    async saveUploadedFile(id, path) {
        const user = await this.getUserById(id);
        user.avatar = path;
        await this.usersRepository.save(user);
        return user;
    }
    async removeUploadedFile(id) {
        const user = await this.getUserById(id);
        user.avatar = "";
        await this.usersRepository.save(user);
        return user;
    }
    async addXp(id) {
        const user = await this.getUserById(id);
        if (user) {
            user.xp += 25;
            this.usersRepository.save(user);
        }
    }
    async addWin(id) {
        const user = await this.getUserById(id);
        if (user) {
            user.gameWon += 1;
            this.usersRepository.save(user);
        }
    }
    async addLoose(id) {
        const user = await this.getUserById(id);
        if (user) {
            user.gameLost += 1;
            this.usersRepository.save(user);
        }
    }
    async addQrcode(code, id) {
        const user = await this.usersRepository.findOneBy({ id });
        if (user) {
            user.qrcode = code;
            await this.usersRepository.save(user);
        }
    }
};
UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(banlist_entity_1.Blocklist)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService])
], UserService);
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map