import mongoose, { Schema, Model, Document } from "mongoose";

export interface IReview {
	user: Schema.Types.ObjectId;
	rating: number;
	content: string;
	createdAt: Date;
}

export interface IProducts extends Document {
	name: string;
	description: string;
	price: number;
	images: {
		url: string;
		public_id: string;
	}[];
	stock: number;
	quantity: number;
	offerPrice?: number;
	category: string;
	brand: string;
	averageRating?: number;
	sizes: string;
	reviews: IReview[];
}

const productSchema = new Schema<IProducts>(
	{
		name: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		brand: {
			type: String,
			required: true,
		},
		price: {
			type: Number,
			required: true,
		},
		offerPrice: {
			type: Number,
		},
		category: {
			type: String,
			required: true,
			trim: true,
			lowercase: true,
		},
		quantity: {
			type: Number,
			required: true,
			default: 1,
		},
		images: [
			{
				url: {
					type: String,
					required: true,
				},
				public_id: String,
			},
		],

		stock: {
			type: Number,
			required: true,
			default: 5,
		},

		sizes: {
			type: String,
			enum: ["xs", "s", "m", "l", "xl", "2xl"],
			default: "m",
		},

		averageRating: {
			type: Number,
			default: 0,
			required: false,
		},

		reviews: [
			{
				user: {
					type: Schema.Types.ObjectId,
					ref: "User",
					required: true,
				},
				rating: {
					type: Number,
					required: true,
					min: 1,
					max: [5, "max rating is only 5 star"],
				},
				content: {
					type: String,
					required: true,
				},
				createdAt: {
					type: Date,
					default: Date.now,
				},
			},
		],
	},
	{ timestamps: true }
);

const productModel: Model<IProducts> = mongoose.model(
	"Products",
	productSchema
);

export default productModel;
