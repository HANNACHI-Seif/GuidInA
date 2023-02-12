import express from "express";
import appDataSource from "./ormconfig"

//routes
(async() => {
    await appDataSource.initialize()
    
    const app = express()

    //midddleware
    app.use(express.json())

    //routes


})()