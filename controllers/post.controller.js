import postModel from "../models/post.model.js";
import userModel from "../models/user.model.js";
import uploadOnCloudinary from "../Utils/Cloudinary.js";

const createPost = async (req, res) => {
	const { _id } = req.user;
	const { image, location, caption } = req.body;

	try {
		const user = await userModel.findById(_id);
		if (!user) {
			return res.status(404).json({
				message: "User not found!!!, Login first!!!",
				success: false
			})
		}

		if (!location || !caption) {
			return res.status(400).json({
				message: "all fields are required",
				success: false
			})
		}

		const filePath = req.file?.path;

		if (!filePath) {
			return res.status(501).json({
				message: "File is required",
				success: false
			})
		}

		const cloudinaryURL = await uploadOnCloudinary(filePath)

		if (!cloudinaryURL?.url) {
			return res.status(501).json({
				message: "getting error while uploading",
				success: false
			})
		}

		const newPost = new postModel({
			userId: _id,
			image: cloudinaryURL.url,
			location,
			caption
		})

		await newPost.save();

		return res.status(200).json({
			message: "Post created successfully",
			success: true
		})
	} catch (error) {
		return res.status(500).json({
			message: "getting error, while creating the post. Please try again later",
			error: error.message,
			success: false
		})
	}
}

const getAllPosts = async (req, res) => {
	const { _id } = req.user;
	try {
		const user = await userModel.findById(_id).select("-password");
		if (!user) {
			return res.status(404).json({
				message: "user not found",
				success: false
			})
		}
		const allPost = await postModel.find().populate("userId", "_id username profilePicture");
		return res.status(201).json({
			message: "posts fetched success",
			success: true,
			allPost
		})

	} catch (error) {
		return res.status(502).json({
			message: `Error: ${error.message}`,
			success: false
		})
	}
}

const updatePost = async (req, res) => {
	const { _id } = req.user;
	const { postId } = req.params;
	const { image, location, caption } = req.body;

	try {
		const user = await userModel.findById(_id);
		if (!user) {
			return res.status(404).json({
				message: "User not found!!!, Login first!!!",
				success: false
			})
		}
		const post = await postModel.findById(postId);

		if (!post) {
			return res.status(404).json({
				message: "Post not found!!!",
				success: false
			})
		}

		post.image = image;
		post.location = location;
		post.caption = caption;
		post.updatedAt = Date.now();
		await post.save();

		return res.status(200).json({
			message: "Post updated successfully",
			success: true
		})

	} catch (error) {
		return res.status(500).json({
			message: "getting error, while updating the post. Please try again later",
			error: error.message,
			success: false
		})
	}
}

const postDelete = async (req, res) => {
	const { _id } = req.user;
	const { postId } = req.params;
	try {
		const user = await userModel.findById(_id);
		if (!user) {
			return res.status(404).json({
				message: "User not found!!!, Login first!!!",
				success: false
			})
		}

		const post = await postModel.findById(postId);
		if (!post) {
			return res.status(404).json({
				message: "Post not found!!!",
				success: false
			})
		}

		return res.status(200).json({
			message: "Post deleted successfully",
			success: true
		})

	} catch (error) {
		return res.status(500).json({
			message: "getting error, while deleting the post. Please try again later",
			error: error.message,
			success: false
		})
	}
}

const getSinglePost = async (req, res) => {
	const { postId } = req.params;
	const { _id } = req.user;
	try {
		const user = await userModel.findById(_id);
		if (!user) {
			return res.status(404).json({
				message: "User not found!!!, Login first!!!",
				success: false
			})
		}

		const post = await postModel.findById(postId);

		if (!post) {
			return res.status(404).json({
				message: "Post not found!!!",
				success: false
			})
		}

		return res.status(200).json({
			message: "Post found successfully",
			success: true,
			post
		})

	} catch (error) {
		return res.status(500).json({
			message: `getting error, while getting the post. Please try again later ${error.message}`,
			success: false
		})
	}
}

export { createPost, updatePost, postDelete, getAllPosts, getSinglePost };