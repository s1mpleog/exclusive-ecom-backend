import { Router } from "express";
import {
	activateUser,
	getLoggedInUser,
	loginUser,
	logoutUser,
	registerUser,
} from "../controllers/user.controller";
import verifyJWT from "../middlewares/auth.middleware";

const router = Router();

router.route("/register").post(registerUser);
router.route("/activate").post(activateUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/me").get(verifyJWT, getLoggedInUser);

export default router;
