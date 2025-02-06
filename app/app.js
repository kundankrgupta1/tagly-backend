import cors from "cors"
import express from "express";
import userRoutes from "../routes/user.route.js";
import postRoutes from "../routes/post.route.js";
const app = express();
app.use(cors());
app.use(express.json());
app.use(userRoutes)
app.use(postRoutes)
export default app;