import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler";
import ErrorHandler from "../utils/errorHandler";
import userModel from "../models/user.model";

const verifyJWT = asyncHandler(async (req, res, next) => {
	const access_token = req.cookies["access_token"];

	if (!access_token) {
		return next(new ErrorHandler("Unauthorized Request", 401));
	}

	const decodedToken = jwt.verify(
		access_token,
		process.env.ACCESS_TOKEN_SECRET as Secret
	) as JwtPayload;

	if (!decodedToken.id) {
		return next(new ErrorHandler("Invalid Token", 401));
	}

	const user = await userModel.findById(decodedToken.id);

	if (!user) {
		return next(new ErrorHandler("User not found", 404));
	}

	req.user = user._id;

	next();
});

export default verifyJWT;
