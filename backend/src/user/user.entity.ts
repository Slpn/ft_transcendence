import { Entity, PrimaryGeneratedColumn, ManyToMany, Column, JoinTable } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique:true  })
  login: string;

  @Column({ unique:true })
  username: string;

  @Column({ unique:true })
  email: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ nullable: true })
  avatar42: string;

  @Column({ nullable: true })
  avatar: string;
  
  @Column({ nullable: true })
  twoFactorAuthenticationSecret?: string;

  @Column({ nullable: true })
  loginChallenge?: string;

  @Column({ default: 1})
  twoFactorAuthEnabled?: number = 1;

  @Column({ default: 0})
  xp: number = 0;

  @Column({ default: 0})
  gameWon: number = 0;

  @Column({ default: 0})
  gameLost: number = 0;

  @Column({ nullable: true })
  qrcode?: string;
}
