from .logger_base import log
from .conexion import Conexion
from .cursor_del_pool import CursorDelPool  # Asegúrate de importar tu clase del pool
from .persona import Persona

class PersonaDAO:
    '''
    DAO significa: Data Access Object
    CRUD significa:
                    Create -> Insertar
                    Read -> Seleccionar
                    Update -> Actualizar
                    Delete -> Eliminar
    '''

    _SELECCIONAR = 'SELECT * FROM persona ORDER BY id_persona'
    _INSERTAR = 'INSERT INTO persona(nombre, apellido, email) VALUES (%s , %s , %s)'
    _ACTUALIZAR = 'UPDATE persona SET nombre = %s, apellido = %s, email = %s WHERE id_persona = %s'
    _ELIMINAR = 'DELETE FROM persona WHERE id_persona = %s'

    # Definimos los métodos de la clase
    @classmethod
    def seleccionar(cls):
        with CursorDelPool() as cursor:
            cursor.execute(cls._SELECCIONAR)
            registros = cursor.fetchall()
            personas = []  # creamos una lista
            for registro in registros:
                persona = Persona(registro[0], registro[1], registro[2], registro[3])
                personas.append(persona)
            return personas

    @classmethod
    def insertar(cls, persona):
        with CursorDelPool() as cursor:
            valores = (persona.nombre, persona.apellido, persona.email)
            cursor.execute(cls._INSERTAR, valores)
            log.debug(f'Persona Insertada: {persona}')
            return cursor.rowcount

    @classmethod
    def actualizar(cls, persona):
        with CursorDelPool() as cursor:
            valores = (persona.nombre, persona.apellido, persona.email, persona.id_persona)
            cursor.execute(cls._ACTUALIZAR, valores)
            log.debug(f'Persona Actualizada: {persona}')
            return cursor.rowcount

    @classmethod
    def eliminar(cls, persona):
        with CursorDelPool() as cursor:
            valores = (persona.id_persona,)
            cursor.execute(cls._ELIMINAR, valores)
            log.debug(f'Objeto eliminado: {persona}')
            return cursor.rowcount

if __name__ == '__main__':
    # Eliminar un registro (creamos un objeto Persona temporal solo con el ID)
    # persona1 = Persona(id_persona=13, nombre=None, apellido=None, email=None)
    # personas_eliminadas = PersonaDAO.eliminar(persona1)
    # log.debug(f'Personas eliminadas: {personas_eliminadas}')

    # Insertar un registro
    persona1 = Persona(id_persona=None, nombre='Pedro', apellido='Pascal', email='PedroPSC@email.com')
    personas_insertadas = PersonaDAO.insertar(persona1)
    log.debug(f'Persona Insertada: {personas_insertadas}')

    # Seleccionar objetos
    personas = PersonaDAO.seleccionar()
    for persona in personas:
        log.debug(f'{persona}')