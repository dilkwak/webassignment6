/********************************************************************************
*  WEB322 – Assignment 02
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Dillon Kwak Student ID: 135389203 Date: June 8th 2025
*
********************************************************************************/

const express = require('express');
const app = express();
const projectData = require("./modules/projects");
const HTTP_PORT = process.env.PORT || 8080;

projectData.initialize();

app.get('/', (req, res) => {
    res.send('Assignment 2:  Dillon Kwak - 135389203');
});

app.get('/solutions/projects', (req, res) => {
    projectData.getAllProjects()
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            res.send(err);
        });
});

app.get('/solutions/projects/id-demo', (req, res) => {
    projectData.getProjectById(9)
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            res.send(err);
        });
});

app.get('/solutions/projects/sector-demo', (req, res) => {
    projectData.getProjectsBySector("agriculture")
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            res.send(err);
        });
});

app.listen(HTTP_PORT, () => console.log("Server responded"));
