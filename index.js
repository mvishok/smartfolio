#!/usr/bin/env node
//Smartfolio is an application that converts your LinkedIn and GitHub profiles into an Autobase API

import { program } from "commander";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";
import chalk from "chalk";
import inquirer from "inquirer";
import create from "./writer.js";

//get current path
const currentPath = process.cwd();

const languages = {};

const projects = [];
const repositories = [];
async function projectsParse(linkedinData, githubData) {
    let githubRepos = githubData.repos_url;
    if (!githubRepos) {
        console.log(chalk.red("The GitHub username is not valid. Please try again."));
        return;
    }
    let githubReposData = await fetch(githubRepos);
    githubReposData = await githubReposData.json();

    let linkedinProjects = linkedinData.projects;

    for (const project of linkedinProjects) {
        const repo = githubReposData.find(repo => repo.name.toLowerCase() === project.name.toLowerCase());
        if (!repo) continue;

        projects.push({
            name: project.name,
            description: project.summary || repo.description,
            url: project.url || repo.homepage || repo.html_url,
            start: project.startDate,
            end: project.endDate,
            github: repo.html_url,
            updated: new Date(repo.updated_at).getTime(),
            size: repo.size,
            language : repo.language,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            watchers: repo.watchers_count,
            issues: repo.open_issues_count,
            license: repo.license?.key || "None"
        });
    }

    //now repositories: add basic info about the repositories to the repositories array
    for (const repo of githubReposData) {
        //get the languages used in the project from the githubRepoData.languages_url
        let languagesUsed = await fetch(repo.languages_url);
        languagesUsed = await languagesUsed.json();

        for (let language in languagesUsed) {
            //if language is present in the languages object, add the bytes to it
            if (languages[language.toLocaleLowerCase()] !== undefined) {
                languages[language.toLocaleLowerCase()] += languagesUsed[language];
            }
        }
        
        repositories.push({
            name: repo.name,
            description: repo.description,
            url: repo.homepage || repo.html_url,
            github: repo.html_url,
            updated: new Date(repo.updated_at).getTime(),
            size: repo.size,
            language : repo.language,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            watchers: repo.watchers_count,
            issues: repo.open_issues_count,
            license: repo.license
        });
    }
}

const certificates = [];
function certificatesParse(linkedinData) {
    for (const certificate of linkedinData.certificates) {
        certificates.push({
            name: certificate.name,
            authority: certificate.authority,
            url: certificate.url,
            date: certificate.startDate,
        });
    }
}

const work = [];
function workParse(linkedinData) {
    for (const job of linkedinData.work) {
        work.push({
            company: job.name,
            position: job.position,
            start: job.startDate,
            end: job.endDate || "Present",
            description: job.summary,
            url: job.url,
            location: job.location
        });
    }
}

const education = [];
function educationParse(linkedinData) {
    for (const school of linkedinData.education) {
        education.push({
            name: school.institution,
            degree: school.studyType,
            field: school.area,
            start: school.startDate,
            end: school.endDate,
            score: school.score,
            courses: school.courses
        });
    }
}

program
    .version("1.0.0")
    .description("Smartfolio CLI");

program.command("generate")
    .description("Generate a new Autobase API from your LinkedIn and GitHub profiles")
    .action(async () => {
        const profile = {};

        //instruct user on how to export linkedin to json
        console.log(chalk.blue("Please export your LinkedIn profile to JSON format by following the instructions below:\n"));

        //install json resume exporter extension
        console.log(chalk.green("1. Install the JSON Resume Exporter extension from the Chrome Web Store:"));
        console.log(chalk.blue(" - https://chromewebstore.google.com/detail/json-resume-exporter/caobgmmcpklomkcckaenhjlokpmfbdec\n"));

        console.log(chalk.green("2. Export your LinkedIn profile to JSON format using the JSON Resume Exporter extension:"));
        console.log(chalk.blue(" - Goto https://www.linkedin.com/in/me"));
        console.log(chalk.blue(" - Click on the extension icon in the top right corner of your browser"));
        console.log(chalk.blue(" - Click on the button with save icon"));
        console.log(chalk.blue(" - Save the JSON file to your computer"));
        console.log(chalk.blue(" - Copy the path to the JSON file"));

        //ask user for the path to the linkedin json file synchronously
        let linkedinPath = await inquirer.prompt([
            {
                type: "input",
                name: "linkedinPath",
                message: "Enter the path to the JSON file that you saved from LinkedIn:"
            }]);
        linkedinPath = resolve(join(currentPath, linkedinPath.linkedinPath));

        //check if the linkedin json file exists
        if (!existsSync(linkedinPath)) {
            console.log(linkedinPath);
            console.log(chalk.red("The file does not exist. Please try again."));
            return;
        }

        //check if linkedin json file is valid
        let linkedinData;
        try {
            linkedinData = JSON.parse(readFileSync(linkedinPath));
        } catch (error) {
            console.log(chalk.red("The file is not a valid JSON file. Please try again."));
            console.error(error);
            return;
        }

        //get the github username from the user
        let githubUsername = await inquirer.prompt([
            {
                type: "input",
                name: "githubUsername",
                message: "Enter your GitHub username:"
            }]);

        //check if the github username is valid
        if (!githubUsername.githubUsername) {
            console.log(chalk.red("The GitHub username is not valid. Please try again."));
            return;
        }

        //fetch the github profile data
        let githubData;
        try {
            githubData = await fetch(`https://api.github.com/users/${githubUsername.githubUsername}`);
            githubData = await githubData.json();
        } catch (error) {
            console.log(chalk.red("The GitHub username is not valid. Please try again."));
            console.error(error);
            return;
        }

        profile.name = linkedinData.basics.name || githubData.name;
        profile.avatar = githubData.avatar_url || "";
        profile.email = linkedinData.basics.email || githubData.email;
        profile.where = linkedinData.basics.location.address || "";
        profile.bio = linkedinData.basics.label || "";
        profile.about = linkedinData.basics.summary || "";
        profile.languages = linkedinData.languages || {};
        profile.title = githubData.bio || "";
        profile.company = githubData.company || "";
        profile.repos = githubData.public_repos || 0;

        profile.contact = { phone: linkedinData.basics.phone, website: linkedinData.basics.website, linkedin: linkedinData.basics.profiles[0].url, github: githubData.html_url, twitter: (githubData.twitter_username) ? "https://x.com/" + githubData.twitter_username : "" };
        profile.usernames = { linkedin: linkedinData.basics.profiles[0].username, github: githubData.login, twitter: githubData.twitter_username };

        for (const skill of linkedinData.skills) {
            //if it is a single word, add it to the languages object
            if (skill.name.split(" ").length === 1) {
                languages[skill.name.toLowerCase()] = 0;
            }
        }

        await projectsParse(linkedinData, githubData);

        //remove all languages that have 0 bytes
        for (let language in languages) {
            if (languages[language] === 0) {
                delete languages[language];
            }
        }

        profile.languages = languages;

        certificatesParse(linkedinData);

        educationParse(linkedinData);

        workParse(linkedinData);

        if (create(profile, projects, repositories, certificates, work, education, currentPath)){
            console.log(chalk.blue("Please run the following command to start the server:"));
            console.log(chalk.blue("cd " + currentPath + "/smartfolio"));
            console.log(chalk.blue("autobase config.json"));
        } else {
            console.log(chalk.red("An error occurred while creating the files. Please try again."));
        }
    });


program.parse(process.argv);
