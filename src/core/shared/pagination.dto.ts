import { PaginationMeta } from './response.dto';

export class Pagination {
  constructor(args: any = {}) {
    Object.assign(this, args);
  }

  count = 0;

  content = [];

  page?: number;

  limit?: number;

  totalPages?: number;

  toPaginationMeta(): PaginationMeta {
    return {
      currentPage: this.page || 1,
      totalPages: this.totalPages || 0,
      totalItems: this.count || 0,
      itemsPerPage: this.limit || 10,
      hasNextPage: (this.page || 1) < (this.totalPages || 0),
      hasPreviousPage: (this.page || 1) > 1
    };
  }
}
