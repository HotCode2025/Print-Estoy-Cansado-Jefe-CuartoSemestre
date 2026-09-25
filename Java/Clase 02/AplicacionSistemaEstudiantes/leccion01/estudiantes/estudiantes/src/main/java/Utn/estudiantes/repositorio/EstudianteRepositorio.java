package Utn.estudiantes.repositorio;

import Utn.estudiantes.modelo.Estudiante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


public interface EstudianteRepositorio extends JpaRepository <Estudiante, Integer> {
}
