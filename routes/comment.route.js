import { Router } from "express";
import { postComment } from "../controllers/Comment.controller";

const commentRoute = Router();

commentRoute.post("/comment", postComment);

export default commentRoute;