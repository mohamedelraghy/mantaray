
import { Document, Model, Types } from 'mongoose';

import {
  InvalidIdException,
  RecordExistsException,
  RecordNotFoundException,
} from '../exceptions';
import { Pagination } from '../shared/pagination.dto';
import { Populate } from '../interfaces/mongo-population.interface';
import { QueryOptions } from './query-options.interface';

export class BaseService<T> {
  constructor(protected model: Model<T & Document>) {}

  public toObjectId(id: string | Types.ObjectId): Types.ObjectId {
    if (!Types.ObjectId.isValid(id)) throw new InvalidIdException();

    return typeof id === 'string' ? new Types.ObjectId(id) : id;
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
      throw new RecordNotFoundException(this.model.modelName, id.toString());
    }

    return doc as unknown as T;
  }

  async create(model: any): Promise<T> {
    try {
      const doc = await this.model.create(model);
      return doc as T;
    } catch (err: any) {
      if (err.code === 11000) {
        const duplicateField = err.keyPattern ? Object.keys(err.keyPattern)[0] : undefined;
        const duplicateValue = err.keyValue ? err.keyValue[duplicateField || ''] : undefined;
        throw new RecordExistsException(this.model.modelName, duplicateField, duplicateValue);
      }
      throw err;
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
      throw new RecordNotFoundException(this.model.modelName, id.toString());
    }

    return doc as T;
  }

  async find(
    filter: any = {},
    projection: any = {},
    queryOptions?: QueryOptions,
  ): Promise<Pagination | T[]> {
    if (!queryOptions) {
      const docs = await this.model.find(filter, projection).exec();
      return docs as unknown[] as T[];
    }

    const {
      page = 1,
      limit = 10,
      search,
      searchFields = [],
      sort = 'createdAt',
      order = 'desc',
      ...dynamicFilters
    } = queryOptions;

    const query: any = { ...filter };

    if (search) {
      if (searchFields && searchFields.length > 0) {
        query.$or = searchFields.map((field) => ({
          [field]: { $regex: search, $options: 'i' },
        }));
      }
    }

    Object.keys(dynamicFilters).forEach((key) => {
      const value = dynamicFilters[key];

      if (value === undefined || value === null || value === '') {
        return;
      }

      if (key.toLowerCase().startsWith('min')) {
        const fieldName = key.replace(/^min/i, '').toLowerCase();
        query[fieldName] = { ...query[fieldName], $gte: Number(value) };
      } else if (key.toLowerCase().startsWith('max')) {
        const fieldName = key.replace(/^max/i, '').toLowerCase();
        query[fieldName] = { ...query[fieldName], $lte: Number(value) };
      } else if (!['page', 'limit', 'search', 'searchFields', 'sort', 'order'].includes(key)) {
        query[key] = value;
      }
    });

    const skip = (page - 1) * limit;
    const sortOrder = order === 'asc' ? 1 : -1;

    const [docs, total] = await Promise.all([
      this.model
        .find(query, projection)
        .sort({ [sort]: sortOrder })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.model.countDocuments(query).exec(),
    ]);

    return new Pagination({
      content: docs as unknown[] as T[],
      count: total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
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
      throw new RecordNotFoundException(this.model.modelName, id.toString());
    }

    return doc as T;
  }

  async remove(id: string | Types.ObjectId) {
    const doc = await this.model.findByIdAndDelete(this.toObjectId(id));
    if (!doc) {
      throw new RecordNotFoundException(this.model.modelName, id.toString());
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
