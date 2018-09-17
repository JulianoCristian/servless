const underscore = require('underscore');

underscore.extend(module.exports, {newInst: function init(_options) {
        function Resources(config) {
            if (config === undefined) {
                config = {};
            }
            this.config = config;
            this.resourceHash = {};
        };

        Resources.prototype.injectableResource = function(injectionName, resource){
            this.resourceHash[injectionName] = resource;
        };

        Resources.prototype.getResourceHash = function(){
            return this.resourceHash;
        };

        Resources.prototype.doesResourceExists = function(name){
            return name in this.resourceHash;
        };

        Resources.prototype.getResource = function(name){
            return this.resourceHash[name];
        };


        return new Resources(_options);
    }});