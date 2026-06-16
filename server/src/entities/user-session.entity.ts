import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity("user_session")
export class UserSession {
  @PrimaryColumn({ length: 32 })
  id: string;

  @Column({ name: "user_id", length: 32, default: "" })
  userId: string;

  @Column({ name: "token_hash", length: 64, default: "" })
  tokenHash: string;

  @Column({ name: "expireAt", type: "datetime" })
  expireAt: Date;

  @Column({ name: "client_ip", length: 64, default: "" })
  clientIp: string;

  @Column({ name: "user_agent", length: 500, default: "" })
  userAgent: string;

  @CreateDateColumn({ name: "createdAt" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updatedAt" })
  updatedAt: Date;

  @Column({ name: "createdBy", length: 32, default: "" })
  createdBy: string;

  @Column({ name: "updatedBy", length: 32, default: "" })
  updatedBy: string;
}
