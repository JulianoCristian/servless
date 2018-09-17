const underscore = require('underscore');

underscore.extend(module.exports, {newInst: function init(_options) {
        function PassThruResource(config) {
        };

        PassThruResource.prototype.getNameForResource = function() {
            return null;
        };

        PassThruResource.prototype.getPolicyList = function() {
            return [];
        };

        PassThruResource.prototype.getInjectedValueForCall = function(event, context) {
            return {event: event,
                    context:  context};
        };

        PassThruResource.prototype.getJSONForResource = function(){
            return null;
        };

        return new PassThruResource(_options);
    }});