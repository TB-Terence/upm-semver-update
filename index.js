require('dotenv').config();
const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');

//const semverRegex = /Version\("^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$"\)/;
const semverRegex = /\("\d.\d.\d(.\d)?"\)/g;

try {
    console.log(github);
    const packageJsonPath = process.env.PACKAGE_JSON_PATH || core.getInput('package-json-path');
    const packageJson = getPackageJson(packageJsonPath);
    const assemblyInfoPath = process.env.ASSEMBLY_INFO_PATH || core.getInput('assembly-info-path');
    var assemblyInfo = getAssemblyInfo(assemblyInfoPath).toString();
    const currentVersion = packageJson.version.toString().split('.');
    var versionObj = {
        major: currentVersion[0],
        minor: currentVersion[1],
        patch: currentVersion[2]
    }
    console.log(versionObj);

    const commit = github.context.payload.head_commit;
    const type = "patch";
    if(commit.includes('feat')){
        type = 'minor',
        console.log('new feature');
    }
    else if(commit.message.includes('BREAKING CHANGE')){
        type = "major"
        console.log('BREAKING CHANGE');
    }
    switch(type){
        case "major":
            versionObj.major++;
            versionObj.minor = 0;
            versionObj.patch = 0;
            break;
        case "minor":
            versionObj.minor++;
            versionObj.patch = 0;
                break;
        case "patch":
            versionObj.patch++;
            break;
    }
    const newVersion = `${versionObj.major}.${versionObj.minor}.${versionObj.patch}`;
    core.setOutput('new-version', newVersion);
    packageJson.version = newVersion;
    assemblyInfo = assemblyInfo.replace(semverRegex, `("${newVersion}.0")`);
    fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), (error) => {
        if(error) return console.log(error);
    });
    fs.writeFile(assemblyInfoPath, assemblyInfo, (error) => {
        if(error) return console.log(error);
    });
    // Get the JSON webhook payload for the event that triggered the workflow
    //const payload = JSON.stringify(github.context.payload, undefined, 2)
    //console.log(`The event payload: ${payload}`);
} catch (error) {
    core.setFailed(error.message);
}

function getPackageJson(path)
{
    if(!fs.existsSync(path)) throw new Error('package.json not found at the given path: ' + path);
    core.setOutput('package-json-path', path);
    return require(path);
}

function getAssemblyInfo(path)
{
    if(!fs.existsSync(path)) throw new Error('AssemblyInfo.cs not found at the given path: ' + path);
    core.setOutput('assembly-info-path', path);
    return fs.readFileSync(path);
}