import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
import { LiquidityPool, Token } from "../entities";
import { DBCreds } from "../config";
import { DataSource } from "typeorm";

export const DataSourceOptions: PostgresConnectionOptions = {
  type: "postgres",
  host: DBCreds.host,
  port: DBCreds.port,
  username: DBCreds.username,
  password: DBCreds.password,
  database: DBCreds.dbName,
  synchronize: false,
  logging: false,
  entities: [LiquidityPool, Token],
  migrations: [],
  subscribers: [],
  extra: { max: 30 },
};

export class AppDataSource {
  private static instance: DataSource;

  public static getInstance() {
    if (!this.instance) {
      this.instance = new DataSource(DataSourceOptions);
    }
    return this.instance;
  }
}

export const initDb = () => {
  const dsInstance = AppDataSource.getInstance();
  return dsInstance.initialize();
};
