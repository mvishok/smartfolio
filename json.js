//json export all these data to cdir/smartfolio/ with respective filenames
import {writeFileSync, existsSync, mkdirSync} from "fs";
import chalk from "chalk";

export default function write(profile, projects, repositories, certificates, work, education, cdir) {
    //create folder "smartfolio" in path
    if (!existsSync(cdir + "/smartfolio")) {
        mkdirSync(cdir + "/smartfolio");
    } else {
        console.log(chalk.red("The folder smartfolio already exists. Please try on a different directory."));
        return;
    }

    //create profile.json
    try {
        writeFileSync(cdir + "/smartfolio/profile.json", JSON.stringify(profile, null, 4));
    } catch (error) {
        console.log(chalk.red("Error creating profile.json"));
    }

    //create projects.json
    try {
        writeFileSync(cdir + "/smartfolio/projects.json", JSON.stringify(projects, null, 4));
    } catch (error) {
        console.log(chalk.red("Error creating projects.json"));
    }

    //create repositories.json
    try {
        writeFileSync(cdir + "/smartfolio/repositories.json", JSON.stringify(repositories, null, 4));
    } catch (error) {
        console.log(chalk.red("Error creating repositories.json"));
    }

    //create certificates.json
    try {
        writeFileSync(cdir + "/smartfolio/certificates.json", JSON.stringify(certificates, null, 4));
    } catch (error) {
        console.log(chalk.red("Error creating certificates.json"));
    }

    //create work.json
    try {
        writeFileSync(cdir + "/smartfolio/work.json", JSON.stringify(work, null, 4));
    } catch (error) {
        console.log(chalk.red("Error creating work.json"));
    }

    //create education.json
    try {
        writeFileSync(cdir + "/smartfolio/education.json", JSON.stringify(education, null, 4));
    } catch (error) {
        console.log(chalk.red("Error creating education.json"));
    }

    console.log(chalk.green("JSON files created successfully"));
    return true;
}