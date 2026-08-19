package UTN.datos;

import UTN.dominio.Estudiante;

import javax.swing.*;

import static UTN.conexion.Conexion.getConnection;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

//Data Access Object
public class EstudianteDAO {
    //Metodo para listar
    public List<Estudiante> listarEstudiantes(){
        List<Estudiante> estudiantes = new ArrayList<>();
        //Objetos para comunicacion con la bbdd
        PreparedStatement ps; //ayuda a enviar la sentencia sql que vamos a ejecutar hacia la bbdd
        ResultSet rs; //nos permite almacenar el resultado obtenido de la bbdd
        //Creamos un objeto de tipo conexion
        Connection con = getConnection();
        String sql = "SELECT * FROM estudiantes2026 ORDER BY idestudiantes2026";
        try {
            ps = con.prepareStatement(sql);
            rs = ps.executeQuery();
            while(rs.next()){
                var estudiante = new Estudiante();
                estudiante.setIdEstudiante(rs.getInt("idestudiantes2026"));
                estudiante.setNombre(rs.getString("nombre"));
                estudiante.setApellido(rs.getString("apellido"));
                estudiante.setTelefono(rs.getString("telefono"));
                estudiante.setEmail(rs.getString("email"));
                estudiantes.add(estudiante);
            } //Fin while
        } catch (Exception e) {
            System.out.println("Ocurrio un error al listar los estudiantes: " + e.getMessage());
        } //Fin catch

        finally {
            try {
                con.close();
            } catch (Exception e) {
                System.out.println("Ocurrio un error al cerrar la conexion: " + e.getMessage());
            }
        } //Fin finally

        return estudiantes;
    } //fin metodo listar


    //Metodo por id -> find by id
    public boolean buscarEstudiantePorId(Estudiante estudiante){
        PreparedStatement ps;
        ResultSet rs;
        Connection con = getConnection();
        String sql = "SELECT * FROM estudiantes2026 WHERE idestudiantes2026 = ?";
        try {
            ps = con.prepareStatement(sql);
            ps.setInt(1, estudiante.getIdEstudiante());
            rs = ps.executeQuery();
            if(rs.next()){
                estudiante.setNombre(rs.getString("nombre"));
                estudiante.setApellido(rs.getString("apellido"));
                estudiante.setTelefono(rs.getString("telefono"));
                estudiante.setEmail(rs.getString("email"));
                return true; //si encontro el registro
            }
        } catch (Exception e) {
            System.out.println("Ocurrio un error al buscar el estudiante: " + e.getMessage());
        } finally {
            try {
                con.close();
            } catch (Exception e) {
                System.out.println("Ocurrio un error al cerrar la conexion: " + e.getMessage());
            }
        }
        return false; //no encontro el registro
    } //fin metodo buscar por id

    //Metodo agregar un nuevo estudiante
    public boolean agregarEstudiante(Estudiante estudiante){
        PreparedStatement ps;
        Connection con = getConnection();
        String sql = "INSERT INTO estudiantes2026(nombre, apellido, telefono, email) VALUES(?, ?, ?, ?)";
        try {
            ps = con.prepareStatement(sql);
            ps.setString(1, estudiante.getNombre());
            ps.setString(2, estudiante.getApellido());
            ps.setString(3, estudiante.getTelefono());
            ps.setString(4, estudiante.getEmail());
            ps.executeUpdate();
            return true; //si se agrego el registro
        } catch (Exception e) {
            System.out.println("Ocurrio un error al agregar el estudiante: " + e.getMessage());
        } finally {
            try {
                con.close();
            } catch (Exception e) {
                System.out.println("Ocurrio un error al cerrar la conexion: " + e.getMessage());
            }
        }
        return false; //no se agrego el registro
    } //fin metodo agregar estudiante


    //metodo modificar estudiante
    public boolean modificarEstudiante(Estudiante estudiante){
        PreparedStatement ps;
        Connection con = getConnection();
        String sql = "UPDATE estudiantes2026 SET nombre = ?, apellido = ?, telefono = ?, email = ? WHERE idestudiantes2026 = ?";
        try {
            ps = con.prepareStatement(sql);
            ps.setString(1, estudiante.getNombre());
            ps.setString(2, estudiante.getApellido());
            ps.setString(3, estudiante.getTelefono());
            ps.setString(4, estudiante.getEmail());
            ps.setInt(5, estudiante.getIdEstudiante());
            ps.executeUpdate();
            return true; //si se modifico el registro
        } catch (Exception e) {
            System.out.println("Ocurrio un error al modificar el estudiante: " + e.getMessage());
        } finally {
            try {
                con.close();
            } catch (Exception e) {
                System.out.println("Ocurrio un error al cerrar la conexion: " + e.getMessage());
            }
        }
        return false; //no se modifico el registro
    } //fin metodo modificar estudiante

    public boolean eliminarEstudiante(Estudiante estudiante){
        PreparedStatement ps;
        Connection con = getConnection();
        String sql = "DELETE FROM estudiantes2026 WHERE idestudiantes2026 = ?";
        try {
            ps = con.prepareStatement(sql);
            ps.setInt(1, estudiante.getIdEstudiante());
            ps.execute();
            return true;
        } catch (Exception e) {
            System.out.println("Error al eliminar estudiante: " + e.getMessage());
        }
        finally {
            try {
                con.close();
            } catch (Exception e) {
                System.out.println("Error al cerrar la conexion: " + e.getMessage());
            }
            return false;
        }

    }

    public static void main(String[] args) {
        var estudianteDAO = new EstudianteDAO();

        //modificamos un estudiante
        // estudianteModificado = new Estudiante(2, "Joaquin", "Broski", "123456789", "joaquin.broski@email.com");
        //var modificado = estudianteDAO.modificarEstudiante(estudianteModificado);
       //if(modificado)
         //   System.out.println("Estudiante modificado: " + estudianteModificado);
        //else
         //   System.out.println("No se pudo modificar el estudiante: " + estudianteModificado);

        //Agregamos un nuevo estudiante
        // var nuevoEstudiante = new Estudiante("Juan", "Perez", "123456789", "juan.perez@email.com");
        // var agregado = estudianteDAO.agregarEstudiante(nuevoEstudiante);
        // if(agregado)
        //    System.out.println("Estudiante agregado: " + nuevoEstudiante);
        // else
        //    System.out.println("No se pudo agregar el estudiante: " + nuevoEstudiante);

        //Eliminar estudiante con id 3
        //var estudiante = new Estudiante(3);
        //var eliminado = estudianteDAO.eliminarEstudiante(estudianteEliminar);
        //if(eliminado)
        //    System.out.println("Estudiante eliminado"+estudianteEliminar);
        //else
        //    System.out.println("No se elimino estudiante"+estudianteEliminar);

        //Listamos los estudiantes
        System.out.println("Listado de estudiantes");
        List<Estudiante> estudiantes = estudianteDAO.listarEstudiantes();
        estudiantes.forEach(System.out::println);//funcion lambda que recorre la lista y por cada elemento ejecuta el metodo println

        //Buscamos un estudiante por id
        //var estudiante1 = new Estudiante(1);
        //System.out.println("Estudiantes antes de la busqueda: " + estudiante1);
        //var encontrado = estudianteDAO.buscarEstudiantePorId(estudiante1);
        //if(encontrado){
        //    System.out.println("Estudiante encontrado: " + estudiante1);
        //} else {
        //    System.out.println("Estudiante no encontrado: " + estudiante1.getIdEstudiante());
        //}
    }
}