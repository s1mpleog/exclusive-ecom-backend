import mongoose from "mongoose";

const connectDB = async () => {
	try {
		await mongoose
			.connect(process.env.MONGODB_CLOUD_URI as string)
			.then((data) => {
				console.log(`DATABASE CONNECTED ON ${data.connection.host}`);
			});
	} catch (error) {
		console.error(`DATABASE CONNECTION FAILED REASON {error.message}`);
		process.exit(1);
	}
};

export default connectDB;
