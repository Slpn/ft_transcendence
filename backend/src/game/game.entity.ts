import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Game {
    @PrimaryGeneratedColumn()
    id: number

    @Column({nullable: true})
    Player1: number;

    @Column({nullable: true})
    Player2: number;

	@Column({nullable: true})
	score1: number;

	@Column({nullable: true})
	score2: number;

    @Column({nullable: true})
    hardcore: boolean;
}
