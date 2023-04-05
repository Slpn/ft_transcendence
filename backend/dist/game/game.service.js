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
exports.GameService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const game_entity_1 = require("./game.entity");
const jwt_1 = require("@nestjs/jwt");
let GameService = class GameService {
    constructor(gameRepository, jwtService) {
        this.gameRepository = gameRepository;
        this.jwtService = jwtService;
    }
    async getGameRepo() {
        return this.gameRepository.find();
    }
    async getMyGameRepo(id) {
        return this.gameRepository.find({ where: { Player1: id } });
    }
    async add_games(Player1, Player2, score1, score2, hardcore) {
        const newGame = new game_entity_1.Game();
        newGame.Player1 = Player1;
        newGame.Player2 = Player2;
        newGame.score1 = score1;
        newGame.score2 = score2;
        newGame.hardcore = hardcore;
        return this.gameRepository.save(newGame);
    }
};
GameService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(game_entity_1.Game)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService])
], GameService);
exports.GameService = GameService;
//# sourceMappingURL=game.service.js.map