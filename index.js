const AwsPolicies = require("./aws-policies");

function Servless(config) {
    this.config = config;
}

Servless.prototype.getPolicies = function(teamId) {
    return AwsPolicies.getPolicies(this.config);
}

exports.getPolicies = function(){

};

module.exports = Servless;