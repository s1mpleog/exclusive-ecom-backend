import { Response } from "express";
import { IUserDocument } from "../models/user.model";
import { ICookieOptions } from "../types/types";

export const accessTokenExpires = parseInt(
	process.env.ACCESS_TOKEN_EXPIRES! || "900" || "10"
);

export const refreshTokenExpires = parseInt(
	process.env.REFRESH_TOKEN_EXPIRES! || "3600" || "10"
);

export const accessTokenOptions: ICookieOptions = {
	expires: new Date(Date.now() + accessTokenExpires * 60 * 60 * 1000),
	httpOnly: true,
	sameSite: "strict",
	maxAge: accessTokenExpires * 60 * 60 * 1000,
};

export const refreshTokenOptions: ICookieOptions = {
	expires: new Date(Date.now() + refreshTokenExpires * 24 * 60 * 60 * 1000),
	httpOnly: true,
	sameSite: "strict",
	maxAge: refreshTokenExpires * 24 * 60 * 60 * 1000,
};

const sendToken = async (
	user: IUserDocument,
	res: Response,
	statusCode: number
) => {
	const accessToken = user?.signAccessToken();
	const refreshToken = user?.signRefreshToken();

	res.cookie("access_token", accessToken, accessTokenOptions);
	res.cookie("refresh_token", refreshToken, refreshTokenOptions);

	res.status(statusCode).json({
		success: true,
		user,
		accessToken,
	});
};

export default sendToken;
