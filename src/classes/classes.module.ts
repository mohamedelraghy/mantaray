import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Class, classSchema } from './entities/class.entity';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Class.name, schema: classSchema }]),
  ],
  controllers: [ClassesController],
  providers: [ClassesService],
  exports: [ClassesService],
})
export class ClassesModule {}
