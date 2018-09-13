const RouteTree = require("./RouteTree");

var _instanceOfServless = null;

function Servless(config) {
    this.config = config;

    this.endPoints = [];
    this.enviornmentVariables = [];
    this.root = null;
};

Servless.prototype.route = function(path, subroutes) {
    this.root = RouteTree.newInst().route(path, subroutes);
    return this.root;
};

Servless.prototype.getRoot = function() {
    return this.root
};

exports.getCurrentInstance = function(){
    return _instanceOfServless;
};

exports.handleCall = function(event, context, callback) {
    console.log(event.resource);
    console.log(event.requestContext.httpMethod);

    let f = _instanceOfServless.getRoot().getFunctionByPathAndCommand(event.resource, event.requestContext.httpMethod);

    return f(event, context).then(result =>{
        callback(null, {
            isBase64Encoded: false,
            headers: { "Content-Type": "application/json" },
            statusCode:200,
            body:JSON.stringify(result)});
    })
    .catch(err =>{
        return {
            statusCode:500,
            isBase64Encoded: false,
            headers: { "Content-Type": "application/json" },
            body:JSON.stringify(err)
        }
    })
};

exports.App = function (_options) {
    _instanceOfServless = new Servless(_options);
    return _instanceOfServless;
};

exports.Routes = function () {
    return RouteTree.newInst().route();
};

module.exports = exports;