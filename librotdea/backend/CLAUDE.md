# LibroTdeA – Backend

Spring Boot 4.1.2 · Java 25 · Maven (wrapper incluido) · H2 en memoria.

## Comandos

```bash
./mvnw compile          # compilar
./mvnw test             # tests
./mvnw spring-boot:run  # arrancar en http://localhost:8080
```

- Swagger UI: `/swagger-ui.html` · OpenAPI JSON: `/v3/api-docs`
- Consola H2: `/h2-console` (JDBC URL `jdbc:h2:mem:book`, usuario `sa`, contraseña `sa`)
- Actuator: `/actuator/health` (con detalles)

## Dependencias clave

Spring Web MVC, Spring Data JPA, H2, Lombok, DevTools, Actuator, Validation y
`springdoc-openapi-starter-webmvc-ui` **3.2.0**. Usa springdoc 3.x, porque la 2.x es para Spring Boot 3.5
y no funciona con Boot 4. Si se actualiza Spring Boot, comprueba que la versión de springdoc sea compatible.

## Estructura del proyecto

```
backend/
├── pom.xml
├── mvnw / mvnw.cmd
└── src/
    ├── main/
    │   ├── java/com/tdea/librotdea/
    │   │   ├── LibrotdeaApplication.java     # punto de entrada
    │   │   ├── config/
    │   │   │   ├── CorsConfig.java           # CORS para http://localhost:3000
    │   │   │   └── OpenApiConfig.java        # metadatos de OpenAPI/Swagger
    │   │   ├── controller/                   # @RestController (solo HTTP, delega en service)
    │   │   │   └── BookController.java       # /api/books
    │   │   ├── dto/
    │   │   │   ├── BookRequest.java          # entrada de libro con validaciones (record)
    │   │   │   ├── BookResponse.java         # salida de libro (record)
    │   │   │   └── ErrorResponse.java        # cuerpo de error estándar (record)
    │   │   ├── entity/
    │   │   │   ├── Book.java                 # entidad libro (tabla book)
    │   │   │   └── BookType.java             # enum EBOOK / SOFTCOPY / HARDCOVER
    │   │   ├── exception/
    │   │   │   ├── GlobalExceptionHandler.java    # @RestControllerAdvice
    │   │   │   └── ResourceNotFoundException.java # -> 404
    │   │   ├── repository/
    │   │   │   └── BookRepository.java       # JpaRepository<Book, Long>
    │   │   └── service/
    │   │       └── BookService.java          # CRUD de libros + búsqueda por nombre
    │   └── resources/
    │       └── application.yml
    └── test/java/com/tdea/librotdea/
        └── LibrotdeaApplicationTests.java
```

Mantén esta sección al día cuando añadas archivos o paquetes.

## Reglas de código

1. **Nombres en inglés**: clases, métodos, variables, paquetes, endpoints y columnas.
   La documentación para el usuario (como este archivo) puede ir en español.
2. **Javadoc en todos los métodos públicos**, con `@param`, `@return` y `@throws` cuando correspondan.
   Las clases públicas también llevan un Javadoc breve.
3. **Inyección por constructor**. Nunca uses `@Autowired` en campos ni en setters. Los campos
   inyectados son `private final`. Se permite `@RequiredArgsConstructor` de Lombok.
4. **DTOs como `record`** en el paquete `dto`, con anotaciones de Jakarta Validation
   (`@NotBlank`, `@Size`...). Los controladores reciben y devuelven DTOs, nunca entidades JPA.
   Valida las entradas con `@Valid`.
5. **Errores centralizados** en `exception/GlobalExceptionHandler` (`@RestControllerAdvice`).
   - No uses `try/catch` en los controladores para producir respuestas de error.
   - Lanza excepciones de dominio (p. ej. `ResourceNotFoundException`) desde el service y
     añade aquí su `@ExceptionHandler`.
   - Todas las respuestas de error usan `dto/ErrorResponse`.
6. **Capas**: controller → service → repository. Los controllers no acceden a los repositorios.
   Los services manejan las transacciones (`@Transactional`).
7. Las entidades JPA viven en `entity` y pueden usar Lombok (`@Getter`, `@Setter`,
   `@NoArgsConstructor`). En las entidades, evita `@Data` y los `equals`/`hashCode` sobre relaciones.
8. Antes de dar una tarea por terminada, ejecuta `./mvnw compile`, que debe pasar sin errores.
