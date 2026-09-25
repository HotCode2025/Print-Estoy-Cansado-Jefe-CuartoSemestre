package Utn.estudiantes.servicio;


import Utn.estudiantes.modelo.Estudiante;

import java.util.List;

public interface IEstudianteServicio {
   public List<Estudiante> listarEstudiantes();
   public Estudiante buscarEstudiantePorId(Integer idEstudiante);
   public void guardarEstudiante (Estudiante estudiante);
   public void eliminarEstudiante (Estudiante estudiante);
}
