import { Request, Response, NextFunction } from "express";
import { ControllerType } from "../types/types";

const asyncHandler =
	(fn: ControllerType) =>
	(req: Request, res: Response, next: NextFunction) => {
		return Promise.resolve(fn(req, res, next)).catch(next);
	};

export default asyncHandler;
