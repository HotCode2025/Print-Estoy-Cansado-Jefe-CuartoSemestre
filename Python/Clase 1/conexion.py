import psycopg2
from psycopg2 import pool
from logger_base import logger


class Conexion:
    _DATABASE = "laboratorio_usuarios"
    _USERNAME = "postgres"
    _PASSWORD = "admin"
    _DB_PORT = "5432"
    _HOST = "127.0.0.1"
    _MIN_CON = 1
    _MAX_CON = 5
    _pool = None

    @classmethod
    def obtenerPool(cls):
        """Obtiene o crea el pool de conexiones."""
        if cls._pool is None:
            try:
                cls._pool = pool.ThreadedConnectionPool(
                    cls._MIN_CON,
                    cls._MAX_CON,
                    host=cls._HOST,
                    port=cls._DB_PORT,
                    database=cls._DATABASE,
                    user=cls._USERNAME,
                    password=cls._PASSWORD
                )
                logger.info(f"Pool creado exitosamente: {cls._pool}")
            except psycopg2.Error as e:
                logger.error(f"Error al crear el pool de conexiones: {e}")
                raise
        return cls._pool

    @classmethod
    def obtenerConexion(cls):
        """Obtiene una conexión del pool."""
        conexion = cls.obtenerPool().getconn()
        logger.debug(f"Conexión obtenida del pool: {conexion}")
        return conexion

    @classmethod
    def liberarConexion(cls, conexion):
        """Devuelve una conexión al pool."""
        cls.obtenerPool().putconn(conexion)
        logger.debug(f"Conexión devuelta al pool: {conexion}")

    @classmethod
    def cerrarConexiones(cls):
        """Cierra todas las conexiones del pool."""
        if cls._pool is not None:
            cls._pool.closeall()
            logger.info("Todas las conexiones del pool han sido cerradas.")


class CursorDelPool:
    def __init__(self):
        self._conexion = None
        self._cursor = None

    def __enter__(self):
        logger.debug("Entrando al context manager CursorDelPool")
        self._conexion = Conexion.obtenerConexion()
        self._cursor = self._conexion.cursor()
        return self._cursor

    def __exit__(self, tipo_excepcion, valor_excepcion, traceback):
        logger.debug("Saliendo del context manager CursorDelPool")
        if valor_excepcion:
            self._conexion.rollback()
            logger.error(f"Ocurrió una excepción: {tipo_excepcion} {valor_excepcion} {traceback}")
        else:
            self._conexion.commit()
            logger.debug("Commit de la transacción")
        if self._cursor:
            self._cursor.close()
        Conexion.liberarConexion(self._conexion)
