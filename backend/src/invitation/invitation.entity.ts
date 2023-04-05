import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Invitation {
    
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    sender: number;

    @Column()
    invited: number;

    @Column({ default: 0})
    accepted: number = 0;
}
