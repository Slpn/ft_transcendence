import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Relationnal {
    @PrimaryGeneratedColumn()
    id: number

    @Column({nullable: false})
    user: number;

    @Column({nullable: false})
    friend: number;

}
