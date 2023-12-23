import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import messageInterface from './mailtrap.interface';

export class MailService {
    private readonly transporter: Mail;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT),
            auth: {
                user: process.env.EMAIL_AUTH_USER,
                pass: process.env.EMAIL_AUTH_PASS,
            },
        });
    }

    async sendEmail(message: messageInterface): Promise<void> {
        await this.transporter.sendMail({
            to: message.to,
            from: process.env.EMAIL_FROM,
            subject: message.subject,
            html: message.html,
        });
    }
}

export default MailService;
