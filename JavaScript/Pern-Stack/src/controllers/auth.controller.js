import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";
import { SECRET } from "../config.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  maxAge: 24 * 60 * 60 * 1000,
};

const crearToken = (id) => jwt.sign({ id }, SECRET, { expiresIn: "1d" });

export const signup = async (req, res, next) => {
  try {
    const { nombre, email, password } = req.body;
    if (!nombre || !nombre.trim() || !email || !email.trim() || !password) {
      return res.status(400).json({ message: "Nombre, email y password son requeridos" });
    }
    const existe = await pool.query("SELECT id FROM users WHERE email = $1", [email.trim()]);
    if (existe.rowCount > 0) {
      return res.status(400).json({ message: "El email ya está registrado" });
    }
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (nombre, email, password) VALUES ($1, $2, $3) RETURNING id, nombre, email",
      [nombre.trim(), email.trim(), hash]
    );
    const user = result.rows[0];
    res.cookie("token", crearToken(user.id), COOKIE_OPTIONS);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

export const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !email.trim() || !password) {
      return res.status(400).json({ message: "Email y password son requeridos" });
    }
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email.trim()]);
    if (result.rowCount === 0) {
      return res.status(400).json({ message: "Credenciales inválidas" });
    }
    const user = result.rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(400).json({ message: "Credenciales inválidas" });
    }
    res.cookie("token", crearToken(user.id), COOKIE_OPTIONS);
    res.json({ id: user.id, nombre: user.nombre, email: user.email });
  } catch (err) {
    next(err);
  }
};

export const signout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Sesión cerrada" });
};

export const profile = async (req, res, next) => {
  try {
    const result = await pool.query("SELECT id, nombre, email FROM users WHERE id = $1", [
      req.userId,
    ]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};
