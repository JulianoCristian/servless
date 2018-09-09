const RouteStackLayer = require("./RouteStackLayer").inject();

module.exports = function(_options){

    function Servless(config) {
        this.config = config;
        this.AwsPolicies = require("./AwsPolicies").inject(this.config);

        this.endPoints = [];
        this.enviornmentVariables = [];
    }

    Servless.prototype.route = function(path) {
        return RouteStackLayer.route(path);
    };

    Servless.prototype.getPolicies = function() {
        return this.AwsPolicies.getPolicies(this.config);
    };

    return new Servless(_options);
};