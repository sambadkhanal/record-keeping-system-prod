import { v2 as cloudinary } from "cloudinary";
import "dotenv/config";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "record-keeping-system-profile_pic", // Folder where files will be saved in cloudinary
        resource_type: "auto",
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );

    uploadStream.end(buffer);
  });
};

export const deleteFromCloudinary = async (public_id, options = {}) => {
  try {
    if (!public_id) throw new Error("public_id is required");

    const result = await cloudinary.uploader.destroy(public_id, {
      resource_type: options.resource_type || "image",
    });

    return result;
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw error;
  }
};

export const deleteManyFromCloudinary = async (
  publicIds = [],
  options = {},
) => {
  try {
    if (!publicIds.length) {
      throw new Error("No public_ids provided for deletion");
    }

    const result = await cloudinary.api.delete_resources(publicIds, {
      resource_type: options.resource_type || "image",
    });

    return result;
  } catch (error) {
    console.error("Bulk delete Cloudinary error:", error);
    throw error;
  }
};

// How to use them

// Single upload
// if(!req.file){}
// const result = await uploadToCloudinary(req.file.buffer, {
//   resource_type: "raw",
// });

// Multiple upload
// if(!req.files || req.files.length === 0){}
// const results = await Promise.all(
//   req.files.map((file) =>
//     uploadToCloudinary(file.buffer, {
//       resource_type: "raw",
//     }),
//   ),
// );

// Single delete
// await cloudinary.uploader.destroy("cloudinary_public_id", {
//   resource_type: "raw", // "raw" "image" "auto" "video" by defaults its "image"
// });

// Multiple delete
// await deleteManyFromCloudinary(
//   ["docs/a1", "docs/a2"],
//   { resource_type: "raw" }
// );
