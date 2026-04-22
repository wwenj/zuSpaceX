import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("article")
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, default: "" })
  author: string;

  @Column({ type: "simple-json", default: "[]" })
  tag: string[];

  @Column({ type: "longtext" })
  content: string;

  @Column({ default: 0 })
  contentCount: number;

  @Column({ length: 500, default: "" })
  briefContent: string;

  @Column({ length: 500, default: "" })
  image: string;

  @Column({ length: 200, default: "" })
  title: string;

  @Column({ default: false })
  isTop: boolean;

  @Column({ default: false })
  isHidden: boolean;

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;
}
