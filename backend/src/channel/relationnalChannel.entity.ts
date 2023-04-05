import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class RelationnalChannel {
    
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    channel_id: number;

    @Column()
    user_id: number;

    @Column({nullable: true})
    owner: boolean;

    @Column({nullable: true})
    admin: boolean;
}
