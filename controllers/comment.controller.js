import userModel from "../models/user.model";

const postComment = async (req, res) => {
	const _id = req.user;
	try {
		const user = await userModel.findById(_id);
		if (!user) {
			return res.status(401).json({
				message: "User not found",
				success: false
			})
		}
		const newComment = commentModel({
			userId: _id,
			comment
		})
		await newComment.save();
		return res.status(201).json({
			message: "Comment added successfully",
			success: true
		})
	} catch (error) {
		return res.status(500).json({
			message: "Error while adding comment",
			error: error.message,
			success: false
		})
	}
}

export { postComment };