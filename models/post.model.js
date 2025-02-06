import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true
		},
		image: {
			type: String,
			required: true
		},
		location: {
			type: String,
			required: true,
			trim: true
		},
		caption: {
			type: String,
			required: true,
			trim: true
		},
		likes: {
			type: Number,
			default: 0
		},
		comment: [
			{
				_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
				comment: { type: String, trim: true },
				createdAt: { type: Date, default: Date.now }
			}
		],

	}, { timestamps: true }
)

const postModel = mongoose.model("Post", postSchema);
export default postModel;