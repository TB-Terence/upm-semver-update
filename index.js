const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('child_process');
const { existsSync  } = require('fs');

try {
    const packageJson = getPackageJson();
    const assemblyInfo = getAssemblyInfo();

    console.log("Current package version: " + packageJson.version.toString());
    const assemblyVersion = assemblyInfo.match(/AssemblyVersion\("\d.\d.\d(.\d)?"\)/);
    const assemblyFileVersion = assemblyInfo.match(/AssemblyFileVersion\("\d.\d.\d.\d"\)/);
    console.log(assemblyVersion);
    console.log(assemblyFileVersion);
    // Get the JSON webhook payload for the event that triggered the workflow
    //const payload = JSON.stringify(github.context.payload, undefined, 2)
    //console.log(`The event payload: ${payload}`);
} catch (error) {
    core.setFailed(error.message);
}

function getPackageJson()
{
    const path = core.getInput('package-json-path');
    if(!fs.execSync(path)) throw new Error('package.json not found at the given path: ' + path);
    console.log('package-json-path: ' + path);
    core.setOutput('package-json-path', path);
    return require(path);
}

function getAssemblyInfo()
{
    const path = core.getInput('assembly-info-path');
    if(!fs.execSync(path)) throw new Error('AssemblyInfo.cs not found at the given path: ' + path);
    console.log('assembly-info-path: ' + path);
    core.setOutput('assembly-info-path', path);
    return fs.readFileSync(path);
}

