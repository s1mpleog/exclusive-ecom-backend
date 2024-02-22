import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localPath: string, folder: string) => {
	try {
		const response = await cloudinary.uploader.upload(localPath, {
			resource_type: "image",
			upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
			folder,
		});
		fs.unlinkSync(localPath);
		return response;
	} catch (error) {
		fs.unlinkSync(localPath);
		console.error(`CLOUDINARY UPLOAD FAILED`);
		process.exit(1);
	}
};

const deleteFromCloudinary = async (public_id: string) => {
	try {
		const response = await cloudinary.uploader
			.destroy(public_id, {
				invalidate: true,
			})
			.then((result) => {
				console.log(`Deleted old image ${result}`);
			});
		return response;
	} catch (error) {
		console.error("Failed to delete image from cloudinary");
		process.exit(1);
	}
};

export { uploadOnCloudinary, deleteFromCloudinary };
