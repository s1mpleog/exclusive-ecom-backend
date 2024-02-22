class ErrorHandler extends Error {
	constructor(
		public message: any,
		public statusCode: Number
	) {
		super(message);
		this.statusCode = statusCode;

		Error.captureStackTrace(this, this.constructor);
	}
}

export default ErrorHandler;
