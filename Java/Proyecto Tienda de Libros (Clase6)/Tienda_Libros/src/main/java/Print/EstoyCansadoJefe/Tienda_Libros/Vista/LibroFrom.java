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
    }
}
