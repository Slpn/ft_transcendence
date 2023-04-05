import { Entity, PrimaryGeneratedColumn, ManyToMany, Column, JoinTable } from 'typeorm';

@Entity()
export class Blocklist {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  blocker: number;

  @Column({ nullable: true })
  blocked: number;
}
