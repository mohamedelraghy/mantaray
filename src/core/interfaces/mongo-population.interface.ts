export interface Populate {
    from: string;
    localField: string;
    foreignField: string;
    pipeline: any[];
    as: string;
  }