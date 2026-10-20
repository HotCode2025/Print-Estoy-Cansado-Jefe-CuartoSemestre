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
        agregarButton.addActionListener(e -> agregarLibro());
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

    private void agregarLibro(){
    //Leer los valores del formulario
    if(libroTexto.getText().equals("")){
        mostrarMensaje("Ingresa el nombre del libro");
        libroTexto.requestFocusInWindow();
        return;
    }

    var nombreLibro = libroTexto.getText();
    var autor = autorTexto.getText();
    var precio = Double.parseDouble(precioTexto.getText());
    var existencias = Integer.parseInt(existenciasTexto.getText());
    //Creamos el objeto libro
    var libro = new Libro(null, nombreLibro, autor, precio, existencias);
    //libro.setNombreLibro(nombreLibro);
    //libro.setAutor(autor);
    //libro.setPrecio(precio);
    //libro.setExistencias(existencias);
    this.libroServicio.guardarLibro(libro);
    mostrarMensaje("Se agrego el libro...");
    limpiarFormulario();
}

    private void limpiarFormulario(){
    libroTexto.setText("");
    autorTexto.setText("");
    precioTexto.setText("");
    existenciasTexto.setText("");
}

    private void mostrarMensaje(String mensaje){
    JOptionPane.showMessageDialog(this, mensaje);
}


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
