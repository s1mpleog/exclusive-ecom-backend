import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware";
import { isAdmin } from "../middlewares/admin.middleware";
import { upload } from "../middlewares/multer.middleware";
import {
	addProductReview,
	createProduct,
	deleteProduct,
	getAllProducts,
	getProductById,
	searchProduct,
	updateProduct,
} from "../controllers/product.controller";

const router = Router();

router
	.route("/create")
	.post(verifyJWT, isAdmin, upload.array("productImage", 6), createProduct);

router.route("/search").get(searchProduct);

router
	.route("/all")

	.get(verifyJWT, getAllProducts);

router.route("/review/:productId").put(verifyJWT, addProductReview);

router
	.route("/:productId")
	.get(getProductById)
	.put(verifyJWT, isAdmin, upload.array("productImage", 6), updateProduct)
	.delete(verifyJWT, isAdmin, deleteProduct);

export default router;
