from usuario import Usuario
from usuario_dao import UsuarioDao
from conexion import Conexion
from logger_base import logger


def listar_usuarios():
    """Muestra todos los usuarios registrados."""
    try:
        usuarios = UsuarioDao.seleccionar()
        if not usuarios:
            print("\n  No hay usuarios registrados.\n")
            return
        print("\n  --- LISTA DE USUARIOS ---")
        for usuario in usuarios:
            print(f"  {usuario}")
        print()
    except Exception as e:
        print(f"\n  Error al listar usuarios: {e}\n")


def agregar_usuario():
    """Solicita datos y agrega un nuevo usuario."""
    try:
        username = input("  Username: ").strip()
        if not username:
            print("\n  El username no puede estar vacío.\n")
            return
        password = input("  Password: ").strip()
        if not password:
            print("\n  El password no puede estar vacío.\n")
            return

        usuario = Usuario(username=username, password=password)
        filas = UsuarioDao.insertar(usuario)
        print(f"\n  Usuario creado exitosamente ({filas} fila insertada).\n")
    except Exception as e:
        print(f"\n  Error al crear usuario: {e}\n")


def actualizar_usuario():
    """Solicita ID y nuevos datos para actualizar un usuario."""
    try:
        usuarios = UsuarioDao.seleccionar()
        if not usuarios:
            print("\n  No hay usuarios para actualizar.\n")
            return

        print("\n  --- USUARIOS DISPONIBLES ---")
        for usuario in usuarios:
            print(f"  {usuario}")

        id_usuario = int(input("\n  ID del usuario a actualizar: "))
        username = input("  Nuevo username: ").strip()
        if not username:
            print("\n  El username no puede estar vacío.\n")
            return
        password = input("  Nuevo password: ").strip()
        if not password:
            print("\n  El password no puede estar vacío.\n")
            return

        usuario = Usuario(id_usuario, username, password)
        filas = UsuarioDao.actualizar(usuario)
        if filas == 0:
            print(f"\n  No se encontró usuario con ID {id_usuario}.\n")
        else:
            print(f"\n  Usuario actualizado ({filas} fila modificada).\n")
    except ValueError:
        print("\n  Ingrese un número válido.\n")
    except Exception as e:
        print(f"\n  Error al actualizar usuario: {e}\n")


def eliminar_usuario():
    """Solicita ID y elimina un usuario."""
    try:
        usuarios = UsuarioDao.seleccionar()
        if not usuarios:
            print("\n  No hay usuarios para eliminar.\n")
            return

        print("\n  --- USUARIOS DISPONIBLES ---")
        for usuario in usuarios:
            print(f"  {usuario}")

        id_usuario = int(input("\n  ID del usuario a eliminar: "))
        usuario = Usuario(id_usuario=id_usuario)
        filas = UsuarioDao.eliminar(usuario)
        if filas == 0:
            print(f"\n  No se encontró usuario con ID {id_usuario}.\n")
        else:
            print(f"\n  Usuario eliminado ({filas} fila eliminada).\n")
    except ValueError:
        print("\n  Ingrese un número válido.\n")
    except Exception as e:
        print(f"\n  Error al eliminar usuario: {e}\n")


def menu():
    """Muestra el menú principal y procesa la opción del usuario."""
    print("=" * 50)
    print("  SISTEMA DE GESTIÓN DE USUARIOS")
    print("  Laboratorio - PostgreSQL")
    print("=" * 50)

    while True:
        print("  1) Listar usuarios")
        print("  2) Agregar usuario")
        print("  3) Actualizar usuario")
        print("  4) Eliminar usuario")
        print("  5) Salir")

        try:
            opcion = int(input("\n  Seleccione una opción (1-5): "))
        except ValueError:
            print("\n  Ingrese un número válido.\n")
            continue

        if opcion == 1:
            listar_usuarios()
        elif opcion == 2:
            agregar_usuario()
        elif opcion == 3:
            actualizar_usuario()
        elif opcion == 4:
            eliminar_usuario()
        elif opcion == 5:
            print("\n  Cerrando conexión y finalizando...")
            Conexion.cerrarConexiones()
            print("  ¡Hasta luego!\n")
            break
        else:
            print("\n  Opción no válida. Ingrese un número del 1 al 5.\n")
