const underscore = require('underscore');
const Promise = require("bluebird");

underscore.extend(module.exports, {newInst: function init(_options) {
        function PassThruResource(config) {
        };

        PassThruResource.prototype.getNameForResource = function() {
            return null;
        };

        PassThruResource.prototype.getReferenceNameForResource = function() {
            return "";
        };

        PassThruResource.prototype.shouldAddReferenceToCallingFunction = function() {
            return false;
        };

        PassThruResource.prototype.getPolicyList = function() {
            return [];
        };

        PassThruResource.prototype.getInjectedValueForCall = function(event, context) {
            return Promise.resolve({event: event,
                context:  context});
        };

        PassThruResource.prototype.isRemoteResource = function(){
            return false;
        };

        PassThruResource.prototype.getJSONForResource = function(){
            return null;
        };

        return new PassThruResource(_options);
    }});