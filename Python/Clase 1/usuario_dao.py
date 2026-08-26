from conexion import CursorDelPool
from usuario import Usuario
from logger_base import logger


class UsuarioDao:
    _SELECCIONAR = "SELECT id_usuario, username, password FROM usuario ORDER BY id_usuario"
    _INSERTAR = "INSERT INTO usuario(username, password) VALUES(%s, %s)"
    _ACTUALIZAR = "UPDATE usuario SET username=%s, password=%s WHERE id_usuario=%s"
    _ELIMINAR = "DELETE FROM usuario WHERE id_usuario=%s"

    @classmethod
    def seleccionar(cls):
        """Obtiene todos los usuarios de la base de datos."""
        try:
            with CursorDelPool() as cursor:
                cursor.execute(cls._SELECCIONAR)
                registros = cursor.fetchall()
                usuarios = []
                for registro in registros:
                    usuario = Usuario(registro[0], registro[1], registro[2])
                    usuarios.append(usuario)
                return usuarios
        except Exception as e:
            logger.error(f"Error al seleccionar usuarios: {e}")
            raise

    @classmethod
    def insertar(cls, usuario):
        """Inserta un nuevo usuario en la base de datos."""
        try:
            with CursorDelPool() as cursor:
                valores = (usuario.username, usuario.password)
                cursor.execute(cls._INSERTAR, valores)
                logger.debug(f"Usuario insertado: {usuario}")
                return cursor.rowcount
        except Exception as e:
            logger.error(f"Error al insertar usuario: {e}")
            raise

    @classmethod
    def actualizar(cls, usuario):
        """Actualiza un usuario existente en la base de datos."""
        try:
            with CursorDelPool() as cursor:
                valores = (usuario.username, usuario.password, usuario.id_usuario)
                cursor.execute(cls._ACTUALIZAR, valores)
                logger.debug(f"Usuario actualizado: {usuario}")
                return cursor.rowcount
        except Exception as e:
            logger.error(f"Error al actualizar usuario: {e}")
            raise

    @classmethod
    def eliminar(cls, usuario):
        """Elimina un usuario de la base de datos."""
        try:
            with CursorDelPool() as cursor:
                valores = (usuario.id_usuario,)
                cursor.execute(cls._ELIMINAR, valores)
                logger.debug(f"Usuario eliminado: {usuario}")
                return cursor.rowcount
        except Exception as e:
            logger.error(f"Error al eliminar usuario: {e}")
            raise
