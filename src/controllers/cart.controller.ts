import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler";
import ErrorHandler from "../utils/errorHandler";
import productModel from "../models/product.model";
import cartModel from "../models/cart.model";

export const addToCart = asyncHandler(async (req, res, next) => {
	const { productId } = req.params;

	const userId = req.user;

	if (!productId) {
		return next(new ErrorHandler("Product Id not found", 404));
	}

	if (!mongoose.isValidObjectId(productId)) {
		return next(new ErrorHandler("Invalid ProductId", 400));
	}

	const product = await productModel.findById(productId);

	if (!product) {
		return next(new ErrorHandler("Product not found", 404));
	}

	const existingCartItem = await cartModel.findOne({
		user: userId,
		products: productId,
	});

	if (existingCartItem) {
		(existingCartItem.quantity += 1),
			(existingCartItem.totalAmount +=
				product.price * existingCartItem.quantity);
		await existingCartItem.save();
		res.status(200).json({
			success: true,
			message: "Cart updated successfully",
			updatedCart: existingCartItem,
		});
	} else {
		const newCart = await cartModel.create({
			products: productId,
			user: userId,
			totalAmount: product.price,
		});

		// const updatedCart = await cartModel
		// 	.findOne({ user: userId })
		// 	.populate("product");

		// const totalAmount = updatedCart!.products.reduce((total, product) => {
		// 	return total + product.price * product.quantity;
		// }, 0);

		res.status(201).json({
			success: true,
			message: "cart added success",
			newCart,
		});
	}
});

export const getCartItems = asyncHandler(async (req, res, next) => {
	const userId = req.user;

	const items = await cartModel.find({ user: userId }).populate({
		path: "products",
		select: "name price quantity",
	});

	return res.status(200).json({
		success: true,
		items,
	});
});

export const deleteFromCart = asyncHandler(async (req, res, next) => {
	const userId = req.user;

	const { productId } = req.params;

	if (!productId) {
		return next(new ErrorHandler("Product Id not found", 404));
	}

	if (!mongoose.isValidObjectId(productId)) {
		return next(new ErrorHandler("Invalid ProductId", 400));
	}

	const cartItem = await cartModel.findById(productId);

	if (!cartItem) {
		return next(new ErrorHandler("Cart item not found", 404));
	}

	console.log(cartItem.user.toString());
	console.log("RES_ID", userId.toString());

	// Make sure the cart item belongs to the user
	if (cartItem.user.toString().trim() !== userId.toString()) {
		return next(new ErrorHandler("Unauthorized", 401));
	}

	await cartModel.deleteOne({ _id: productId });

	return res.status(200).json({
		success: true,
		message: "Product deleted from cart",
	});
});
