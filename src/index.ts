import 'dotenv/config';
import 'module-alias/register';
import validateEnv from '@/utils/validateEnv';
import App from './app';
import UserController from '@/resources/user/user.controller';
import AuthController from '@/resources/auth/auth.controller';
import SystemController from '@/resources/system/system.controller';
import fetchStatsJob from '@/jobs/fetchStats.job';

validateEnv();

const constructors = [new AuthController(), new UserController(), new SystemController()];
const jobs = [new fetchStatsJob()];

// const app = new App(constructors, jobs, String(process.env.HOST), Number(process.env.PORT));
const app = new App(constructors, jobs, Number(process.env.PORT));

app.listen();

process.on('SIGINT', function () {
    app.close();
});
