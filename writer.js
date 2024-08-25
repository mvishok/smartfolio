import { randomBytes } from "crypto";
import {existsSync, mkdirSync, writeFileSync} from "fs";
import { stringify } from "csv-stringify/sync";
import chalk from "chalk";

export default function create(profile, projects, repositories, certificates, work, education, cdir) {
    const token = randomBytes(16).toString("hex");

    //create folder "smartfolio" in path
    if (!existsSync(cdir + "/smartfolio")) {
        mkdirSync(cdir + "/smartfolio");
    } else {
        console.log(chalk.red("The folder smartfolio already exists. Please try on a different directory."));
        return;
    }

    //create .env file
    writeFileSync(cdir + "/smartfolio/.env", `AB_AUTH={"${token}":"write"}`);

    //create config.json file
    const config = {
        "port": 5000,
        "dir": "./data",
        "env": ".env"
    }
    writeFileSync(cdir + "/smartfolio/config.json", JSON.stringify(config, null, 4));

    //create data folder
    if (!existsSync(cdir + "/smartfolio/data")) {
        mkdirSync(cdir + "/smartfolio/data");
    } else {
        console.log(chalk.red("The folder data already exists. Please try on a different directory."));
        return;
    }

    //create profile.csv file
    try {
        let profileCSV = stringify([{
            name: profile.name, avatar: profile.avatar, email: profile.email, where: profile.where, bio: profile.bio, about: profile.about, languages: JSON.stringify(profile.languages), title: profile.title, company: profile.company, repos: profile.repos, 
            contacts: JSON.stringify(profile.contact), usernames: JSON.stringify(profile.usernames)
        }], { header: true });
        writeFileSync(cdir + "/smartfolio/data/profile.csv", profileCSV);
    } catch (error) {
        console.error(error);
        return;
    }

    //create projects.csv file
    try {
        let projectsCSV = stringify(projects, { header: true });

        writeFileSync(cdir + "/smartfolio/data/projects.csv", projectsCSV);
    } catch (error) {
        console.error(error);
        return;
    }

    //create repositories.csv file
    try {
        let repositoriesCSV = stringify(repositories, { header: true });

        writeFileSync(cdir + "/smartfolio/data/repositories.csv", repositoriesCSV);
    } catch (error) {
        console.error(error);
        return;
    }

    //create certificates.csv file
    try {

        let certificatesCSV = stringify(certificates, { header: true });

        writeFileSync(cdir + "/smartfolio/data/certificates.csv", certificatesCSV);
    } catch (error) {
        console.error(error);
        return;
    }

    //create work.csv file
    try {
        let workCSV = stringify(work, { header: true });

        writeFileSync(cdir + "/smartfolio/data/work.csv", workCSV);
    } catch (error) {
        console.error(error);
        return;
    }

    //create education.csv file
    try {
        let educationCSV = stringify(education, { header: true });

        writeFileSync(cdir + "/smartfolio/data/education.csv", educationCSV);
    } catch (error) {
        console.error(error);
        return;
    }

    console.log(chalk.green("Smartfolio created successfully!"));
    return true;
}