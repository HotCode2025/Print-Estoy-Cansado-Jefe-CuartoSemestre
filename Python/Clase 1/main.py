"""
Laboratorio de Usuarios
Gestión de usuarios con PostgreSQL y Python
UML: laboratorio_usuarios
"""

from menu import menu
from logger_base import logger


if __name__ == "__main__":
    logger.info("Iniciando aplicación Laboratorio de Usuarios")
    try:
        menu()
    except KeyboardInterrupt:
        print("\n\n  Programa interrumpido por el usuario.")
        logger.warning("Programa interrumpido por KeyboardInterrupt")
    except Exception as e:
        print(f"\n  Error inesperado: {e}")
        logger.critical(f"Error inesperado: {e}", exc_info=True)
