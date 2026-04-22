export interface UserInfo {
  ucid: string; // 唯一标识，不存在则认定当前用户信息获取失败
  account: string; // 如 wangwenjian012
  displayName: string; // 如 王文健
  phone?: string; // 手机号
  email?: string; // 邮箱
  userCode?: string; // 系统号
  avatar?: string; // 头像，可能为空
  orgCode?: string; // 组织代码
  orgName?: string; // 组织名称
}
declare module 'express' {
  interface Request {
    userInfo?: UserInfo; // 扩展 Request 类型，添加 userInfo 属性，添加到请求request的对象中
    userId?: string;
    sessionId?: string;
    sessionToken?: string;
    invalidSession?: boolean;
  }
}
