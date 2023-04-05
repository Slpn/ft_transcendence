import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class PrivateMessage {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    sender: number;

    @Column()
    receiver: number;

    @Column()
    content: string;

    // @Column()
    // member: number;
}
