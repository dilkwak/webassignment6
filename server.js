/********************************************************************************
*  WEB322 – Assignment 03
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Dillon Kwak Student ID: 135389203 Date: June 20th 2025
*
********************************************************************************/

const express = require('express');
const path = require('path');
const app = express();
const projectData = require("./modules/projects");
const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static('public')); //- reminder do not forget to mark the "public" folder as "static

projectData.initialize();

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "/views/home.html"));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, "/views/about.html"));
});

app.get('/solutions/projects', (req, res) => {
    const sector = req.query.sector;
    projectData.getAllProjects()
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            res.send(err);
        });
    if(sector){
        projectData.getProjectsBySector(sector)
        .then((result) => {res.send(result);})
        .catch((err) => {
            res.status(404).sendFile(path.join(__dirname, "/views/404.html"));

        });
    } else {
        projectData.getAllProjects()
        .then((result) => {res.send(result);})
        .catch((err) => {
            res.status(404).sendFile(path.join(__dirname, "/views/404.html"));
        });
    }
});

app.get('/solutions/projects/:id', (req, res) => {
    projectData.getProjectById(req.params.id)
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            res.status(404).sendFile(path.join(__dirname, "/views/404.html"));
            console.log("responded");

        });
});

app.set((req,res) => {
    res.status(404).sendFile(path.join(__dirname, "/views/404.html"));
})

app.listen(HTTP_PORT, () => console.log("Server responded"));


//---------------Assignment 3 --------------//
// app.get('/solutions/projects/sector-demo', (req, res) => {
//     projectData.getProjectsBySector("agriculture")
//         .then((result) => {
//             res.send(result);
//         })
//         .catch((err) => {
//             res.send(err);
//         });
// });