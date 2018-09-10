const RouteStackLayer = require("./RouteStackLayer").inject();
const Promise = require("bluebird");

var _instanceOfServless = null;

function Servless(config) {
    this.config = config;
    this.AwsPolicies = require("../../servless-cli/AwsPolicies").inject(this.config);

    this.endPoints = [];
    this.enviornmentVariables = [];
    this.root = null;
};

Servless.prototype.route = function(path) {
    this.root = RouteStackLayer.route(path);
    return this.root;
};

Servless.prototype.getRoot = function() {
    return this.root
};

exports.getCurrentInstance = function(){
    return _instanceOfServless;
};

exports.handleCall = function(event, context, callback) {
    console.log("here");
    console.log(JSON.stringify(event, null, 4));
    console.log(JSON.stringify(context, null, 4));
    callback(null, {StatusCode:200, Body:JSON.stringify({
            "policies": policies
        })
    });
    };

exports.initWithConfig = function (_options) {
    _instanceOfServless = new Servless(_options);
    return _instanceOfServless
};


module.exports = exports;
/*
module.exports = function(_options){



    return new Servless(_options);
};*/