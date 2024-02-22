import mongoose, { Schema, Model, Document } from "mongoose";
import bcrypt from "bcryptjs";
import jwt, { Secret } from "jsonwebtoken";

export interface IUser extends Document {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	avatar: {
		url: string;
		public_id: string;
	};
	role: "user" | "admin";
	refreshToken: string;
}

const emailReg: RegExp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

export interface IUserDocument extends IUser {
	isPasswordCorrect: (password: string) => Promise<boolean>;
	signAccessToken: () => string;
	signRefreshToken: () => string;
}

const userSchema = new Schema<IUserDocument>({
	firstName: {
		type: String,
		required: true,
	},
	lastName: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
		validate: function (value: string) {
			emailReg.test(value);
		},
	},
	password: {
		type: String,
		required: true,
		minlength: [6, "Password should be at least 6 characters"],
		select: false,
	},
	avatar: {
		url: String,
		public_id: String,
	},
	role: {
		type: String,
		enum: ["user", "admin"],
		default: "user",
	},
	refreshToken: {
		type: String,
		select: false,
	},
});

userSchema.pre<IUserDocument>("save", async function (next) {
	if (!this.isModified("password")) return next();
	this.password = await bcrypt.hash(this.password, 10);
	next();
});

userSchema.methods.isPasswordCorrect = async function (
	password: string
): Promise<boolean> {
	return await bcrypt.compare(password, this.password);
};

userSchema.methods.signAccessToken = function () {
	return jwt.sign(
		{
			id: this._id,
		},
		process.env.ACCESS_TOKEN_SECRET as Secret,
		{
			expiresIn: "15m",
		}
	);
};

userSchema.methods.signRefreshToken = function () {
	const refreshToken = jwt.sign(
		{
			id: this._id,
		},
		process.env.REFRESH_TOKEN_SECRET as Secret,
		{
			expiresIn: "3d",
		}
	);
	this.refreshToken = refreshToken;
	return refreshToken;
};

const userModel: Model<IUserDocument> = mongoose.model("User", userSchema);
export default userModel;
