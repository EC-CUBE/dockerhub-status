const co = require('co');
const dockerHubApi = require("docker-hub-api");
const ORGANIZATION = process.env.ORGANIZATION || 'eccube';

co(function*() {
    let repositories = yield dockerHubApi.repositories(ORGANIZATION);
    let success = true;
    for (let repo of repositories) {
        let builds = yield dockerHubApi.buildHistory(repo.namespace, repo.name);
        let latest = builds[0];
        success = success && (latest.status > 0);
        console.log(`${repo.namespace}/${repo.name}: ${latest.status}`);
    }
    return success;
}).then(function(success) {
    if (!success) {
        process.exit(1);
    }
});