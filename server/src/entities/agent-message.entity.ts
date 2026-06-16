import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

export enum AgentMessageRole {
  USER = "user",
  ASSISTANT = "assistant",
}

@Entity("agent_message", { comment: "智能体消息表" })
@Index("idx_agent_message_user_time", ["userId", "createdAt", "id"])
export class AgentMessage {
  @PrimaryColumn({ length: 32, comment: "主键ID" })
  id: string;

  @Column({
    name: "user_id",
    length: 64,
    default: "",
    comment: "用户ID",
  })
  userId: string;

  @Column({
    length: 20,
    default: AgentMessageRole.USER,
    comment: "消息角色",
  })
  role: string;

  @Column({
    type: "longtext",
    comment: "消息内容",
  })
  content: string;

  @Column({
    length: 50,
    default: "author_clone",
    comment: "技能编码",
  })
  skill: string;

  @Column({
    length: 100,
    default: "",
    comment: "模型名称",
  })
  model: string;

  @Column({
    name: "input_token",
    default: 0,
    comment: "输入Token数",
  })
  inputToken: number;

  @Column({
    name: "output_token",
    default: 0,
    comment: "输出Token数",
  })
  outputToken: number;

  @CreateDateColumn({
    name: "createdAt",
    type: "datetime",
    comment: "创建时间",
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: "updatedAt",
    type: "datetime",
    comment: "修改时间",
  })
  updatedAt: Date;

  @Column({
    name: "createdBy",
    length: 64,
    default: "",
    comment: "创建人",
  })
  createdBy: string;

  @Column({
    name: "updatedBy",
    length: 64,
    default: "",
    comment: "修改人",
  })
  updatedBy: string;
}
