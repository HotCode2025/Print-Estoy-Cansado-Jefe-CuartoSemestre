package Print.EstoyCansadoJefe.Tienda_Libros.Vista;

import java.awt.BorderLayout;
import java.awt.Dimension;
import java.awt.FlowLayout;
import java.awt.Font;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.awt.Insets;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import javax.swing.BorderFactory;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTable;
import javax.swing.JTextField;
import javax.swing.ListSelectionModel;
import javax.swing.SwingConstants;
import javax.swing.table.DefaultTableModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import Print.EstoyCansadoJefe.Tienda_Libros.Servicio.LibroServicio;
import Print.EstoyCansadoJefe.Tienda_Libros.modelo.Libro;

@Component
public class LibroFrom extends JFrame {
    private LibroServicio libroServicio;
    private JPanel panel;
    private JTextField idTexto;
    private JTextField libroTexto;
    private JTextField autorTexto;
    private JTextField precioTexto;
    private JTextField existenciasTexto;
    private JButton agregarButton;
    private JButton modificarButton;
    private JButton eliminarButton;
    private JTable tablaLibros;
    private DefaultTableModel tablaModeloLibros;

    @Autowired
    public LibroFrom(LibroServicio libroServicio) {
        this.libroServicio = libroServicio;
        iniciarForma();
        agregarButton.addActionListener(e -> agregarLibro());
        tablaLibros.addMouseListener(new MouseAdapter() {
            @Override
            public void mouseClicked(MouseEvent e) {
                super.mouseClicked(e);
                cargarLibroSeleccionado();
            }
        });
        modificarButton.addActionListener(e -> modificarLibro());
        eliminarButton.addActionListener(e -> eliminarLibro());
    }

    private void iniciarForma() {
        createUIComponents();

        if (panel == null) {
            panel = new JPanel(new BorderLayout(20, 20));
            panel.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));

            // Título superior
            JLabel titulo = new JLabel("Tienda de Libros", SwingConstants.CENTER);
            titulo.setFont(new Font("Arial", Font.BOLD, 24));
            panel.add(titulo, BorderLayout.NORTH);

            // Panel Central contenedor (Formulario a la izquierda, Tabla a la derecha)
            JPanel panelCentral = new JPanel(new BorderLayout(20, 0));

            // Formulario a la izquierda
            JPanel panelFormulario = new JPanel(new GridBagLayout());
            GridBagConstraints gbc = new GridBagConstraints();
            gbc.insets = new Insets(8, 8, 8, 8);
            gbc.fill = GridBagConstraints.HORIZONTAL;

            // Fila 0: Libro
            gbc.gridx = 0; gbc.gridy = 0; gbc.weightx = 0;
            panelFormulario.add(new JLabel("Libro"), gbc);
            gbc.gridx = 1; gbc.gridy = 0; gbc.weightx = 1.0;
            libroTexto = new JTextField(15);
            panelFormulario.add(libroTexto, gbc);

            // Fila 1: Autor
            gbc.gridx = 0; gbc.gridy = 1; gbc.weightx = 0;
            panelFormulario.add(new JLabel("Autor"), gbc);
            gbc.gridx = 1; gbc.gridy = 1; gbc.weightx = 1.0;
            autorTexto = new JTextField(15);
            panelFormulario.add(autorTexto, gbc);

            // Fila 2: Precio
            gbc.gridx = 0; gbc.gridy = 2; gbc.weightx = 0;
            panelFormulario.add(new JLabel("Precio"), gbc);
            gbc.gridx = 1; gbc.gridy = 2; gbc.weightx = 1.0;
            precioTexto = new JTextField(15);
            panelFormulario.add(precioTexto, gbc);

            // Fila 3: Existencias
            gbc.gridx = 0; gbc.gridy = 3; gbc.weightx = 0;
            panelFormulario.add(new JLabel("Existencias"), gbc);
            gbc.gridx = 1; gbc.gridy = 3; gbc.weightx = 1.0;
            existenciasTexto = new JTextField(15);
            panelFormulario.add(existenciasTexto, gbc);

            // Spacer vertical
            gbc.gridx = 0; gbc.gridy = 4; gbc.gridwidth = 2; gbc.weighty = 1.0;
            panelFormulario.add(new JPanel(), gbc);

            panelCentral.add(panelFormulario, BorderLayout.WEST);

            // Tabla a la derecha con ScrollPane
            JScrollPane scrollPane = new JScrollPane(tablaLibros);
            scrollPane.setPreferredSize(new Dimension(500, 350));
            panelCentral.add(scrollPane, BorderLayout.CENTER);

            panel.add(panelCentral, BorderLayout.CENTER);

            // Panel inferior con botones
            JPanel panelBotones = new JPanel(new FlowLayout(FlowLayout.CENTER, 25, 10));
            agregarButton = new JButton("Agregar");
            modificarButton = new JButton("Modificar");
            eliminarButton = new JButton("Eliminar");

