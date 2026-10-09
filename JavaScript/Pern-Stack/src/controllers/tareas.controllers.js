import { pool } from "../db.js";

export const listarTareas = async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM tareas ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

export const listarTarea = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM tareas WHERE id = $1", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

export const crearTarea = async (req, res, next) => {
  try {
    const { titulo, descripcion } = req.body;
    if (!titulo || !titulo.trim()) {
      return res.status(400).json({ message: "El titulo es requerido" });
    }
    const result = await pool.query(
      "INSERT INTO tareas (titulo, descripcion) VALUES ($1, $2) RETURNING *",
      [titulo.trim(), descripcion ?? null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

export const actualizarTarea = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, completada } = req.body;
    const result = await pool.query(
      `UPDATE tareas
       SET titulo = COALESCE($1, titulo),
           descripcion = COALESCE($2, descripcion),
           completada = COALESCE($3, completada)
       WHERE id = $4 RETURNING *`,
      [titulo ?? null, descripcion ?? null, completada ?? null, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

export const eliminarTarea = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM tareas WHERE id = $1 RETURNING *", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
