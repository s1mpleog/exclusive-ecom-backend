import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware";
import { checkout, createOrder } from "../controllers/order.controller";

const router = Router();

router.route("/create").post(verifyJWT, createOrder);
router.route("/checkout").post(verifyJWT, checkout);

export default router;
