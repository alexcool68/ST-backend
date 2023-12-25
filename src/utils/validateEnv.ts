import { cleanEnv, str, port, email, num } from 'envalid';

function validateEnv(): void {
    cleanEnv(process.env, {
        PORT: port({ default: 3000 }),
        NODE_ENV: str({
            choices: ['development', 'production'],
        }),
        MONGO_METHOD: str(),
        MONGO_PATH: str(),
        MONGO_USER: str(),
        MONGO_PASSWORD: str(),
        JWT_SECRET: str(),
        EMAIL_HOST: str(),
        EMAIL_PORT: port({ default: 2525 }),
        EMAIL_AUTH_USER: str(),
        EMAIL_AUTH_PASS: str(),
        EMAIL_FROM: email({ default: 'admin@localhost.com' }),
        EXPIRE_FORGOT_TOKEN: num({ default: 10 }),
        SENDMAIL: str({ default: 'no' }),
    });
}

export default validateEnv;
