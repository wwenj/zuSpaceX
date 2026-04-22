-- ============================================================
-- ZuSpaceX 数据库初始化脚本
-- 基于 server/src/entities/*.entity.ts 生成
-- MySQL 8.x
-- ============================================================

CREATE DATABASE IF NOT EXISTS zuspace DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE zuspace;

-- ------------------------------------------------------------
-- user
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user` (
  `id`            VARCHAR(32)   NOT NULL            COMMENT '主键ID',
  `account`       VARCHAR(8)    NOT NULL DEFAULT ''  COMMENT '账号',
  `password_hash` VARCHAR(255)  NOT NULL DEFAULT ''  COMMENT '密码哈希',
  `nickname`      VARCHAR(50)   NOT NULL DEFAULT '匿名' COMMENT '昵称',
  `intro`         VARCHAR(500)  NOT NULL DEFAULT ''  COMMENT '个人简介',
  `avatar`        VARCHAR(500)  NOT NULL DEFAULT ''  COMMENT '头像地址',
  `game_score`    INT           NOT NULL DEFAULT 0   COMMENT '游戏积分',
  `role`          TINYINT       NOT NULL DEFAULT 0   COMMENT '角色 1管理 0用户',
  `createdAt`     DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updatedAt`     DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  `createdBy`     VARCHAR(32)   NOT NULL DEFAULT ''  COMMENT '创建人',
  `updatedBy`     VARCHAR(32)   NOT NULL DEFAULT ''  COMMENT '更新人',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ------------------------------------------------------------
-- user_session
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_session` (
  `id`          VARCHAR(32)   NOT NULL            COMMENT '主键ID',
  `user_id`     VARCHAR(32)   NOT NULL DEFAULT ''  COMMENT '用户ID',
  `token_hash`  VARCHAR(64)   NOT NULL DEFAULT ''  COMMENT 'Token 哈希',
  `expireAt`    DATETIME      NOT NULL             COMMENT '过期时间',
  `client_ip`   VARCHAR(64)   NOT NULL DEFAULT ''  COMMENT '客户端IP',
  `user_agent`  VARCHAR(500)  NOT NULL DEFAULT ''  COMMENT 'User-Agent',
  `createdAt`   DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updatedAt`   DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  `createdBy`   VARCHAR(32)   NOT NULL DEFAULT ''  COMMENT '创建人',
  `updatedBy`   VARCHAR(32)   NOT NULL DEFAULT ''  COMMENT '更新人',
  PRIMARY KEY (`id`),
  KEY `idx_user_session_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户会话表';

-- ------------------------------------------------------------
-- article
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `article` (
  `id`           INT           NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `author`       VARCHAR(100)  NOT NULL DEFAULT ''    COMMENT '作者',
  `tag`          TEXT          NOT NULL               COMMENT '标签（JSON 数组）',
  `content`      LONGTEXT      NOT NULL               COMMENT '正文内容（Markdown）',
  `contentCount` INT           NOT NULL DEFAULT 0     COMMENT '正文字数',
  `briefContent` VARCHAR(500)  NOT NULL DEFAULT ''    COMMENT '摘要',
  `image`        VARCHAR(500)  NOT NULL DEFAULT ''    COMMENT '封面图',
  `title`        VARCHAR(200)  NOT NULL DEFAULT ''    COMMENT '标题',
  `isTop`        TINYINT(1)    NOT NULL DEFAULT 0     COMMENT '是否置顶',
  `isHidden`     TINYINT(1)    NOT NULL DEFAULT 0     COMMENT '是否隐藏',
  `createTime`   DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updateTime`   DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章表';

-- ------------------------------------------------------------
-- project
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `project` (
  `id`          INT           NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `name`        VARCHAR(100)  NOT NULL DEFAULT ''    COMMENT '项目名称',
  `description` VARCHAR(500)  NOT NULL DEFAULT ''    COMMENT '项目描述',
  `gitUrl`      VARCHAR(200)  NOT NULL DEFAULT ''    COMMENT 'Git 仓库地址',
  `stars`       INT           NOT NULL DEFAULT 0     COMMENT 'Star 数',
  `cover`       VARCHAR(500)  NOT NULL DEFAULT ''    COMMENT '封面图',
  `demoUrl`     VARCHAR(200)  NOT NULL DEFAULT ''    COMMENT 'Demo 地址',
  `tags`        TEXT          NOT NULL               COMMENT '技术标签（JSON 数组）',
  `createTime`  DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updateTime`  DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目表';

-- ------------------------------------------------------------
-- comment
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `comment` (
  `id`        VARCHAR(32)   NOT NULL            COMMENT '主键ID',
  `content`   TEXT          NOT NULL            COMMENT '评论内容',
  `user_id`   VARCHAR(32)   NOT NULL DEFAULT ''  COMMENT '用户ID',
  `type`      VARCHAR(20)   NOT NULL DEFAULT 'website' COMMENT '评论类型（website / article）',
  `source`    INT           NOT NULL DEFAULT 0   COMMENT '关联来源ID（文章ID等）',
  `createdAt` DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updatedAt` DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  `createdBy` VARCHAR(32)   NOT NULL DEFAULT ''  COMMENT '创建人',
  `updatedBy` VARCHAR(32)   NOT NULL DEFAULT ''  COMMENT '更新人',
  PRIMARY KEY (`id`),
  KEY `idx_comment_user_id` (`user_id`),
  CONSTRAINT `fk_comment_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评论表';

-- ------------------------------------------------------------
-- agent_message
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `agent_message` (
  `id`           VARCHAR(32)   NOT NULL              COMMENT '主键ID',
  `user_id`      VARCHAR(64)   NOT NULL DEFAULT ''    COMMENT '用户ID',
  `role`         VARCHAR(20)   NOT NULL DEFAULT 'user' COMMENT '消息角色（user / assistant）',
  `content`      LONGTEXT      NOT NULL               COMMENT '消息内容',
  `skill`        VARCHAR(50)   NOT NULL DEFAULT 'author_clone' COMMENT '技能编码',
  `model`        VARCHAR(100)  NOT NULL DEFAULT ''    COMMENT '模型名称',
  `input_token`  INT           NOT NULL DEFAULT 0     COMMENT '输入 Token 数',
  `output_token` INT           NOT NULL DEFAULT 0     COMMENT '输出 Token 数',
  `createdAt`    DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updatedAt`    DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  `createdBy`    VARCHAR(64)   NOT NULL DEFAULT ''    COMMENT '创建人',
  `updatedBy`    VARCHAR(64)   NOT NULL DEFAULT ''    COMMENT '更新人',
  PRIMARY KEY (`id`),
  KEY `idx_agent_message_user_time` (`user_id`, `createdAt`, `id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='智能体消息表';
