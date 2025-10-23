import { Injectable } from '@nestjs/common';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { ConfigService } from '../config.services';


mongoose.set('debug', true);
@Injectable()
export class MongooseModuleConfig implements MongooseOptionsFactory {
  constructor(private configService: ConfigService) {}
  createMongooseOptions(): MongooseModuleOptions {
    return { uri: this.configService.mongoUri };
  }
}