            Dimension btnSize = new Dimension(130, 30);
            agregarButton.setPreferredSize(btnSize);
            modificarButton.setPreferredSize(btnSize);
            eliminarButton.setPreferredSize(btnSize);

            panelBotones.add(agregarButton);
            panelBotones.add(modificarButton);
            panelBotones.add(eliminarButton);

            panel.add(panelBotones, BorderLayout.SOUTH);
        }

        setContentPane(panel);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(900, 700);
        setLocationRelativeTo(null);
    }

    private void agregarLibro() {
        // Leer los valores del formulario
        if (libroTexto.getText().trim().equals("")) {
            mostrarMensaje("Ingresa el nombre del libro");
            libroTexto.requestFocusInWindow();
            return;
        }

        var nombreLibro = libroTexto.getText();
        var autor = autorTexto.getText();
        var precio = Double.parseDouble(precioTexto.getText());
        var existencias = Integer.parseInt(existenciasTexto.getText());

        // Creamos el objeto libro
        var libro = new Libro(null, nombreLibro, autor, precio, existencias);
        this.libroServicio.guardarLibro(libro);
        mostrarMensaje("Se agrego el libro...");
        limpiarFormulario();
        listarLibros();
    }

    private void cargarLibroSeleccionado() {
        // Los indices de las columnas inician en 0
        var renglon = tablaLibros.getSelectedRow();
        if (renglon != -1) {
            String idLibro = tablaLibros.getModel().getValueAt(renglon, 0).toString();
            idTexto.setText(idLibro);
            String nombreLibro = tablaLibros.getModel().getValueAt(renglon, 1).toString();
            libroTexto.setText(nombreLibro);
            String autor = tablaLibros.getModel().getValueAt(renglon, 2).toString();
            autorTexto.setText(autor);
            String precio = tablaLibros.getModel().getValueAt(renglon, 3).toString();
            precioTexto.setText(precio);
            String existencias = tablaLibros.getModel().getValueAt(renglon, 4).toString();
            existenciasTexto.setText(existencias);
        }
    }

    private void modificarLibro() {
        if (this.idTexto.getText().equals("")) {
            mostrarMensaje("Debes seleccionar un registro en la tabla");
        } else {
            // Verificamos que nombre del libro no sea nulo
            if (libroTexto.getText().equals("")) {
                mostrarMensaje("Digite el nombre del libro...");
                libroTexto.requestFocusInWindow();
                return;
            }
            // Llenamos el objeto libro a actualizar
            int idLibro = Integer.parseInt(idTexto.getText());
            var nombreLibro = libroTexto.getText();
            var autor = autorTexto.getText();
            var precio = Double.parseDouble(precioTexto.getText());
            var existencias = Integer.parseInt(existenciasTexto.getText());
            var libro = new Libro(idLibro, nombreLibro, autor, precio, existencias);
            libroServicio.guardarLibro(libro);
            mostrarMensaje("Se modifico el libro...");
            limpiarFormulario();
            listarLibros();
        }
    }

    private void eliminarLibro() {
        var renglon = tablaLibros.getSelectedRow();
        if (renglon != -1) {
            String idLibro = tablaLibros.getModel().getValueAt(renglon, 0).toString();
            var libro = new Libro();
            libro.setIdLibro(Integer.parseInt(idLibro));
            libroServicio.eliminarLibro(libro);
            mostrarMensaje("Libro " + idLibro + " ELIMINADO");
            limpiarFormulario();
            listarLibros();
        } else {
            mostrarMensaje("No se ha seleccionado ningun libro de la tabla a eliminar");
        }
    }

    private void limpiarFormulario() {
        idTexto.setText("");
        libroTexto.setText("");
        autorTexto.setText("");
        precioTexto.setText("");
        existenciasTexto.setText("");
    }

    private void mostrarMensaje(String mensaje) {
        JOptionPane.showMessageDialog(this, mensaje);
    }

    private void createUIComponents() {
        idTexto = new JTextField("");
        idTexto.setVisible(false);
        this.tablaModeloLibros = new DefaultTableModel(0, 5) {
            @Override
            public boolean isCellEditable(int row, int column) {
                return false;
            }
        };
        String[] cabecera = {"Id", "Libro", "Autor", "Precio", "Existencias"};
        this.tablaModeloLibros.setColumnIdentifiers(cabecera);
        // Instanciar el objeto de JTable
        this.tablaLibros = new JTable(tablaModeloLibros);
        this.tablaLibros.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
        listarLibros();
    }

    private void listarLibros() {
        // Limpiar la tabla
        tablaModeloLibros.setRowCount(0);
        // Obtener los libros de la BD
        var libros = libroServicio.listarLibros();
        // Iteramos cada libro
        libros.forEach((libro) -> { // Función Lambda
            // Creamos cada registro para agregarlos a la tabla
            Object[] renglonLibro = {
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
