import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import bodyParser from "body-parser";
import errorMiddleware from "./middlewares/error.middleware";
import handleWebhookEvent from "./webhook/stripe"; // Import handleWebhookEvent

const app = express();

app.use(express.json({ limit: "20mb" }));
app.use(bodyParser.raw({ type: "application/json" }));

// Use handleWebhookEvent as the route handler
app.post("/webhook", handleWebhookEvent);

app.use(cookieParser());

app.use(
	cors({
		origin: process.env.FRONTEND_URL,
		credentials: true,
	})
);

app.use(morgan("dev"));

// Importing routes
import userRoute from "./routes/user.route";
import productRoute from "./routes/product.route";
import cartRoute from "./routes/cart.route";
import orderRoute from "./routes/order.route";

// Using routes
app.use("/api/v1/users", userRoute);
app.use("/api/v1/products", productRoute);
app.use("/api/v1/carts", cartRoute);
app.use("/api/v1/orders", orderRoute);

app.use(errorMiddleware);

export default app;
