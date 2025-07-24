/********************************************************************************
*  WEB322 – Assignment 04
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Dillon Kwak 
*  Student ID: 135389203 
*  Date: July 12th 2025
*
********************************************************************************/

const express = require('express');
const path = require('path');
const app = express();
const projectData = require("./modules/projects");
const HTTP_PORT = process.env.PORT || 8080;

app.set('view engine', 'ejs'); //.ejs will use EJS engine (templates)
app.use(express.static('public')); //- reminder do not forget to mark the "public" folder as "static
app.use(express.static(path.join(__dirname, "public")));
projectData.initialize();

app.get('/', (req, res) => {
    res.render("home", { page: "/" });

});

app.get('/about', (req, res) => {
    res.render("about", {page: "/about"});
});

app.get('/solutions/projects', (req, res) => {
    const sector = req.query.sector;

    if (sector) {
        projectData.getProjectsBySector(sector)
        .then((projects) => {res.render("projects", {
                projects: projects,
                sector: sector,
                page: "/solutions/projects"
            });
        }).catch((err) => {
            res.status(404).render("404", {message: "Page not found", page: ""});
        });
    } else {
        projectData.getAllProjects().then((projects) => {
            res.render("projects", {
                projects: projects,
                page: "/solutions/projects"
            });
        }).catch((err) => {
            res.status(404).render("404", {message: "Page not found", page: ""});
        });
    }
});

app.get('/solutions/projects/:id', (req, res) => {
    projectData.getProjectById(req.params.id)
        .then((project) => {
            res.render("project-details", {project: project});
        })
        .catch((err) => {
            res.status(404).render("404", { message: "No projects found for a specific id" });
            console.log("responded");
        });
});

app.set((req,res) => {
    res.status(404).render("404", { message: "Page not found" });
})

app.listen(HTTP_PORT, () => console.log("Server responded"));
