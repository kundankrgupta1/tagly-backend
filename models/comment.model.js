import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
	{
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true
	},
	comment: {
		type: String,
		required: true,
		trim: true
	}
}, { timestamps: true })

const commentModel = mongoose.model("Comment", commentSchema);
export default commentModel;