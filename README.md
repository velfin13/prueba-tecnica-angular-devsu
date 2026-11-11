# Productos financieros - Frontend

Prueba técnica de frontend. Es una aplicación en Angular para ver, buscar, crear, editar y eliminar los productos financieros de un banco, consumiendo el backend local que viene con la prueba.

Autor: Velfin Velasquez (velfinvelasquez@gmail.com)

## Qué incluye

| Funcionalidad | Estado |
|---|---|
| F1. Listado de productos | Hecho |
| F2. Búsqueda por texto | Hecho |
| F3. Cantidad de registros (5, 10, 20) y paginación | Hecho |
| F4. Agregar producto, con validaciones | Hecho |
| F5. Editar producto desde el menú contextual | Hecho |
| F6. Eliminar producto con modal de confirmación | Hecho |

También tiene skeleton de carga, mensajes de error visibles, diseño responsive y rutas con carga diferida. Los estilos están escritos a mano, sin librerías de UI ni de CSS.

## Requisitos

- Docker, para ejecutar la aplicación (ver abajo)
- Node.js 22.22.3 o superior y npm, solo para correr las pruebas o compilar sin Docker (lo pide Angular 22; probado con Node 24)

Angular 22 y TypeScript 6, por encima de los mínimos que pide la prueba.

## Cómo ejecutarlo

Solo requiere Docker. El backend de la prueba se descarga como imagen desde Docker Hub (`velfin13/prueba-tecnica-backend-devsu`), así que no hace falta tener su código. Compose descarga esa imagen, compila el frontend y levanta los dos:

```bash
docker compose up --build
```

La aplicación queda en `http://localhost:8080`. Para detenerla: `docker compose down`. Los datos del backend viven en memoria, así que se pierden al detenerlo. La imagen del backend se construyó con `docker/backend.Dockerfile` a partir del proyecto original de la prueba, sin modificarlo.

## Pruebas unitarias

Primero `npm install`. Después:

```bash
npm test                 # modo watch
npm run test:coverage    # una sola corrida con reporte de cobertura
```

Hay 187 pruebas y la cobertura está en torno al 99%. El umbral mínimo está configurado en 70% en `angular.json`, y si no se cumple el comando falla. El reporte HTML queda en `coverage/`.

Uso Vitest y no Jest, porque es el ejecutor que trae Angular CLI por defecto en esta versión y la sintaxis es la misma (`describe`, `it`, `expect`).

## Compilar para producción

```bash
npm run build
```

La salida queda en `dist/`. La app llama a la API con la ruta relativa `/bp`, de modo que en un despliegue real el servidor web tiene que reenviar esa ruta al backend (el proxy de desarrollo no existe en producción). La ruta base se define en `src/app/infrastructure/api.config.ts`.

## Docker (opcional)

El `Dockerfile` compila la app en una etapa y copia solo los archivos estáticos a una imagen de nginx, así que la imagen final no lleva Node, `node_modules` ni código fuente (unos 90 MB). nginx sirve la aplicación y reenvía `/bp` al backend. El backend no tiene CORS habilitado, por eso el servidor de desarrollo (`npm start`) hace lo mismo con `proxy.conf.json`.

Para correr solo el frontend, con el backend ya levantado en la máquina anfitriona (por ejemplo, con `docker run --rm -p 3002:3002 velfin13/prueba-tecnica-backend-devsu`). Si se quieren los dos juntos, es más simple `docker compose`, como se explicó arriba:

```bash
docker build -t banco-frontend .
docker run --rm -p 8080:80 --add-host=host.docker.internal:host-gateway banco-frontend
```

Se abre en `http://localhost:8080`. Si el contenedor no logra resolver la dirección del backend (por ejemplo, si se olvida el `--add-host` en Linux), igual arranca y muestra la aplicación; en el log aparece un aviso y las llamadas a `/bp` responden 502, que la app presenta como error de conexión. Si el backend está en otra dirección, se indica con la variable `BACKEND_URL`:

```bash
docker run --rm -p 8080:80 -e BACKEND_URL=http://mi-backend:3002 banco-frontend
```

## Estructura

```
src/app/
  domain/           Entidad Product, errores, reglas de búsqueda y paginación
                    y el contrato del repositorio. No depende de la UI.
  application/      Casos de uso (listar, crear, actualizar, eliminar,
                    verificar ID, obtener por ID).
  infrastructure/   Implementación HTTP del repositorio, conversión entre el
                    formato de la API y el del dominio, traducción de errores.
  presentation/     Páginas, componentes, validadores y mensajes del formulario.
  shared/           Utilidades de fechas.
```

La idea es que las dependencias apunten hacia adentro. La interfaz usa los casos de uso, los casos de uso usan el repositorio como clase abstracta (`ProductRepository`), y en `app.config.ts` se indica cuál es la implementación real. Así las pruebas reemplazan el acceso a datos por un mock sin tocar la red, y un cambio en el formato de la API solo afecta a `infrastructure/`.

## Decisiones y cosas a tener en cuenta

- **Nombre de producto.** El enunciado pide mínimo 5 caracteres, pero el backend rechaza los de menos de 6 (`@MinLength(6)` en su DTO). El formulario valida con 5, como pide la prueba, así que un nombre de exactamente 5 caracteres pasa el formulario y el servidor lo devuelve como error, que se muestra en pantalla.
- **Fecha de revisión.** Se calcula sola como un año después de la fecha de liberación y el campo está deshabilitado, como en el diseño. Si la liberación es un 29 de febrero y el año siguiente no es bisiesto, usa el 28.
- **Edición y fecha pasada.** Un producto ya liberado tiene una fecha de liberación anterior a hoy y no se podría guardar si se exigiera siempre "igual o mayor a hoy". Por eso en edición esa regla solo se aplica si el usuario cambia la fecha.
- **ID único.** Se consulta `GET /bp/products/verification/:id` mientras se escribe, con una espera de 300 ms y cancelando la consulta anterior. Si esa consulta falla, el formulario no se bloquea; el backend vuelve a rechazar el duplicado al guardar.
- **Respuesta del PUT.** El backend no devuelve el `id` en la respuesta de actualización, así que la app usa el producto que se envió en lugar de lo que responde.
- **Obtener un producto.** La API documentada no tiene consulta por ID, así que la pantalla de edición busca el producto dentro de la lista.
- **Botón del modal.** El enunciado habla de un botón "Eliminar" y el diseño D4 muestra "Confirmar". Seguí el texto del enunciado.
- **Contador de resultados.** Muestra cuántas filas se ven en la página actual, siguiendo lo que dice F3. La paginación indica en qué página se está y cuántas hay.
- **Logos.** El campo `logo` es un texto (URL). Si la imagen no carga, se muestran las iniciales del producto en un círculo.
- **Errores del servidor.** Nunca se muestra el `stack` que devuelve el backend, solo mensajes propios en español.
