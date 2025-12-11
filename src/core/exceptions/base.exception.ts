export class BaseException extends Error {

  error: {
    code : string,
    details: string | Record<string, any> |Record<string, any>[]
  };
  code : number;

  constructor(message: string, error: { code: string, details: string | Record<string, any> | Record<string, any>[] }, code: number) {

    super(message);

    this.name = this.constructor.name;
    this.error = error;
    this.code = code;
  }
}