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
    public List<Libro> listarLibros() {
        return libroRepsitorio.findAll();
    }

    @Override
    public Libro buscarLibroPorId(Integer idLibro) {
        return libroRepsitorio.findById(idLibro).orElse(null);
    }

    @Override
    public void guardarLibro(Libro libro) {
        libroRepsitorio.save(libro);
    }

    @Override
    public void eliminarLibro(Libro libro) {
        libroRepsitorio.delete(libro);
    }
}
