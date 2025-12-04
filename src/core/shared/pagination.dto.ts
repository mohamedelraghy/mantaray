export class Pagination {
  constructor(args: any = {}) {
    Object.assign(this, args);
  }

  count = 0;

  content = [];
}
