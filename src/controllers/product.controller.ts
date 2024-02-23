import mongoose from "mongoose";
import productModel, { IReview } from "../models/product.model";
import {
	deleteFromCloudinary,
	uploadOnCloudinary,
} from "../services/cloudinary";
import { BaseQuery, IProductCreateRequest } from "../types/types";
import asyncHandler from "../utils/asyncHandler";
import ErrorHandler from "../utils/errorHandler";
import userModel from "../models/user.model";

export const createProduct = asyncHandler(async (req, res, next) => {
	const {
		brand,
		category,
		description,
		name,
		price,
		quantity,
		size,
		stock,
		offerPrice,
	} = req.body as IProductCreateRequest;

	if (
		!brand ||
		!category ||
		!description ||
		!name ||
		!quantity ||
		!stock ||
		!price
	) {
		return next(new ErrorHandler("All fields are required", 400));
	}

	const productData = {
		brand,
		category,
		description,
		name,
		price,
		quantity,
		stock,
	};

	const product = new productModel(productData);

	if (size) {
		product.sizes = size;
	}

	const images = req.files as Express.Multer.File[];

	if (images && images.length > 0) {
		const imageUploadPromises = images.map(async (image) => {
			const productImages = await uploadOnCloudinary(
				image.path,
				"products"
			);
			return {
				url: productImages.secure_url,
				public_id: productImages.public_id,
			};
		});

		const uploadedImages = await Promise.all(imageUploadPromises);

		product.images.push(...uploadedImages);
	}

	if (offerPrice) {
		product.offerPrice = parseInt(offerPrice);
	}

	await product.save();

	res.status(201).json({
		success: true,
		message: "Product created success",
		product,
	});
});

export const getAllProducts = asyncHandler(async (req, res, next) => {
	const products = await productModel.find({});

	return res.status(200).send({
		success: true,
		products,
	});
});

export const getProductById = asyncHandler(async (req, res, next) => {
	const productId = req.params.productId;

	console.log(productId);

	if (!productId) {
		return next(new ErrorHandler("Please provide product id", 400));
	}

	if (!mongoose.isValidObjectId(productId)) {
		return next(new ErrorHandler("Invalid ProductId", 400));
	}

	const product = await productModel.findById(productId);

	if (!product) {
		return next(new ErrorHandler("Product not found", 404));
	}

	res.status(200).json({
		success: true,
		product,
	});
});
export const updateProduct = asyncHandler(async (req, res, next) => {
	const {
		description,
		name,
		price,
		quantity,
		stock,
		offerPrice,
		brand,
		category,
		size,
	} = req.body as IProductCreateRequest;

	const { productId } = req.params;

	if (!mongoose.isValidObjectId(productId)) {
		return next(new ErrorHandler("Invalid ProductId", 400));
	}

	const product = await productModel.findById(productId);

	if (!product) {
		return next(new ErrorHandler("Product not found", 404));
	}

	if (description) product.description = description;
	if (name) product.name = name;
	if (price) product.price = price;
	if (offerPrice) product.offerPrice = Number(offerPrice);
	if (stock) product.stock = Number(stock);
	if (brand) product.brand = brand;
	if (category) product.category = category.toLowerCase();
	if (size) product.sizes = size;
	if (quantity) product.quantity = Number(quantity);

	const images = req.files as Express.Multer.File[];

	if (images && images.length > 0) {
		const imageUploadPromises = images.map(async (image) => {
			const productImages = await uploadOnCloudinary(
				image.path,
				"products"
			);
			return {
				url: productImages.secure_url,
				public_id: productImages.public_id,
			};
		});

		const uploadedImages = await Promise.all(imageUploadPromises);

		if (product.images && product.images.length > 0) {
			const deleteImagePromises = product.images.map(async (image) => {
				await deleteFromCloudinary(image.public_id);
			});

			await Promise.all(deleteImagePromises);
		}

		product.images = uploadedImages;
	}

	await product.save();

	return res.status(200).json({
		success: true,
		product,
	});
});

export const deleteProduct = asyncHandler(async (req, res, next) => {
	const { productId } = req.params;

	if (!productId) {
		return next(new ErrorHandler("Please provide product Id", 400));
	}

	if (!mongoose.isValidObjectId(productId)) {
		return next(new ErrorHandler("Invalid ProductId", 400));
	}

	const product = await productModel.findById(productId);

	if (!product) {
		return next(new ErrorHandler("Product not found", 404));
	}

	product.images.map(async (image) => {
		await deleteFromCloudinary(image.public_id);
	});

	await product?.deleteOne();

	res.status(200).json({
		success: true,
		message: "product deleted success",
	});
});

export const searchProduct = asyncHandler(async (req, res, next) => {
	const { search, category, price, sort } = req.query;

	const baseQuery: BaseQuery = {};

	if (search) {
		baseQuery.name = {
			$regex: search.toString(),
			$options: "i",
		};
	}

	if (price) {
		baseQuery.price = {
			$lte: Number(price),
		};
	}

	if (category) {
		baseQuery.category = category.toString();
	}

	try {
		const products = await productModel
			.find(baseQuery)
			.sort(sort && { price: sort === "asc" ? 1 : -1 });

		res.status(200).json({
			success: true,
			products,
		});
	} catch (error) {
		next(error);
	}
});

export const addProductReview = asyncHandler(async (req, res, next) => {
	const { productId } = req.params;
	const { rating, content } = req.body;

	if (!rating || !content) {
		return next(new ErrorHandler("Please provide all fields", 400));
	}

	if (!productId) {
		return next(new ErrorHandler("Product id not found", 404));
	}

	if (!mongoose.isValidObjectId(productId)) {
		return next(new ErrorHandler("Invalid ProductId", 400));
	}

	const product = await productModel.findById(productId);

	if (!product) {
		return next(new ErrorHandler("Product not found", 404));
	}

	const user = await userModel.findById(req.user);

	if (!user) {
		return next(new ErrorHandler("User not found", 404));
	}

	const isAlreadyReviewed = product.reviews.some(
		(review) => review.user.toString() === user._id.toString()
	);

	if (isAlreadyReviewed) {
		return next(new ErrorHandler("Your already reviewed", 400));
	}

	const numberRating = Number(rating);

	const newReview: IReview = {
		user: user._id,
		content,
		rating: numberRating,
		createdAt: new Date(),
	};

	const totalReviews = product.reviews.length;

	if (totalReviews === 0) {
	} else {
		const sumRatings = product.reviews.reduce(
			(sum, review) => sum + review.rating,
			0
		);
		product.averageRating = sumRatings / totalReviews;
	}

	product.reviews.push(newReview);

	await product.save();

	return res.status(201).json({
		success: true,
		message: "Review added success",
	});
});
