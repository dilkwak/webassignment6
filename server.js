/********************************************************************************
*  WEB322 – Assignment 05
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Dillon Kwak 
*  Student ID: 135389203 
*  Date: Aug 10th 2025
*
********************************************************************************/

// require('dotenv').config();
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const path = require('path');
const app = express();
const projectData = require("./modules/projects");
const authData = require('./modules/auth-service');
const clientSessions = require('client-sessions');

const HTTP_PORT = process.env.PORT || 8080;
// const sector = req.query.sector;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended:true}));
app.set('views', path.join(__dirname, 'views')); //.ejs will use EJS engine (templates)
app.set('view engine', 'ejs'); //.ejs will use EJS engine (templates)
// projectData.initialize();

app.use(clientSessions({
    cookieName: 'session',
    secret: process.env.SESSION_SECRET || 'longUnGuessableString',
    duration: 2 * 60 * 1000,
    activeDuration: 60 * 1000
}));

app.use((req, res, next) => {
    res.locals.session = req.session || {};
    res.locals.page = (req.path || '').split('?')[0];
    next();
});

function ensureLogin(req, res, next) {
if (!req.session || !req.session.user) {
    res.redirect('/login');
} else {
    next();
}
}

app.get('/', (req, res) => {
    res.render("home", { page: "/" });

});

app.get('/about', (req, res) => {
    res.render("about", {page: "/about"});
});

const { Sector } = require('./modules/projects');
app.get('/solutions/addProject', (req, res) => {
    const sector = req.query.sector;
    Sector.findAll().then(sector => {
            res.render("addProject", {
                sector: sector,
                page: "/solutions/addProject"
            });
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send("Unable to load sectors.");
        });
});

app.get('/solutions/projects', (req, res) => {
    const sector = req.query.sector;
    if(sector === undefined) {
        projectData.getAllProjects()
        .then((projects) => {
            res.render("projects", {
                projects: projects,
                page: "/solutions/projects"
            });
        })
        .catch((err) => {
            console.error("Rendering error:", err);
            res.status(404).render("404", { message: "Page Not Found", page: "" });
        });
    }
    else {
        projectData.getProjectsBySector(sector)
        .then((projects) => {
            res.send(projects);            
        })
        .catch((err) => {
            res.status(404).render("404", { message: `${err}`, page: ""});
        })
    }
});


app.get('/solutions/projects/:id', (req, res) => {
    projectData.getProjectById(req.params.id)
        .then((project) => {
            res.render("project-details", {project: project, page:""});
        })
        .catch((err) => {
            res.status(404).render("404", { message: "Page Not Found" });
            console.log("responded");
        });
});

app.get('/solutions/addProject', (req, res) => {    
    projectData.getAllSectors()
    .then((sector) => {
        res.render('addProject', {
            sector,
            page: '/solutions/addProject'
        });
    })
    .catch((err) => {
        res.render('500', { message: "Page Not Found" });
    });
});

app.post('/solutions/addProject', (req, res) => {
    projectData.addProject(req.body)
        .then(() => {
            console.log("success!");
            res.redirect('/solutions/projects');
        })
        .catch((err) => {
            console.log("fail!");
            res.render('500', { message: `error: ${err}`, page: "500"});
        });
});
app.get('/solutions/editProject/:id', (req, res) => {    
    projectData.getProjectById(req.params.id)
    .then((project) => {
        projectData.getAllSectors()
            .then((sectors) => {
                res.render('editProject', {
                    project: project,
                    projectId: req.params.id,
                    sectors: sectors,
                    page: '/solutions/addProject'
                });
            })
            .catch((err) => {
                res.render('500', { message: "Sectors Not Found" });
            });
        
    })
    .catch((err) => {
        res.render('500', { message: "Project Not Found" });
    });
});

app.post('/solutions/editProject', (req, res) => {
    projectData.editProject(req.body)
        .then((sectors) => {
            res.redirect('/solutions/projects');
        })
        .catch((err) => {
            res.render('500', { message: `error: ${err}`, page: "500"});
        });
});

app.get('/solutions/deleteProject/:id', (req,res) => {
    projectData.deleteProject(req.params.id)
    .then(() => {
        res.redirect('/solutions/projects');
    })
    .catch((err) => {
    res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}`, page: "500" });
    });
})

//assignment 6 

projectData.initialize()
.then(authData.initialize)
.then(()=>{
    app.listen(HTTP_PORT, function(){
        console.log(`app listening on: ${HTTP_PORT}`);
    });
}).catch(function(err){
    console.log(`unable to start server: ${err}`);
});
//step 4


app.get('/login', (req, res) => {
    if (req.session && req.session.user) {
        return res.redirect('/solutions/projects');
    }
    res.render('login', { 
        errorMessage: "", 
        userName: "", 
        page: "/login" 
    });
});
app.get('/register', (req, res) => {
    res.render('register', { errorMessage: "", successMessage: "", userName: "", page: "/register" });
});

app.post('/register', (req, res) => {
    authData.registerUser(req.body)
        .then(() => {
        res.render('register', { 
            errorMessage: "", 
            successMessage: "User created", 
            userName: "", 
            page: "/register" });
        })
        .catch(err => {
        res.render('register', {
            errorMessage: String(err),
            successMessage: "",
            userName: req.body.userName || "",
            page: "/register"
        });
        
    });
});

app.post('/login', (req, res) => {
req.body.userAgent = req.get('User-Agent');

authData.checkUser(req.body)
    .then(user => {
    req.session.user = {
        userName: user.userName,
        email: user.email,
        loginHistory: user.loginHistory
    };
    res.redirect('/solutions/projects');
    })
    .catch(err => {
    res.render('login', {
        errorMessage: String(err),
        userName: req.body.userName || "",
        page: "/login"
    });
    });
});
app.get('/logout', (req, res) => {
    req.session.reset();
    res.redirect('/');
});
app.get('/userHistory', ensureLogin, (req, res) => {
    res.render('userHistory', { page: "/userHistory" });
});

//Update all routes that allow users to add, edit, or delete Projects
// add
app.get('/solutions/addProject', ensureLogin, (req, res) => {
    projectData.getAllSectors()
        .then((sector) => {
        res.render('addProject', { sector, page: '/solutions/addProject' });
    })
    .catch(() => res.render('500', { message: 'Page Not Found' }));
});
app.post('/solutions/addProject', ensureLogin, (req, res) => {
    projectData.addProject(req.body)
    .then(() => res.redirect('/solutions/projects'))
    .catch(err => res.render('500', { message: `error: ${err}`, page: '500' }));
});

// edit
app.get('/solutions/editProject/:id', ensureLogin, (req, res) => {
    projectData.getProjectById(req.params.id)
        .then(project => projectData.getAllSectors()
        .then(sectors => res.render('editProject', {
            project, 
            projectId: req.params.id, 
            sectors, page: '/solutions/addProject'
        }))
    )
    .catch(() => res.render('500', { message: 'Project or Sectors Not Found' }));
});
app.post('/solutions/editProject', ensureLogin, (req, res) => {
    projectData.editProject(req.body)
    .then(() => res.redirect('/solutions/projects'))
    .catch(err => res.render('500', { message: `error: ${err}`, page: '500' }));
});
// delete
app.get('/solutions/deleteProject/:id', ensureLogin, (req, res) => {
    projectData.deleteProject(req.params.id)
    .then(() => res.redirect('/solutions/projects'))
    .catch(err => res.render('500', { message: `error: ${err}`, page: '500' }));
});


app.use((req, res) => {
    res.status(404).render("404", { message: "Page Not Found", page: "" });
});
