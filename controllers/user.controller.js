import userModel from "../models/user.model.js";
import generateOTP from "../Utils/generateOTP.js";
import sendEmail from "../Utils/mailer.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import postModel from "../models/post.model.js";
import uploadOnCloudinary from "../Utils/Cloudinary.js";
dotenv.config();

const sendOtp = async (email, otp, purpose) => {
	await sendEmail.sendMail({
		to: email,
		subject: `otp for ${purpose}`,
		text: `otp send to your email for ${purpose} is ${otp}`,
	})
}

const userRegistration = async (req, res) => {

	const { username, email, password } = req.body;

	try {
		if (!username && !email && !password) {
			return res.status(400).json({
				message: "❌ all fileds are required!!!!",
				success: false
			})
		}

		const user = await userModel.findOne({ email });
		const userByUsername = await userModel.findOne({ username });

		if (user && user.isVerified) {
			return res.status(409).json({
				message: "✅ user already exist and verified!, Please Login",
				loginRequired: true,
				success: false
			})
		}

		if (user && userByUsername && !user.isVerified) {
			const otp = generateOTP();
			const otp_expiry = Date.now() + 2 * 60 * 1000;

			user.otp = otp;
			user.otp_expiry = otp_expiry;
			user.otpPurpose = "Verification";
			user.isVerified = false;

			await sendOtp(email, otp, "Verification")

			await user.save();

			return res.status(202).json({
				message: `❌ user found but not verified, otp for Verification is sent on your email Id, your otp is ${otp}`,
				success: true,
			})
		}

		if (userByUsername) {
			return res.status(409).json({
				message: "❌ username already taken, Please choose another",
				loginRequired: true,
				success: false
			})
		}

		const otp = generateOTP();
		const otp_expiry = Date.now() + 2 * 60 * 1000;

		const hashPass = await bcrypt.hash(password, 10);

		const newUser = new userModel({
			username,
			email,
			password: hashPass,
			otp,
			otp_expiry,
			otpPurpose: "Registration",
			isVerified: false
		});

		await sendOtp(email, otp, "Registration")

		await newUser.save();

		return res.status(201).json({
			message: `✅ otp send for Registration, your otp is ${otp}`,
			success: true,
		})

	} catch (error) {
		return res.status(500).json({
			message: `Error: ${error.message}`,
			success: false
		})
	}
}

const userLogin = async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(400).json({
			message: "all fields are required!!!",
			success: false
		})
	}

	try {
		const user = await userModel.findOne({ email });
		if (!user) {
			return res.status(404).json({
				message: "User not found, Please register first!!!",
				success: false
			})
		}

		const checkPass = await bcrypt.compare(password, user.password);

		if (!checkPass) {
			return res.status(401).json({
				message: `password not matched!!!`,
				success: false
			})
		}

		if (!user.isVerified) {
			const otp = generateOTP();
			const otp_expiry = Date.now() + 2 * 60 * 1000;

			user.otp = otp;
			user.otp_expiry = otp_expiry;
			user.otpPurpose = "Verification";
			user.isVerified = false

			await sendOtp(email, otp, "Verification")

			await user.save();

			return res.status(202).json({
				message: `user found but not verified otp send for Verification, your otp is ${otp}`,
				success: true,
			})
		}

		const otp = generateOTP();
		const otp_expiry = Date.now() + 2 * 60 * 1000;

		user.otp = otp;
		user.otp_expiry = otp_expiry;
		user.otpPurpose = "Login";

		await sendOtp(email, otp, "Login")

		await user.save();

		return res.status(202).json({
			message: `otp for Login, your otp is ${otp} valid for 10 min.`,
			success: true
		})

	} catch (error) {
		return res.status(500).json({
			message: `Error: ${error.message}`,
			success: false
		})
	}
}

const verifyOtp = async (req, res) => {
	const { email, otp } = req.body;
	try {
		const user = await userModel.findOne({ email });

		if (!user) {
			return res.status(404).json({
				message: "User not found, please register first!",
				success: false
			})
		}

		if (user.otp !== otp) {
			return res.status(401).json({
				message: "Invalid OTP",
				success: false
			})
		}

		if (Date.now() > user.otp_expiry) {
			return res.status(401).json({
				message: "OTP Expired",
				success: false
			})
		}

		const otpPurpose = user.otpPurpose;

		user.isVerified = true;
		user.otp = undefined;
		user.otp_expiry = undefined;
		user.otpPurpose = undefined;

		let token;
		if (otpPurpose === "Login") {
			token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });
		}

		await user.save();

		return res.status(200).json({
			message: `${otpPurpose} successful!`,
			success: true,
			loginRequired: otpPurpose === "Login" ? false : true,
			token: otpPurpose === "Login" ? token : undefined,
			user: otpPurpose === "Login" ? { _id: user._id, username: user.username, email: user.email, profilePicture: user.profilePicture } : undefined
		})

	} catch (error) {
		return res.status(500).json({
			message: `Error: ${error.message}`,
			success: false
		})
	}
}

const getUser = async (req, res) => {
	const { _id } = req.params;
	try {
		const user = await userModel.findById(_id);
		if (!user) {
			return res.status(404).json({
				message: `User not found!`,
				success: false
			})
		}
		const totalPost = await postModel.find({ userId: _id })
		const postLength = totalPost.length;

		return res.status(200).json({
			message: `user found successfully!`,
			success: true,
			data: {
				_id: user._id,
				username: user.username,
				email: user.email,
				profilePicture: user.profilePicture,
				bio: user.bio,
				isVerified: user.isVerified,
				followers: user.followers,
				following: user.following,
				postLength,
				totalPost
			},
		})
	} catch (error) {
		return res.status(500).json({
			message: `Error: ${error.message}`,
			success: false
		})
	}
}

const updateProfile = async (req, res) => {
	const { _id } = req.params;
	const { username, bio } = req.body;

	try {
		const user = await userModel.findById(_id);

		if (!user) {
			return res.status(404).json({
				message: `❌ user not found!`,
				success: false
			})
		}

		// let cloudinaryURL = null;

		if (req.file) {
			const allowed = ["image/png", "image/jpeg", "image/jpg"];

			if (!allowed.includes(req.file.mimetype)) {
				return res.status(400).json({
					message: "❌ Only jpg, jpeg, and png file types are allowed!",
					success: false
				})
			}
			const cloudinaryURL = await uploadOnCloudinary(req.file.path);

			if (!cloudinaryURL?.url) {
				return res.status(500).json({
					message: "❌ error while uploading image on cloudinary",
					success: false
				})
			}
			user.profilePicture = cloudinaryURL.url;
		}

		if (username) user.username = username;
		if (bio) user.bio = bio;
		await user.save();

		return res.status(200).json({
			message: `✅ profile updated successfully!`,
			success: true,
			data: user
		})

	} catch (error) {
		return res.status(500).json({
			message: `Error: ${error.message}`,
			success: false
		})
	}
}

export { userRegistration, userLogin, verifyOtp, getUser, updateProfile };
