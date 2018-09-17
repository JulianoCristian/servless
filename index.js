const RouteTree = require("./RouteTree");
const Resources = require("./Resources");
const LambdaApiGatewayEventGenerator = require("./aws/LambaApiGatewayEventGenerator");
const PassThruResource = require("./aws/PassThruResource");


var _routeToFunctionMap = null;
var _instanceOfServless = null;

function Servless(config) {
    this.resources = Resources.newInst(config);
    this.resources.injectableResource("event", PassThruResource.newInst());

    this.lambdaGenerator = LambdaApiGatewayEventGenerator.newInst(this.resources);
    this.root = null;
};

Servless.prototype.route = function(path, subroutes) {
    this.root = RouteTree.newInst().route(path, subroutes);
    return this.root;
};

Servless.prototype.getRoot = function() {
    return this.root
};

Servless.prototype.getEvents = function() {
    let eventGenerator = LambdaApiGatewayEventGenerator.newInst({resources: this.resources});

    return this.root.getAllRoutes().map(route => {
        return eventGenerator.generateEvent(route.routeObject);
    });
    //eventGenerator.generateEvent()
};

Servless.prototype.getResources = function(resources) {
    return this.resources;
};

Servless.prototype.addResources = function(resources) {
    return this.addResource(resources)
};

Servless.prototype.addResource = function(resources) {
    if(Array.isArray(resources) === true){
        resources.map(elem => {
            this.resources.injectableResource(elem.getNameForResource(), elem);
        });
    }
    else{
        this.resources.injectableResource(resources.getNameForResource(), resources);
    }
    return this;
};

exports.getCurrentInstance = function(){
    return _instanceOfServless;
};

exports.handleCall = function(event, context, callback) {
    console.log(event.resource);
    console.log(event.requestContext.httpMethod);

    // we only need to build this once, so if its null, pay the cost and build the whole thing
    if(_routeToFunctionMap === null){
        _routeToFunctionMap = {};
        _instanceOfServless.getEvents().forEach(elem => {
            _routeToFunctionMap[elem.getFullPath()] = {
                resources: elem.get
            }
        })
    }

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

exports.Resources = function (_options) {
    return Resources.newInst(_options);
};

exports.DynamoResource = function (_options) {
    return require("./aws/DynamoResource").newInst(_options);
};

exports.Routes = function () {
    return RouteTree.newInst().route();
};

module.exports = exports;