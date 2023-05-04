import { IDBCreds } from "./types";

export const PORT = process.env.PORT || 3000;
export const AccessControlAllowOrigin = process.env.AccessControlAllowOrigin || "http://localhost:3001";

export const CASPERNET_PROVIDER_URL: string = process.env.CASPERNET_PROVIDER_URL || "http://85.114.132.133:7777/rpc";
export const PRIVATE_KEY: string = process.env.PRIVATE_KEY || "";
export const PUBLIC_KEY: string = process.env.PUBLIC_KEY || "";

export const DB: IDBCreds = {
  host: process.env.PHZ_FLDF_READ_DB_CONNECTION_HOST || "localhost",
  dbName: process.env.PHZ_FLDF_READ_DB_CONNECTION_DATABASE || "postgres",
  username: process.env.PHZ_FLDF_READ_DB_CONNECTION_USERNAME || "postgres",
  password: process.env.PHZ_FLDF_READ_DB_CONNECTION_PASSWORD || "postgres",
  port: process.env.PHZ_FLDF_READ_DB_CONNECTION_PORT ? Number(process.env.PHZ_FLDF_READ_DB_CONNECTION_PORT) : 5432,
};
