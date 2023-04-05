import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Channel {
    
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    channel_name: string;

    @Column({nullable:true})
    password?: string;

    @Column({nullable: true})
    type: boolean; //1 -> private 0 -> public

    // @Column()
    // member: number;
}
