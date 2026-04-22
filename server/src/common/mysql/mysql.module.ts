import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { mysqlConfig, env } from '@/config';
import { User } from '@/entities/user.entity';
import { Comment } from '@/entities/comment.entity';
import { UserSession } from '@/entities/user-session.entity';
import { AgentMessage } from '@/entities/agent-message.entity';
import * as path from 'path';

@Global() // 标记为全局模块
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const { host, port, username, password, database } = mysqlConfig;
        return {
          type: 'mysql',
          host,
          port,
          username,
          password,
          database,
          // nest自动生成执行的sql语句自动执行总是有点小问题，暂不用，手动修改创建表
          // synchronize: env === 'development', // 同步表结构到数据库，注意只在开发环境下同步到测试数据库
          entities: [
            path.join(__dirname, '../../entities/**/*.entity{.ts,.js}'),
          ],
          // logging: true,
          // 添加连接池配置
          poolSize: 10, // 连接池大小
          connectTimeout: 60000, // 连接超时时间，60秒
          // 添加重连配置
          extra: {
            connectionLimit: 10,
            queueLimit: 0,
            enableKeepAlive: true,
            keepAliveInitialDelay: 10000, // 10秒
          },
          // 自动重连
          retryAttempts: 10, // 重试次数
          retryDelay: 3000, // 重试间隔，3秒
        };
      },
    }),
    // 引入所有的表结构实例，全局引入，所有路由中都可直接调用
    TypeOrmModule.forFeature([
      User,
      Comment,
      UserSession,
      AgentMessage,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class MysqlModule {}
