import { CustomException } from './custom.exception';

export function throwCustomException(
  code: number,
  message: string,
  data?: any,
): never {
  throw new CustomException(code, message, data);
}
