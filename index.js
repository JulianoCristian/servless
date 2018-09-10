const RouteStackLayer = require("./RouteStackLayer").inject();

module.exports = function(_options){

    function handleCall(event, context) {
        console.log("inside the app for realz");
        return {
            StatusCode: 200,
            Body: JSON.stringify({
                message: 'Go Serverless v1.0! Your function executed successfully!'
            }),
        }
    };

    function Servless(config) {
        this.config = config;
        this.AwsPolicies = require("./AwsPolicies").inject(this.config);

        this.endPoints = [];
        this.enviornmentVariables = [];
        this.root = null;
    };

    Servless.prototype.route = function(path) {
        this.root = RouteStackLayer.route(path);
        return this.root;
    };

    Servless.prototype.getPolicies = function() {
        return this.AwsPolicies.getPolicies(this.config);
    };

    Servless.prototype.getRoot = function(){
        return this.root;
    };

    return new Servless(_options);
};