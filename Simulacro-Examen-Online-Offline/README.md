# IISSI-2 IS: Simulacro de examen de laboratorio

## Enunciado

La empresa ha decidido ofrecer a los propietarios la posibilidad de cambiar manualmente el estado 
de sus restaurantes abiertos (online u offline). En caso de que un restaurante tenga un 
estado online u offline, la nueva funcionalidad proporcionaría un botón para alternar entre ambos 
estados. De lo contrario, dicho botón no debe estar disponible. 
Tenga en cuenta que cualquier restaurante nuevo se almacena inicialmente como offline de forma 
predeterminada. Solo los restaurantes offline pueden estar en línea y viceversa. Por otro lado, si un 
restaurante alcanza un estado de cerrado o cerrado temporalmente, la posibilidad de cambio manual 
no estará disponible y su uso estará prohibido por el sistema.  
Además, tenga en cuenta que un restaurante tampoco podrá cambiar su estado si tiene pedidos 
con un valor nulo en deliveredAt. 
La nueva funcionalidad también implicará proporcionar la lista de restaurantes propiedad del 
usuario ordenados por estado (ascendentemente) y, para el mismo estado, por nombre.  
Finalmente, el estado de cada restaurante debe ser visible.

### Ejercicio 1

Realice todos los cambios necesarios en el proyecto de backend para implementar el nuevo requisito.

### Ejercicio 2

Realice todos los cambios necesarios en el proyecto de frontend para implementar el nuevo requisito.
![image](https://github.com/Cristinafernandezchica/Simulacro-Examen-Apertura-Restaurante/assets/114416600/639f956b-613c-4102-a298-56f03ea707a3)

![image](https://github.com/Cristinafernandezchica/Simulacro-Examen-Apertura-Restaurante/assets/114416600/a6c90ded-3140-4aa1-b4d8-fc59552d09f5)

## Introducción

Este repositorio incluye el backend completo (carpeta `DeliverUS-Backend`) y el frontend de `owner` (carpeta `DeliverUS-Frontend-Owner`). Servirá como base para realizar el examen de laboratorio de la asignatura.

## Preparación del entorno

### a) Windows

* Abra un terminal y ejecute el comando `npm run install:all:win`.

### b) Linux/MacOS

* Abra un terminal y ejecute el comando `npm run install:all:bash`.

## Ejecución

### Backend

* Para **rehacer las migraciones y seeders**, abra un terminal y ejecute el comando

    ```Bash
    npm run migrate:backend
    ```

* Para **ejecutarlo**, abra un terminal y ejecute el comando

    ```Bash
    npm run start:backend
    ```

### Frontend

* Para **ejecutar la aplicación frontend de `owner`**, abra un nuevo terminal y ejecute el comando

    ```Bash
    npm run start:frontend:owner
    ```

## Depuración

* Para **depurar el backend**, asegúrese de que **NO** existe una instancia en ejecución, pulse en el botón `Run and Debug` de la barra lateral, seleccione `Debug Backend` en la lista desplegable, y pulse el botón de *Play*.

* Para **depurar el frontend**, asegúrese de que **EXISTE** una instancia en ejecución del frontend que desee depurar, pulse en el botón `Run and Debug` de la barra lateral, seleccione `Debug Frontend` en la lista desplegable, y pulse el botón de *Play*.

## Test

* Para comprobar el correcto funcionamiento de backend puede ejecutar el conjunto de tests incluido a tal efecto. Para ello ejecute el siguiente comando:

    ```Bash
    npm run test:backend
    ```
**Advertencia: Los tests no pueden ser modificados.**
