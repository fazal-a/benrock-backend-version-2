import {DataSource} from "typeorm";
import {DataSourceOptions} from "typeorm/data-source/DataSourceOptions";
import process from "process";

let connectionOptions: DataSourceOptions = {
    type: "postgres" as "postgres", // It could be mysql, mongo, etc
    host: process.env.HOST,
    port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT, 10) : undefined, // Convert to number
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
    synchronize: true, // if true, you don't really need migrations
    logging: true,
    entities: ["src/**/*.entity{.ts,.js}"], // where our entities reside
    migrations: ["src/database/migrations/*{.ts,.js}"], // where our migrations reside
};

export default new DataSource({
    ...connectionOptions,
});