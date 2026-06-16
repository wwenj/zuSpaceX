import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { Article } from '../../entities/article.entity';
import { UserModule } from '@/modules/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Article]), UserModule],
  controllers: [ArticleController],
  providers: [ArticleService],
  exports: [ArticleService],
})
export class ArticleModule {}
