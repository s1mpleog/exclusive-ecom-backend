// helpers/productHelper.js
import productModel from "../models/product.model";
import ErrorHandler from "../utils/errorHandler";

export const updateProductStock = async (
	productId: string,
	quantity: number
): Promise<void> => {
	try {
		const product = await productModel.findById(productId);

		if (!product) {
			throw new ErrorHandler(`Product not found: ${productId}`, 404);
		}

		if (product.stock < quantity) {
			throw new ErrorHandler(
				`Insufficient stock for product: ${product.name}`,
				400
			);
		}

		// Update the stock for the product
		product.stock -= quantity;

		// Save the updated product information
		await product.save();
	} catch (error) {
		throw error;
	}
};
