import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware";
import {
	checkout,
	createOrder,
	getOrder,
} from "../controllers/order.controller";

const router = Router();

router.route("/create").post(verifyJWT, createOrder);
router.route("/checkout").post(verifyJWT, checkout);
router.route("/my-order").get(verifyJWT, getOrder);

export default router;
