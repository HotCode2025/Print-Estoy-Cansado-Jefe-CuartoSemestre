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

export const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (result.rowCount === 0) {
      return res.status(400).json({ message: "El correo no esta registrado" });
    }

    const validPassword = await bcrypt.compare(password, result.rows[0].password);

    if (!validPassword) {
      return res.status(400).json({ message: "La contraseña es incorrecta" });
    }

    const token = await crearToken({ id: result.rows[0].id });
    console.log(result);

    res.cookie("token", token, {
      //httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 60 * 60 * 24 * 1000, // 1 day
    });

    return res.json(result.rows[0]);
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
