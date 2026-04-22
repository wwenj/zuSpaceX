import { env } from "./env";

// TODO 你需要自己申请并替换自己的数据库连接信息
const config = {
  development: {
    host: "you.host",
    port: "you.port",
    username: "you.username",
    password: "you.password",
    database: "you.database",
  },
  test: {
    host: "you.host",
    port: "you.port",
    username: "you.username",
    password: "you.password",
    database: "you.database",
  },
  production: {
    host: "you.host",
    port: "you.port",
    username: "you.username",
    password: "you.password",
    database: "you.database",
  },
};

export default config[env];
