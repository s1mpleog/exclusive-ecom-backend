import "dotenv/config";
import app from "./app";
import connectDB from "./config/database";

const PORT = process.env.PORT || 5000;

connectDB()
	.then(() => {
		app.listen(PORT, () => {
			console.log(`SERVER IS RUNNING ON PORT ${PORT}`);
		});
	})
	.catch(() => {
		console.error(`DATABASE CONNECTION FAILED`);
	});
