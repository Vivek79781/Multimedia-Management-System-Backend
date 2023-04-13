# Multimedia-Management-System-Backend
This is the backend module of the Multimedia Management System
Create a Multimedia Management System for storing and managing multimedia files

## [Technologies](https://github.com/Vivek79781/Multimedia-Management-System-Backend/blob/main/package.json) Used
Multimedia Management System uses a number of open source projects to work properly:

- [node.js](https://nodejs.org/en) - evented I/O for the backend
- [Express](https://expressjs.com/) - fast node.js network app framework
- [Cloudinary](https://cloudinary.com/) - cloud services to store images and videos
- [Frontend](https://github.com/Vivek79781/Multimedia-Management-System-Frontend.git) - Custom Made Frontend Module

## Create the Database
Create your MySQL Database and change [./utils/config.js](https://github.com/Vivek79781/Multimedia-Management-System-Backend/blob/main/utils/config.js) file as per your configuration and run database.sql in your Database for creating all the required table.

## Installation

Multimedia Management System requires [Node.js](https://nodejs.org/) v10+ to run.

Install the dependencies and devDependencies and start the server.

```sh
cd Multimedia-Management-System-Backend
npm i
node app
```

> Note: Before Running Please Include Your Own `Cloudinary Environment Variables`.
Sample .env file should look like this:
```sh
CLOUDINARY_CLOUD_NAME=<your cloud name>
CLOUDINARY_KEY=<your cloud key>
CLOUDINARY_SECRET=<your cloud secret>
```
