import { Router } from "express";
import {signin, signout, signup, profile} from "../controllers/auth.controller.js";
import { requiereAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/signin", signin);

router.post("/signup", signup);

router.post("/signout", signout);

router.get("/profile", requiereAuth, profile);

export default router;