import "dotenv/config";
import nodemailer, { Transporter } from "nodemailer";
import { IMailOptions } from "../types/types";
import ejs from "ejs";
import path from "path";

const sendMail = async (options: IMailOptions) => {
	const transporter: Transporter = nodemailer.createTransport({
		host: process.env.SMTP_HOST,
		port: Number(process.env.SMTP_PORT),
		service: process.env.SMTP_SERVICE,
		auth: {
			user: process.env.SMTP_MAIL,
			pass: process.env.SMTP_PASSWORD,
		},
	});

	const { email, data, subject } = options;

	const templatePath = path.join(__dirname, "../mails/activation-mail.ejs");

	const html: string = await ejs.renderFile(templatePath, data);

	const mailOptions = {
		from: process.env.SMTP_MAIL,
		to: email,
		subject,
		html,
	};

	await transporter.sendMail(mailOptions);
};

export default sendMail;
