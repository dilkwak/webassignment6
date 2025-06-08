const projectData = require("../data/projectData");
const sectorData = require("../data/sectorData");

let projects = [];

function initialize(){
    //fill the projects array by adding copies of all the projectData objects
    return new Promise((resolve, reject) => {
    
        projectData.forEach((word) => {
            sectorData.forEach((sector) => {
                if(sector.id === word.sector_id) {
                    const newPrj = {
                        id: word.id,
                        sector_id: word.sector_id,
                        title: word.title,
                        feature_img_url: word.feature_img_url,
                        summary_short: word.summary_short,
                        intro_short: word.intro_short,
                        impact: word.impact,
                        original_source_url: word.original_source_url,
                        sector: sector.sector_name
                    };
                    projects.push(newPrj);
                }
            });
        });
        resolve();
    })


}

function getAllProjects(){
    //returns the complete "projects" array
    return new Promise((resolve, reject) => {
        resolve(projects);
    });
}

function getProjectById(projectId){
    //return a specific project object from the "projects" array whose "id" value matches the value of the "projectId" parameter. 
    return new Promise((resolve, reject) => {
        let resultID = projects.find((prj) => {return prj.id === projectId});
        if (resultID == undefined){
            reject('Unable to find requested project');
        } else {
            resolve(resultID);

        }
    });
}


function getProjectsBySector(sector){
    //return an array of objects from the projects array whose sector value matches that sector parameter. ;
    //"sector" parameter may contain only part of the sector string.
    return new Promise((resolve, reject) => {
        let sectorLow = sector.toLowerCase();
        //console.log(sectorLow);
        console.log(projects);
        let matchPrj = projects.filter((prj) => {return prj.sector.toLowerCase().includes(sectorLow)});
        console.log(matchPrj);

        if(matchPrj.length == 0) {
            reject('Unable to find requested project');
        } else {
            resolve(matchPrj);
        }
    });
}

module.exports = { initialize, getAllProjects, getProjectById, getProjectsBySector };
