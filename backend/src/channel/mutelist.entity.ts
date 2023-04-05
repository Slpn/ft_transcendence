import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class MuteList {
    
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    user_id: number;

    @Column()
    channel_id: number;

    @Column('timestamp with time zone', {nullable: false, default: () => 'CURRENT_TIMESTAMP'})
    created: Date;

    @Column({default: 1})
    state: number = 1;
}
