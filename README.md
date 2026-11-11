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

- Node.js 22.22.3 o superior (lo pide Angular 22; probado con Node 24)
- npm

Angular 22 y TypeScript 6, por encima de los mínimos que pide la prueba.

## Cómo ejecutarlo

Hacen falta dos procesos: el backend de la prueba y este frontend.

**1. Backend.** Es el proyecto que entregan con la prueba (`repo-interview-main.zip`) y no está incluido en este repositorio. Hay que descomprimirlo en otra carpeta:

```bash
cd repo-interview-main
npm install
npm run start:dev
```

Queda en `http://localhost:3002`. Los datos viven en memoria, así que al reiniciarlo la lista queda vacía.

**2. Frontend** (esta carpeta):

```bash
npm install
npm start
```

Se abre en `http://localhost:4200`.

El backend no tiene CORS habilitado, así que el servidor de desarrollo redirige las llamadas que empiezan con `/bp` hacia `http://localhost:3002` (ver `proxy.conf.json`). No hay que tocar el backend ni cambiar URLs.

## Pruebas unitarias

```bash
npm test                 # modo watch
npm run test:coverage    # una sola corrida con reporte de cobertura
```

Hay 177 pruebas y la cobertura está en torno al 99%. El umbral mínimo está configurado en 70% en `angular.json`, y si no se cumple el comando falla. El reporte HTML queda en `coverage/`.

Uso Vitest y no Jest, porque es el ejecutor que trae Angular CLI por defecto en esta versión y la sintaxis es la misma (`describe`, `it`, `expect`).

## Compilar para producción

```bash
npm run build
```

La salida queda en `dist/`. La app llama a la API con la ruta relativa `/bp`, de modo que en un despliegue real el servidor web tiene que reenviar esa ruta al backend (el proxy de desarrollo no existe en producción). La ruta base se define en `src/app/infrastructure/api.config.ts`.

## Docker (opcional)

El `Dockerfile` compila la app en una etapa y copia solo los archivos estáticos a una imagen de nginx, así que la imagen final no lleva Node, `node_modules` ni código fuente (unos 90 MB). nginx sirve la aplicación y reenvía `/bp` al backend, que es lo que hace el proxy en desarrollo.

Con el backend corriendo en la máquina anfitriona:

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
