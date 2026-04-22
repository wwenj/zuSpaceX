// 自定义异常错误
export class CustomException extends Error {
  constructor(
    public readonly code: number, // 自定义错误码
    public readonly message: string, // 错误信息
    public readonly data: any, // 附带的数据，通常情况下错误请求不需要带数据
  ) {
    super(message);
    this.name = 'CustomException'; // 设置异常名称
  }
}
