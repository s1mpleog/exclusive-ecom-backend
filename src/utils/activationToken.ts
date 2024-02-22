import jwt, { Secret } from "jsonwebtoken";

const sendActivationToken = (user: any) => {
	const activation_code = Math.floor(1000 + Math.random() * 9000).toString();

	const activation_token = jwt.sign(
		{
			user,
			activation_code,
		},
		process.env.ACTIVATION_TOKEN_SECRET as Secret,
		{
			expiresIn: "5m",
		}
	);

	return { activation_code, activation_token };
};

export default sendActivationToken;
