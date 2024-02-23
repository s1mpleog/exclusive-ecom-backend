import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware";
import {
	addToCart,
	deleteFromCart,
	getCartItems,
} from "../controllers/cart.controller";

const router = Router();

router.route("/add/:productId").post(verifyJWT, addToCart);
router.route("/all").get(verifyJWT, getCartItems);
router.route("/delete/:productId").delete(verifyJWT, deleteFromCart);

export default router;
