import mongoose, { Schema, Document, Model, mongo } from "mongoose";
import validator from "validator";

export interface IOrder extends Document {
	shippingInfo: {
		streetAddress: string;
		apartment: string;
		city: string;
		phoneNumber: string;
		emailAddress: string;
		country: string;
	};

	products: Array<any>;

	user: Schema.Types.ObjectId;

	totalAmount: number;
	shippingFee: number;
	status: string;
}

const orderSchema = new Schema<IOrder>({
	shippingInfo: {
		streetAddress: {
			type: String,
			required: true,
			default: "",
		},
		apartment: {
			type: String,
			required: true,
		},
		city: {
			type: String,
			required: true,
		},
		phoneNumber: {
			type: String,
			required: true,
			// validate: validator.isMobilePhone,
		},
		country: {
			type: String,
			required: true,
		},
	},

	products: [
		{
			product: {
				type: Schema.Types.ObjectId,
				ref: "Products",
			},
			quantity: {
				type: Number,
				required: true,
			},
		},
	],
	user: {
		type: Schema.Types.ObjectId,
		ref: "User",
	},

	totalAmount: {
		type: Number,
		required: true,
	},

	shippingFee: {
		type: Number,
		required: true,
		default: 0,
	},

	status: {
		type: String,
		enum: [
			"PENDING",
			"SHIPPED",
			"OUT FOR DELIVERY",
			"DELIVERED",
			"RETURNED",
			"CANCELLED",
		],
		default: "PENDING",
	},
});

const orderModel: Model<IOrder> = mongoose.model("Order", orderSchema);

export default orderModel;
