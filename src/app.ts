import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import errorMiddleware from "./middlewares/error.middleware";

const app = express();

app.use(express.json({ limit: "20mb" }));

app.use(cookieParser());

app.use(
	cors({
		origin: process.env.FRONTEND_URL,
		credentials: true,
	})
);

app.use(morgan("dev"));

// importing routes
import userRoute from "./routes/user.route";
import productRoute from "./routes/product.route";
import cartRoute from "./routes/cart.route";

// using routes
app.use("/api/v1/users", userRoute);
app.use("/api/v1/products", productRoute);
app.use("/api/v1/carts", cartRoute);

app.use(errorMiddleware);

export default app;
