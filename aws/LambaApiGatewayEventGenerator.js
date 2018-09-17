const underscore = require('underscore');
const servlessUtils = require("../utils");
const LambdaApiGatewayEvent = require("./LambaApiGatewayEvent");
const flatten = require("flatten");

underscore.extend(module.exports, {newInst: function init(_options) {
        function LambdaApiGatewayGatewayEvent(config) {
            if (config === undefined) {
                config = {};
            }
            this.resources = config["resources"] || null;
        };

        LambdaApiGatewayGatewayEvent.prototype.generateEvent = function(theRouteObject){
            var pathComponents = theRouteObject.getFullPathComponents();
            var command = theRouteObject.getCommand();
            var funcArgNames = servlessUtils.getArguments(theRouteObject.getFunction());

            var resourceList = [];

            self = this;

            funcArgNames.map(elem => {
                if(self.resources.doesResourceExists(elem) === false){
                    throw("Cannot find resource for argument name " + elem);
                }

                resourceList.push(self.resources.getResource(elem));
            });

            var config = {};
            config["fullPathComponents"] = pathComponents;
            config["command"] = command;
            config["resources"] = resourceList;
            config["environment"] = [];
            config["policies"] = flatten(resourceList.map(elem =>{
                var policies = elem.getPolicyList();
                return policies;
            }));

            return LambdaApiGatewayEvent.newInst(config);
        };

        return new LambdaApiGatewayGatewayEvent(_options);
    }});