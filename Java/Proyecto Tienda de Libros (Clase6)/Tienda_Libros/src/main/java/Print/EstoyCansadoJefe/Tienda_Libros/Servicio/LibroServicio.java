package Print.EstoyCansadoJefe.Tienda_Libros.Servicio;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import Print.EstoyCansadoJefe.Tienda_Libros.modelo.Libro;
import Print.EstoyCansadoJefe.Tienda_Libros.repositorio.LibroRepsitorio;


    @Service
    public class LibroServicio implements ILibroServicio {

    @Autowired
    private LibroRepsitorio libroRepsitorio;

    @Override
    public List<Libro> ListarLibros() {
        return libroRepsitorio.findAll();
    }

    @Override
    public Libro buscarLibroPorId(Integer idLibro) {
        Libro libro = libroRepsitorio.findById(idLibro).orElse(null);
        return libro;
    }

    @Override
    public void GuardarLibro(Libro libro) {
        libroRepsitorio.save(libro);
    }

    @Override
    public void EliminarLibro(Libro libro) {
        libroRepsitorio.delete(libro);

    }

}
