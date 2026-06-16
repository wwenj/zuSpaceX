import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("project")
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, default: "" })
  name: string;

  @Column({ length: 500, default: "" })
  description: string;

  @Column({ length: 200, default: "" })
  gitUrl: string;

  @Column({ default: 0 })
  stars: number;

  @Column({ length: 500, default: "" })
  cover: string;

  @Column({ length: 200, default: "" })
  demoUrl: string;

  @Column({ type: "simple-json", default: "[]" })
  tags: string[];

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;
}
