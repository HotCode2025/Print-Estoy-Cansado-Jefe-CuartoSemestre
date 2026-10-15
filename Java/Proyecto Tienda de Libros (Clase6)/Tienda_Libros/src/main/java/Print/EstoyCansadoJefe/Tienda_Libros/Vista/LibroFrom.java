package Print.EstoyCansadoJefe.Tienda_Libros.Vista;

import javax.swing.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import Print.EstoyCansadoJefe.Tienda_Libros.Servicio.LibroServicio;

@Component
public class LibroFrom extends JFrame {
    private LibroServicio libroServicio;
    private JPanel panel;

    @Autowired
    public LibroFrom(LibroServicio libroServicio) {
        this.libroServicio = libroServicio;
        iniciarForma();
    }

    private void iniciarForma() {
        if (panel == null) {
            panel = new JPanel();
            JLabel titulo = new JLabel("Tienda de Libros");
            titulo.setFont(new java.awt.Font("Arial", java.awt.Font.BOLD, 24));
            panel.add(titulo);
        }
        setContentPane(panel);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setVisible(true);
        setSize(900, 700);
        setLocationRelativeTo(null);

    private void createUIComponents() {
    this.tablaModeloLibros = new DefaultTableModel(0, 5);
    String[] cabecera = {"Id", "Libro", "Autor", "Precio", "Existencias"};
    this.tablaModeloLibros.setColumnIdentifiers(cabecera);
    //Instanciar el objeto de JTable
    this.tablaLibros = new JTable(tablaModeloLibros);
    listarLibros();
    }

    private void listarLibros(){
    //Limpiar la tabla
    tablaModeloLibros.setRowCount(0);
    //Obtener los libros de la BD
    var libros = libroServicio.listarLibros();
    //Iteramos cada libro
    libros.forEach((libro) -> {// Función Lambda
        //Creamos cada registro para agregarlos a la tabla
        Object [] renglonLibro = {
            libro.getIdLibro(),
            libro.getNombreLibro(),
            libro.getAutor(),
            libro.getPrecio(),
            libro.getExistencias()
        };
        this.tablaModeloLibros.addRow(renglonLibro);
    });
  }
}
