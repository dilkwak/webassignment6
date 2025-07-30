const { resolveInclude } = require('ejs');
const projectData = require("../data/projectData");
const sectorData = require("../data/sectorData");
require('dotenv').config(); //allow us to access the PGUSER, PGDATABASE, etc. values from the ".env" file using the "process.env" syntax, ie:  process.env.PGUSER, process.env.PGDATABASE etc.
require('pg');
const Sequelize = require('sequelize');

// let projects = [];

// set up sequelize to point to our postgres database
const sequelize = new Sequelize('neondb','neondb_owner', 'npg_nuQGr7JUWwN2',{
    host: 'ep-broad-moon-aem0uu41-pooler.c-2.us-east-2.aws.neon.tech',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
    ssl: { 
        // raw: true,
        rejectUnauthorized: false },
},
});
//create the two models
const Sector = sequelize.define('Sector', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    sector_name: Sequelize.STRING,
}, {
    createdAt: false,
    updatedAt: false,
});
const Project = sequelize.define('Project', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    title: Sequelize.STRING,
    feature_img_url: Sequelize.STRING,
    summary_short: Sequelize.TEXT,
    intro_short: Sequelize.TEXT,
    impact: Sequelize.TEXT,
    original_source_url: Sequelize.STRING,
    // sector_id: Sequelize.INTEGER,
}, {
    createdAt: false,
    updatedAt: false,
});
Project.belongsTo(Sector, {foreignKey: 'sector_id'});

sequelize
.authenticate()
.then(() => {
    console.log('Connection has been established successfully.');
})
.catch((err) => {
    console.log('Unable to connect to the database:', err);
});

// function initialize(){
// // const sectorData = require("../data/sectorData.json");
// // const projectData = require("../data/projectData.json");
//     //fill the projects array by adding copies of all the projectData objects
//     return new Promise((resolve, reject) => {
//         sequelize.sync().then(() =>{
//             console.log("SECTOR DATA:", sectorData);
//             return Sector.bulkInsert(sectorData, { ignoreDuplicates: true });
//         })
//         .then(()=>{
//             return Project.bulkInsert(projectData, { ignoreDuplicates: true });
//         })
//         .catch((err)=>{
//             console.log(err);
//             reject("Unable to initialize the database");
//         })
//         });
// }

function initialize() {
    return new Promise((resolve) => {
        setTimeout(() => {
            sequelize.sync()
                .then((p) => {
                    console.log("Synced to database");
                    resolve(p);
                })
                .catch((err) => {
                    console.log(err);
                    process.exit();
                });
        });
        
    })
}
function getAllProjects(){
    //returns the complete "projects" array
    return new Promise((resolve, reject) => {
        sequelize.sync().then(()=> {
            Project.findAll({ include: Sector, raw: true })
            .then((projects) => {
                resolve(projects);
                console.log("Retrieved projects.");
            })
            .catch((err)=>{
                reject("Unable to fetch projects");
            });
        })
        .catch((err)=>{
        reject("Database sync rejected.");
    });
    });
}

function getProjectById(projectData){
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            Project.findAll({
                where: { id: projectData },
                include: [Sector]
            })
            .then((projects) => {
                if (projects.length > 0) {
                    resolve(projects[0]);
                } else {
                    reject("Unable to find requested project");
                }
            })
            .catch((err) => {
                reject(err);
            });
            })
            .catch((err) => {
                reject(err);
            });
    });
}

function getProjectsBySector(sector){
    //return an array of objects from the projects array whose sector value matches that sector parameter. ;
    //"sector" parameter may contain only part of the sector string.
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            Project.findAll({
                where: { '$Sector.sector_name$': {[Sequelize.Op.iLike]: `%${sector}%`}},
                include: [Sector]
            })
            .then((projects) => {
                if (projects.length > 0) {
                    resolve(projects);
                } else {
                    reject("Unable to find requested project");
                }
            })
            .catch((err) => {
                // console.error(err);
                reject(err);
            });
            })
            .catch((err) => {
                // console.error(err);
                reject(err);
            });
})
}

function getAllSectors(){
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            Sector.findAll({raw:true})
            .then((sector) => {
                resolve(sector)
            })
            .catch((err) => reject("Unable to fetch sectors"));
        })
        .catch((err) => {
            console.log(err.errors[0].message);
        })
    })
}

function addProject(projectData){
    return new Promise ((resolve, reject) => {
        sequelize.sync().then(()=>{
            Project.create({
                title: projectData.title,
                feature_img_url: projectData.feature_img_url,
                summary_short: projectData.summary_short,
                intro_short: projectData.intro_short,
                impact: projectData.impact,
                original_source_url: projectData.original_source_url,
                sector_id: projectData.sector_id
            })
            .then(() => resolve ())
            .catch((err)=>{
                reject(err.errors[0].message);
            })
        })
    })
}

module.exports = { 
    Sector,
    Project,
    initialize,
    getAllProjects,
    getProjectById,
    getProjectsBySector,
    addProject,
    getAllSectors
};

