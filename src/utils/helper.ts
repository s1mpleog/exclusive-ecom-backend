import { ICookieOptions } from "../types/types";

export const cookieOptions: ICookieOptions = {
	httpOnly: true,
	secure: process.env.NODE_ENV !== "development",
	sameSite: "lax",
	maxAge: 5 * 60 * 1000,
	expires: new Date(Date.now() + 5 * 60 * 1000),
};
