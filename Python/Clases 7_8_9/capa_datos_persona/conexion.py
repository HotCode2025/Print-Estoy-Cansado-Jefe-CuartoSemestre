import sys
from psycopg2 import pool
from logger_base import log  # Asegurate de importar tu configurador de logs

class Conexion:
    _DATABASE = 'test_bd'
    _USERNAME = 'admin'
    _PASSWORD = '5432'
    _DB_PORT = '5432'
    _HOST = 'localhost'
    _MIN_CON = 1
    _MAX_CON = 5
    _pool = None

    @classmethod
    def obtenerPool(cls):
        if cls._pool is None:
            try:
                cls._pool = pool.SimpleConnectionPool(
                    cls._MIN_CON,
                    cls._MAX_CON,
                    host=cls._HOST,
                    user=cls._USERNAME,
                    password=cls._PASSWORD,
                    port=cls._DB_PORT,
                    database=cls._DATABASE  # Se agregó la coma previa
                )
                log.debug(f'Creación del pool exitosa: {cls._pool}')
                return cls._pool
            except Exception as e:
                log.error(f'Error al crear el pool: {e}')
                sys.exit()
        else:
            return cls._pool

@classmethod
def liberarConexion(cls, conexion):
    cls.obtenerPool().putconn(conexion)
    log.debug(f'Regresamos la conexión del pool: {conexion}')

@classmethod
def cerrarConexiones(cls):
    cls.obtenerPool().closeall()

if __name__ == '__main__':
    conexion1 = Conexion.obtenerConexion()
    Conexion.liberarConexion(conexion1)
    conexion2 = Conexion.obtenerConexion()
    Conexion.liberarConexion(conexion2)
    conexion3 = Conexion.obtenerConexion()
    Conexion.liberarConexion(conexion3)
    
