package Print.EstoyCansadoJefe.Tienda_Libros.Servicio;

import java.util.List;

import Print.EstoyCansadoJefe.Tienda_Libros.modelo.Libro;

public interface ILibroServicio {
    public List<Libro> ListarLibros();

    public Libro buscarLibroPorId(Integer idLibro);

    public void GuardarLibro(Libro libro);

    public void EliminarLibro(Libro libro);
}
