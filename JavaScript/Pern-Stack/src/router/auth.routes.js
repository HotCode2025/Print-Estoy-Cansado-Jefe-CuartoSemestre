import { Router } from "express";
import {signin, signout, signup, profile} from "../controllers/auth.controllers.js";

const router = Router();

router.post("/signin", signin);

router.post("/signup", signup);

router.post("/signout", signout);

router.get("/profile", profile);

export default router;