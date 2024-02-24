import userModel, { IUser } from "../models/user.model";
import { IUserRegisterBody } from "../types/types";
import sendActivationToken from "../utils/activationToken";
import asyncHandler from "../utils/asyncHandler";
import ErrorHandler from "../utils/errorHandler";
import { cookieOptions } from "../utils/helper";
import sendMail from "../utils/sendMail";
import jwt, { Secret } from "jsonwebtoken";
import sendToken, {
	accessTokenOptions,
	refreshTokenOptions,
} from "../utils/sendToken";
import { getUserById } from "../services/user.service";

export const registerUser = asyncHandler(async (req, res, next) => {
	const { firstName, lastName, email, password } =
		req.body as IUserRegisterBody;

	if (!email || !password || !firstName || !lastName) {
		return next(new ErrorHandler("Invalid Fields", 400));
	}

	if (
		[firstName, lastName, email, password].some(
			(field) => field.trim() === ""
		)
	) {
		return next(new ErrorHandler("Please provide all fields", 400));
	}

	const existingUser = await userModel.findOne({ email });

	if (existingUser) {
		return next(new ErrorHandler("Email already exists", 400));
	}

	const user = {
		email,
		firstName,
		lastName,
		password,
	};

	const activationToken = sendActivationToken(user);
	const activation_code = activationToken.activation_code;

	const { activation_token } = activationToken;

	const data = { user: { name: user.firstName }, activation_code };

	await sendMail({
		email: user.email,
		data,
		subject: "Activate Your Account",
		template: "activation-mail.ejs",
	});

	res.status(200)
		.cookie("activation_token", activation_token, cookieOptions)
		.json({
			success: true,
			message: `Please check ${user.email} to activate your account. enter your otp with in 5 minutes`,
		});
});

export const activateUser = asyncHandler(async (req, res, next) => {
	const activation_token = req.cookies["activation_token"];
	const { activation_code } = req.body;

	if (!activation_token) {
		return next(new ErrorHandler("OTP Expired", 400));
	}

	if (!activation_code) {
		return next(new ErrorHandler("Please provide OTP", 400));
	}

	const newUser: { user: IUser; activation_code: string } = jwt.verify(
		activation_token,
		process.env.ACTIVATION_TOKEN_SECRET as Secret
	) as { user: IUser; activation_code: string };

	if (newUser.activation_code !== activation_code) {
		return next(new ErrorHandler("Invalid OTP", 400));
	}

	const { firstName, lastName, email, password } = newUser.user;

	await userModel.create({
		firstName,
		lastName,
		email,
		password,
	});

	res.status(201).json({
		success: true,
		message: "User created OK",
	});
});

export const loginUser = asyncHandler(async (req, res, next) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return next(new ErrorHandler("Please provide email and password", 400));
	}

	const user = await userModel.findOne({ email }).select("+password");

	if (!user) {
		return next(new ErrorHandler("User does not exists", 404));
	}

	const isPasswordExists = await user.isPasswordCorrect(password);

	if (!isPasswordExists) {
		return next(new ErrorHandler("Invalid Password", 400));
	}

	sendToken(user, res, 200);
});

export const logoutUser = asyncHandler(async (Req, res, next) => {
	res.clearCookie("access_token", { maxAge: 1 });
	res.clearCookie("refresh_token", { maxAge: 1 }).json({
		success: true,
		message: "user logged out success",
	});
});

export const getLoggedInUser = asyncHandler(async (req, res, next) => {
	const id = req.user;

	await getUserById(id, res);
});

export const updateToken = asyncHandler(async (req, res, next) => {
	const userId = req.user;

	const user = await userModel.findById(userId).select("-refreshToken");

	if (!user) {
		return next(new ErrorHandler("User not found", 404));
	}

	sendToken(user, res, 200);
});
