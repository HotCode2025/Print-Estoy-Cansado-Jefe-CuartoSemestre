package Utn.estudiantes.servicio;

import Utn.estudiantes.modelo.Estudiantes2022;
import Utn.estudiantes.repositorio.EstudianteRepositorio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EstudianteServicio implements IEstudianteServicio{

    @Autowired
    private EstudianteRepositorio estudianteRepositorio;

    @Override
    public List<Estudiantes2022> listarEstudiantes() {
        List<Estudiantes2022> estudiantes = estudianteRepositorio.findAll();
        return estudiantes;
    }

    @Override
    public Estudiantes2022 buscarEstudiantePorId(Integer idEstudiantes2022) {
        Estudiantes2022 estudiante = estudianteRepositorio.findById(idEstudiantes2022).orElse(null);
        return estudiante;
    }

    @Override
    public void guardarEstudiante(Estudiantes2022 estudiante) {
        estudianteRepositorio.save(estudiante);

    }

    @Override
    public void eliminarEstudiante(Estudiantes2022 estudiante) {
        estudianteRepositorio.delete(estudiante);
    }
}
