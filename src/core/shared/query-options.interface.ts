export interface QueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  searchFields?: string[];
  sort?: string;
  order?: 'asc' | 'desc';
  [key: string]: any;
}

