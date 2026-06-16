import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

export enum UserRole {
  USER = 0,
  ADMIN = 1,
}

@Entity("user")
export class User {
  @PrimaryColumn({ length: 32 })
  id: string;

  @Column({ length: 8, default: "" })
  account: string;

  @Column({
    name: "password_hash",
    length: 255,
    default: "",
    select: false,
  })
  passwordHash: string;

  @Column({ length: 50, default: "匿名" })
  nickname: string;

  @Column({ length: 500, default: "" })
  intro: string;

  @Column({ default: "/media/avatars/avatar-01.png" })
  avatar: string;

  @Column({ name: "game_score", default: 0 })
  gameScore: number;

  @Column({ default: UserRole.USER, comment: "角色 1管理，0用户" })
  role: number;

  @CreateDateColumn({ name: "createdAt" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updatedAt" })
  updatedAt: Date;

  @Column({ name: "createdBy", length: 32, default: "" })
  createdBy: string;

  @Column({ name: "updatedBy", length: 32, default: "" })
  updatedBy: string;
}
