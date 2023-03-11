class Task {
    constructor(config, rule, taskId) {
        this.config = config;
        this.rule = rule;
        this.taskId = taskId;
    }
}
class Rule {
    constructor(urlMap) {
        this.urlMap = urlMap;
    }
}

module.exports = {
    Task, Rule
}