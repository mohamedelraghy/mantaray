import { isEmpty } from 'lodash';
import { Document, Model, Types } from 'mongoose';

import {
  InvalidIdException,
  RecordExistsException,
  RecordNotFoundException,
} from '../exceptions';
import { Pagination } from '../shared/pagination.dto';
import {
  arrayToProjection,
  toPipelineStage,
} from '../utils/mongo.util';
import { Populate } from '../interfaces/mongo-population.interface';

export class BaseService<T> {
  constructor(protected model: Model<T & Document>) {}

  public toObjectId(id: string | Types.ObjectId): Types.ObjectId {
    if (!Types.ObjectId.isValid(id)) throw new InvalidIdException();

    return typeof id === 'string' ? new Types.ObjectId(id) : id;
  }

  public sort(aggregation: Record<string, any>[], sort: string, dir: string) {
    if (dir === 'asc') aggregation.push({ $sort: { [sort]: 1 } });
    else aggregation.push({ $sort: { [sort]: -1 } });
  }

  async updateById(
    id: string | Types.ObjectId,
    updates: any,
    projection = {},
  ): Promise<T> {
    const doc = await this.model.findByIdAndUpdate(
      this.toObjectId(id),
      updates,
      { new: true, projection },
    );
    if (!doc) {
      throw new RecordNotFoundException(this.model.modelName);
    }

    return doc as unknown as T;
  }

  public filter(
    aggregation: Record<string, any>[],
    filterBy: Record<string, any>[],
  ) {
    const matchQry: Record<string, any>[] = [];
    for (const filter of filterBy) {
      if (!isEmpty(filter)) matchQry.push(toPipelineStage(filter));
    }

    if (matchQry.length) aggregation.push({ $match: { $and: matchQry } });
  }

  public project(
    aggregation: Record<string, any>[],
    attributes: string[],
  ): void {
    aggregation.push({ $project: arrayToProjection(attributes) });
  }

  public paginate(
    aggregation: Record<string, any>[],
    offset: number,
    size: number,
  ): void {
    aggregation.push({ $skip: offset }, { $limit: size });
  }

  public async exists(filter: Record<string, any>) {
    return await this.model.exists(filter);
  }

  public async count(filter: Record<string, any>): Promise<number> {
    return await this.model.countDocuments(filter);
  }

  async create(model: any): Promise<T> {
    try {
      const doc = await this.model.create(model);
      return doc as T;
    } catch (err) {
      if (err.code === 11000) {
        throw new RecordExistsException(this.model.modelName);
      }
      throw err;
    }
  }

  async bulkWrite(writes: Array<any>): Promise<any> {
    if (writes.length) {
      return await this.model.bulkWrite(writes);
    }
  }

  async findOne(filter: any, projection: any = {}): Promise<T> {
    const doc = await this.model.findOne(filter, projection).exec();

    return doc as T;
  }

  async findOneAndErr(filter: any, projection: any = {}): Promise<T> {
    const doc = await this.model.findOne(filter, projection).exec();
    if (!doc) {
      throw new RecordNotFoundException(this.model.modelName);
    }

    return doc as T;
  }

  async findOneById(
    id: string | Types.ObjectId,
    projection: any = {},
  ): Promise<T> {
    const doc = await this.model
      .findById(this.toObjectId(id), projection)
      .exec();
    if (!doc) {
      throw new RecordNotFoundException(this.model.modelName);
    }

    return doc as T;
  }

  async find(filter: any = {}, projection: any = {}): Promise<T[]> {
    const docs = await this.model.find(filter, projection).exec();
    return docs as unknown[] as T[];
  }

  async update(
    id: string | Types.ObjectId,
    updates: any,
    projection = {},
  ): Promise<T> {
    const doc = await this.model.findByIdAndUpdate(
      this.toObjectId(id),
      updates,
      {
        new: true,
        projection,
      },
    );
    if (!doc) {
      throw new RecordNotFoundException(this.model.modelName);
    }

    return doc as T;
  }

  async remove(id: string | Types.ObjectId) {
    const doc = await this.model.findByIdAndDelete(this.toObjectId(id));
    if (!doc) {
      throw new RecordNotFoundException(this.model.modelName);
    }

    return true;
  }
  async removeAll(filter: any) {
    const doc = await this.model.deleteMany(filter);
    if (!doc) {
      throw new RecordNotFoundException(this.model.modelName);
    }

    return true;
  }

  async removeOne(filter: any) {
    const doc = await this.model.findOneAndDelete(filter);
    if (!doc) {
      throw new RecordNotFoundException(this.model.modelName);
    }

    return true;
  }

  async aggregate(
    aggregation: any[],
    offset: number,
    size: number,
  ): Promise<Pagination> {
    aggregation.push(
      {
        $group: {
          _id: null,
          content: { $push: '$$ROOT' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          content: { $slice: ['$content', offset, size] },
          count: 1,
          _id: 0,
        },
      },
    );

    const data = await this.model.aggregate(aggregation);
    return new Pagination(data[0]);
  }

  async aggregateOne(aggregation: any[]): Promise<T> {
    const data = await this.model.aggregate(aggregation);
    return data[0] as unknown as T;
  }

  async populatePipeline(aggregation, populateParams: Populate) {
    const { from, localField, foreignField, pipeline, as } = populateParams;

    aggregation.push({
      $lookup: {
        from,
        localField,
        foreignField,
        pipeline,
        as,
      },
    });
  }

  async unwind(aggregation, path, returnEmptyArray = true) {
    aggregation.push({
      $unwind: {
        path: `$${path}`,
        preserveNullAndEmptyArrays: returnEmptyArray,
      },
    });
  }
}
