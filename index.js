const core = require('@actions/core');
const github = require('@actions/github');

try {
    getPackageJsonPath();
    getAssemblyInfoPath();
    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = JSON.stringify(github.context.payload, undefined, 2)
    console.log(`The event payload: ${payload}`);
} catch (error) {
    core.setFailed(error.message);
}

function getPackageJsonPath()
{
    const path = core.getInput('package-json-path');
    console.log('package-json-path: ' + path);
    core.setOutput('package-json-path', path);
}

function getAssemblyInfoPath()
{
    const path = core.getInput('assembly-info-path');
    console.log('assembly-info-path: ' + path);
    core.setOutput('assembly-info-path', path);
}

