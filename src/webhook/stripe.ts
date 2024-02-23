import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
	apiVersion: "2023-10-16",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SIGNING_SECRET;
const handleWebhookEvent = async (
	req: NextApiRequest,
	res: NextApiResponse
) => {
	const sig = req.headers["stripe-signature"] as string;

	if (!endpointSecret) {
		console.error(
			"Webhook Error: Stripe webhook signing secret is undefined"
		);
		return res
			.status(400)
			.send("Webhook Error: Stripe webhook signing secret is undefined");
	}

	let event;

	try {
		event = stripe.webhooks.constructEvent(
			req.body,
			sig,
			endpointSecret
		) as Stripe.Event;
	} catch (err: any) {
		console.error(`Webhook Error: ${err.message}`);
		return res.status(400).send(`Webhook Error: ${err.message}`);
	}

	console.log(`Received webhook event of type: ${event.type}`);

	switch (event.type) {
		case "checkout.session.completed":
			console.log("Checkout session completed");
			// Handle successful checkout
			break;
		case "payment_intent.succeeded":
			console.log("Payment intent succeeded");
			// Handle successful payment
			break;
		// Add more cases for other event types as needed

		default:
			console.log(`Unhandled event type: ${event.type}`);
	}

	res.status(200).send("Received");
};

// Wrapper function to adapt Next.js API route handler to Express middleware
const handleWebhookEventMiddleware = (req: any, res: any, next: any) => {
	// Call the original handler and handle promise rejection
	handleWebhookEvent(req, res).catch((error) => next(error));
};

export default handleWebhookEventMiddleware;
