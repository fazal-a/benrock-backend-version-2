import process from "process";
import DataSource from "./databaseLocal";

export default process.env.NODE_ENV === "dev"
    ? DataSource
    : DataSource;