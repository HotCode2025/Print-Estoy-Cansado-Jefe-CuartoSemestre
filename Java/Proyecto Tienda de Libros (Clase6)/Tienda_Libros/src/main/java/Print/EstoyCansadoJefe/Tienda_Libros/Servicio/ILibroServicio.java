package Print.EstoyCansadoJefe.Tienda_Libros.Servicio;

import java.util.List;
import Print.EstoyCansadoJefe.Tienda_Libros.modelo.Libro;

public interface ILibroServicio {
    List<Libro> listarLibros();
    Libro buscarLibroPorId(Integer idLibro);
    void guardarLibro(Libro libro);
    void eliminarLibro(Libro libro);

    // Compatibilidad con PascalCase
    default List<Libro> ListarLibros() { return listarLibros(); }
    default void GuardarLibro(Libro libro) { guardarLibro(libro); }
    default void EliminarLibro(Libro libro) { eliminarLibro(libro); }
}
