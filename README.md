# library-management-system
> A basic library management system implemented using MySQL-Express-Vue-Node stack

## Setup
* Clone the repository
* Start a mysql server and create an empty database
* Create `.env` file in the project root directory and populate it with the required values (refer to `.env.example`)
* Execute `node database_init.js <admin_email> <admin_pass>` to initialize the database

## Run 
* Execute `node server.js` to start the server
* Access the admin dashboard at `localhost:<PORT>/admin` and login using the credentials provided while initializing the database

> **_NOTE:_**  Use incognito windows to simulate different users.
