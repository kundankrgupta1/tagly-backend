import { Router } from "express";
import { createPost, getAllPosts, postDelete, updatePost, getSinglePost } from "../controllers/post.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const postRoutes = Router();

postRoutes.get("/", authMiddleware, getAllPosts)
postRoutes.get("/post/:postId", authMiddleware, getSinglePost);
postRoutes.post("/post", authMiddleware, upload.single("image"), createPost);
postRoutes.put("post/:postId", authMiddleware, updatePost);
postRoutes.delete("post/:postId", authMiddleware, postDelete);

export default postRoutes;