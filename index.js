const co = require('co');
const dockerHubApi = require("docker-hub-api");
const ORGANIZATION = process.env.ORGANIZATION || 'eccube';

co(function*() {
    let repositories = yield dockerHubApi.repositories(ORGANIZATION);
    let success = true;
    for (let repo of repositories) {
        let builds = yield dockerHubApi.buildHistory(repo.namespace, repo.name);
        let statuses = builds.sort((l, r) => { return r.id - l.id }).reduce((acc, build) => {
            if (!acc.has(build['dockertag_name'])) {
                acc.set(build['dockertag_name'], build.status);
            }
            return acc;
        }, new Map());
        success = success && Array.from(statuses.values()).reduce((acc, val) => Math.min(acc, val), 1);
        statuses.forEach((status, tag) => {
            let label = status < 0 ? `\u001b[31mNG\u001b[0m` : `\u001b[32mOK\u001b[0m`;
            console.log(`${repo.namespace}/${repo.name}:${tag} ${label}`);
        });
    }
    return success;
}).then(function(success) {
    if (!success) {
        process.exit(1);
    }
});