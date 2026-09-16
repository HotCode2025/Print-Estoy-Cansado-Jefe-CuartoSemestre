package UTN.conexion;
// Importamos la clase Connection
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class Conexion {
    public static Connection getConnection() {
        //Creamos variable para inicializar la conexion
        Connection conexion = null;
        //Variable para conectar la base de datos
        var baseDatos = "estudiantes";
        var url = "jdbc:mysql://localhost:3306/" + baseDatos;
        var usuario = "root";
        var password = "";

        //Cargamos la clase del driver de mysql en memoria
        //Envolvemos la clase en un try-catch
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            conexion = DriverManager.getConnection(url, usuario, password);
        } catch (ClassNotFoundException | SQLException e) {
            System.out.println("Ocurrio un error en la conexion.");
            e.printStackTrace();
        } //Fin catch
        return conexion;
    } //Fin metodo Connection
}
