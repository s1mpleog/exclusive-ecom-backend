import { Request, Response, NextFunction } from "express";

declare global {
	namespace Express {
		interface Request {
			user: string;
		}
	}
}

export type ControllerType = (
	req: Request,
	res: Response,
	next: NextFunction
) => Promise<void | Response<any, Record<string, any>>>;

export type IUserRegisterBody = {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
};

export type IMailOptions = {
	email: string;
	template: string;
	data: { [key: string]: any };
	subject: string;
};

export type ICookieOptions = {
	secure?: boolean;
	httpOnly: boolean;
	maxAge: number;
	sameSite: "lax" | "strict" | "none" | undefined;
	expires: Date;
};

export type IProductCreateRequest = {
	name: string;
	description: string;
	stock: number;
	price: number;
	size: string;
	quantity: number;
	brand: string;
	offerPrice?: string;
	category: string;
};

export interface BaseQuery {
	name?: {
		$regex: string;
		$options: string;
	};
	price?: {
		$lte: number;
	};
	category?: string;
}

export type IOrderProcessType = {
	streetAddress: string;
	phoneNumber: string;
	emailAddress: string;
	city: string;
	country: string;
	apartment: string;
};
