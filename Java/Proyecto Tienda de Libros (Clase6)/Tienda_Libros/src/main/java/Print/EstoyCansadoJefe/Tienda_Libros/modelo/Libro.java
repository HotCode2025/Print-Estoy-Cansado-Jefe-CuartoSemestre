package Print.EstoyCansadoJefe.Tienda_Libros.modelo;

import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;


@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Libro {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer idLibro;
    String nombreLibro;
    String autor;
    Double precio;
    Integer stock;


}
