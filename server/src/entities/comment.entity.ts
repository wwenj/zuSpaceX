import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./user.entity";

@Entity("comment")
export class Comment {
  @PrimaryColumn({ length: 32 })
  id: string;

  @Column({ type: "text" })
  content: string;

  @Column({ name: "user_id", length: 32, default: "" })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ length: 20, default: "website" })
  type: string;

  @Column({ default: 0 })
  source: number;

  @CreateDateColumn({ name: "createdAt" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updatedAt" })
  updatedAt: Date;

  @Column({ name: "createdBy", length: 32, default: "" })
  createdBy: string;

  @Column({ name: "updatedBy", length: 32, default: "" })
  updatedBy: string;
}
