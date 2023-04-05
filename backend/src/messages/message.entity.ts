import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Message {
    @PrimaryGeneratedColumn()
    id: number

    @Column({nullable: false})
    sender: number;

    @Column({nullable: false})
    channel: number;

    @Column()
    contents:string;
}
