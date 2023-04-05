import { Controller, Get, Post, Body, Res, UseGuards, Request, Response, UseInterceptors, UploadedFile, ParseFilePipe, FileTypeValidator, MaxFileSizeValidator, Param } from '@nestjs/common';
import { GameService } from './game.service';
import { Game } from './game.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get('/history')
  @UseGuards(JwtAuthGuard)
  async history(@Request() req, @Res() res) : Promise<Game[]>{
	
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    const games = await this.gameService.getGameRepo();
    res.json(games);
    return (games);
  }

  @Get('/myHistory')
  @UseGuards(JwtAuthGuard)
  async myHistory(@Request() req, @Res() res) : Promise<Game[]>{
	
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    const games = await this.gameService.getGameRepo();
    res.json(games);
    return (games);
  }
}
