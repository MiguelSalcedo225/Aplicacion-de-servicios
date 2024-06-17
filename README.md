# Proyecto-BD
Proyecto final de Bases de Datos
Estudiantes:
Miguel Angel Salcedo Urian - 2242786
Andres Felipe Alcantara Muños - 2242517
## Inicialización
Una vez dentro de la carpeta raíz del proyecto procedemos a crear el contenedor para la base de datos (debe tener Docker en ejecución):
```sh
cd database
docker build -t imagen_proyecto .
docker run --name contenedor_proyecto -p 5432:5432 -e POSTGRES_PASSWORD=pg123 -d imagen_proyecto
```
Despues de crear el servidor de la base de datos mediante la conexión al contenedor, debemos tener en cuenta que se debe actualizar la dirección ip y la contraseña de la base de datos (en caso de no haber usado la del documento). Para esto accedemos al archivo index.js dentro de la carpeta backend y modificamos las lineas 12 y 13:
```js
    password: "pg123",
    host: "tu dirección ip aquí",
```
Ahora estando dentro de la carpeta raíz del proyecto instalamos todas las dependencias necesarias e iniciamos el servidor(debe descargar previamente Node.js):
```sh
cd backend
npm install
npm install pdfkit
npm install express@4.19.2
npm install wkhtmltopdf
node index.js
```
Finalmente accedemos desde nuestro navegador a localhost:3000.
## ¿Como acceder a la aplicación?
Para acceder a la aplicación se disponen de unas credenciales para usuario de tipo cliente y de tipo administrador en la base de datos, no obstante los encontraras a continuación:
```sh
Usuarios:
login: user1, contraseña: password1. 
login: user2, contraseña: password2.
Administradores:
login: admin1, contraseña 1234.
login: admin2, contraseña 5678.
```
