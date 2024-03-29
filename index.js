require('dotenv').config();
const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');

const semverRegex = /\("\d.\d.\d(.\d)?"\)/g;

try {
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
    const commit = github.context.payload.head_commit;
    var type = "none";
    if(commit.message.startsWith('fix:')){
        type ="patch";
    }
    else if(commit.message.startsWith('feat:')){
        type = 'minor',
        console.log('new feature');
    }
    else if(commit.message.startsWith('BREAKING CHANGE:')){
        type = "major"
        console.log('BREAKING CHANGE');
    }
    else {
        core.setOutput('require-update', false);
        process.exit(0);
    }
    core.setOutput('require-update', true);
    switch(type){
        case "major":
            versionObj.major++;
            versionObj.minor = 0;
            versionObj.patch = 0;
            console.log('Major Update');
            break;
        case "minor":
            versionObj.minor++;
            versionObj.patch = 0;
            console.log('Minor Update');
            break;
        case "patch":
            versionObj.patch++;
            console.log('Patch');
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
} catch (error) {
    core.setFailed(error.message);
}

function getPackageJson(path)
{
    if(!fs.existsSync(path)) throw new Error('package.json not found at the given path: ' + path);
    return require(path);
}

function getAssemblyInfo(path)
{
    if(!fs.existsSync(path)) throw new Error('AssemblyInfo.cs not found at the given path: ' + path);
    return fs.readFileSync(path);
}