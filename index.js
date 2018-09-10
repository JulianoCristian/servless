const RouteStackLayer = require("./RouteStackLayer").inject();
const Promise = require("bluebird");

var _instanceOfServless = null;

function Servless(config) {
    this.config = config;

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
    console.log(event.resource);
    console.log(event.requestContext.httpMethod);

    let f = _instanceOfServless.getRoot().getFunctionByPathAndCommand(event.resource, event.requestContext.httpMethod);

    console.log("found function");
    return f(event, context).then(result =>{
        callback(null, {StatusCode:200, Body:JSON.stringify(result)});
    })
    .catch(err =>{
        return {StatusCode:500, Body:JSON.stringify(err)}
    })
};

exports.initWithConfig = function (_options) {
    _instanceOfServless = new Servless(_options);
    return _instanceOfServless
};

module.exports = exports;
