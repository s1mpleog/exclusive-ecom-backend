import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICart extends Document {
	products: Array<any>;
	quantity: number;
	user: Schema.Types.ObjectId;
	totalAmount: number;
}

const cartSchema = new Schema<ICart>(
	{
		products: [
			{
				type: Schema.Types.ObjectId,
				ref: "Products",
			},
		],

		user: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},

		quantity: {
			type: Number,
			default: 1,
			max: [10, "you can only add maximum 10 quantity"],
		},

		totalAmount: {
			type: Number,
			default: 0,
		},
	},
	{ timestamps: true }
);

const cartModel: Model<ICart> = mongoose.model("Cart", cartSchema);
export default cartModel;
