package Utn.estudiantes.repositorio;

import Utn.estudiantes.modelo.Estudiantes2022;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


public interface EstudianteRepositorio extends JpaRepository <Estudiantes2022, Integer> {
}
