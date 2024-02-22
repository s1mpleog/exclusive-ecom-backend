import userModel from "../models/user.model";
import asyncHandler from "../utils/asyncHandler";
import ErrorHandler from "../utils/errorHandler";

export const isAdmin = asyncHandler(async (req, res, next) => {
	const userId = req.user;

	const isUserAdmin = await userModel.findById(userId);

	if (isUserAdmin?.role !== "admin") {
		return next(
			new ErrorHandler("You don't have permission for this action", 403)
		);
	}

	next();
});
