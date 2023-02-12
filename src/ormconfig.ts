import { DataSource } from 'typeorm'

export default new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "seifon",
    password: "",
    database: "auth-db",
    synchronize: true,
    logging: false,
    entities: [],
    subscribers: [],
    migrations: [],
})