import jwt from "jsonwebtoken";
import { SECRET } from "../config.js";

export const requiereAuth = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ message: "No autorizado" });
  }
  try {
    const decoded = jwt.verify(token, SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ message: "No autorizado" });
  }
};
