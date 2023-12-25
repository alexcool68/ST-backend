import express, { Application } from 'express';
import mongoose from 'mongoose';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import Controller from '@/utils/interfaces/controller.interface';
import Job from '@/utils/interfaces/job.interface';
import Logger from '@/utils/winston';
import ErrorMiddleware from '@/middlewares/error.middleware';
import morganMiddleware from '@/middlewares/morgan.middlewares';

class App {
    public express: Application;
    public port: number;

    constructor(controllers: Controller[], jobs: Job[], port: number) {
        this.express = express();
        this.port = port;

        this.initialiseDatabaseConnection();
        this.initialiseMiddleware();
        this.initialiseControllers(controllers);
        this.initialiseErrorHandling();

        this.showJobs(jobs);
    }

    private initialiseDatabaseConnection() {
        const { MONGO_METHOD, MONGO_USER, MONGO_PASSWORD, MONGO_PATH } = process.env;

        mongoose.connect(`${MONGO_METHOD}://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_PATH}`);
        mongoose.connection
            .on('open', () => Logger.debug(`Database connection: open`))
            .on('close', () => Logger.debug(`Database connection: close`))
            .on('disconnected', () => Logger.debug(`Database connection: disconnecting`))
            .on('disconnected', () => Logger.debug(`Database connection: disconnected`))
            .on('reconnected', () => Logger.debug(`Database connection: reconnected`))
            .on('fullsetup', () => Logger.debug(`Database connection: fullsetup`))
            .on('all', () => Logger.debug(`Database connection: all`))
            .on('error', (error) => Logger.debug(`MongoDB connection: error: ${error}`));
    }

    private initialiseMiddleware(): void {
        this.express.use(helmet());
        this.express.use(cors());
        this.express.use(morganMiddleware);
        this.express.use(express.json());
        this.express.use(express.urlencoded({ extended: false }));
        this.express.use(compression());
    }

    private initialiseControllers(controllers: Controller[]): void {
        controllers.forEach((controller: Controller) => {
            this.express.use('/api', controller.router);
        });
    }

    private initialiseErrorHandling(): void {
        this.express.use(ErrorMiddleware);
    }

    public showJobs(jobs: Job[]): void {
        Logger.debug(`Jobs : [${jobs.map((job) => job.name)}]`);
    }

    public listen(): void {
        this.express.listen(this.port, () => {
            Logger.debug(`Server is up and running on port : ${this.port}`);
        });
    }

    public close(): void {
        Logger.debug('Closing MongoDb connection.');
        mongoose.connection.close(false);
        Logger.debug('Closing application.');
        process.exit(1);
    }
}

export default App;
