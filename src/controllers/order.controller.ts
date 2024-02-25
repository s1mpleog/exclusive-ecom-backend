import "dotenv/config";
import Stripe from "stripe";
import cartModel from "../models/cart.model";
import orderModel from "../models/order.model";
import userModel from "../models/user.model";
import { IOrderProcessType } from "../types/types";
import asyncHandler from "../utils/asyncHandler";
import { calculateTotalPrice } from "../utils/calculateTotalAmount";
import { updateProductStock } from "../utils/decreaseStock";
import ErrorHandler from "../utils/errorHandler";

export const createOrder = asyncHandler(async (req, res, next) => {
	const userId = req.user;

	const {
		apartment,
		city,
		country,
		emailAddress,
		phoneNumber,
		streetAddress,
	} = req.body as IOrderProcessType;

	if (
		[
			apartment,
			city,
			country,
			emailAddress,
			phoneNumber,
			streetAddress,
		].some((field) => field.trim() === "")
	) {
		return next(new ErrorHandler("Please provide all fields", 400));
	}

	const order = new orderModel();

	const user = await userModel.findById(userId);

	if (!user) {
		return next(new ErrorHandler("User not found", 400));
	}

	order.shippingInfo = {
		apartment: apartment,
		streetAddress,
		emailAddress,
		phoneNumber,
		city,
		country,
	};

	const cartItems = await cartModel
		.find({ user: userId })
		.populate("products");

	if (!cartItems || cartItems.length === 0) {
		return next(new ErrorHandler("Cart is empty", 400));
	}

	const totalAmount = calculateTotalPrice(cartItems);

	order.products = cartItems.map((cartItem) => ({
		product: cartItem.products.map((product) => product._id),
		quantity: cartItem.quantity,
	}));

	for (const cartItem of cartItems) {
		for (const product of cartItem.products) {
			await updateProductStock(product._id, cartItem.quantity);
		}
	}

	const shippingFee = 5;

	order.totalAmount = totalAmount;
	order.user = user._id;
	order.shippingFee = shippingFee;
	order.status = "PENDING";

	await order.save();

	// await cartModel.deleteMany({ user: userId });

	res.status(201).json({
		success: true,
		message: "Order placed successfully",
		order,
	});
});

export const getOrder = asyncHandler(async (req, res, next) => {
	const userId = req.user;

	const order = await orderModel
		.find({
			user: userId,
		})
		.populate("user");

	if (!order) {
		return next(new ErrorHandler("Order not found", 404));
	}

	res.status(200).json({
		success: true,
		order,
	});
});

export const checkout = asyncHandler(async (req, res, next) => {
	const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
		apiVersion: "2023-10-16",
	});

	const userId = req.user;

	const cart = await cartModel
		.find({
			user: userId,
		})
		.populate("products")
		.populate("products.product");

	if (!cart || cart.length === 0) {
		return next(new ErrorHandler("No orders found for the user", 404));
	}

	const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] =
		cart.flatMap((order) =>
			order.products.map((product) => ({
				price_data: {
					currency: "inr",
					product_data: {
						name: product.name,
					},
					unit_amount: product.offerPrice
						? product.offerPrice
						: product.price,
				},
				quantity: product.quantity,
			}))
		);

	const session = await stripe.checkout.sessions.create({
		payment_method_types: ["card"],
		line_items: line_items,
		mode: "payment",
		success_url: `http://localhost:5173/success`,
		cancel_url: `http://localhost:5173/cancel`,
	});

	res.json({ url: session.url });
});
