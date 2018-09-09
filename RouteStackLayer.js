const underscore = require('underscore');

underscore.extend(module.exports, {inject: function init(_options) {
        function RouteStackLayer(config) {
            this.config = config;
            this.requiredPolicies = [];
            this.parent = this.config["parent"] || null;
            this.command = config["command"] || "";
            this.path = config["path"] || "";
            this.children = [];
        };

        RouteStackLayer.prototype.getCurrentConfig = function(){
            return {
                parent: this.config["parent"],
                command: config["command"],
                path: config["path"]
            }
        };

        RouteStackLayer.prototype.needs = function(policies){
            if(arguments.length === 1){
                policies = arguments[0];

                if(underscore.isArguments(policies)){
                    return this._internalNeedsAsArray(policies)
                }
                else{
                    return this._internalNeedsAsArray([policies])
                }
            }
            else{
                return this._internalNeedsAsArray(arguments)
            }
        };

        RouteStackLayer.prototype._internalNeedsAsArray = function(policiesList){
            this.requiredPolicies = this.requiredPolicies.concat(policiesList);
            return this;
        };

        // READ
        RouteStackLayer.prototype.get = function(){
            let config = this.getCurrentConfig();
            config["command"] = "GET";
            config["parent"] = this;
            this.children.push(new RouteStackLayer(config));
            return this;
        };

        // UPDATE
        RouteStackLayer.prototype.put = function(){
            let config = this.getCurrentConfig();
            config["command"] = "PUT";
            config["parent"] = this;
            this.children.push(new RouteStackLayer(config));
            return this;
        };

        // CREATE
        RouteStackLayer.prototype.post = function(){
            let config = this.getCurrentConfig();
            config["command"] = "POST";
            config["parent"] = this;
            this.children.push(new RouteStackLayer(config));
            return this;
        };

        // DELETE
        RouteStackLayer.prototype.delete = function(){
            let config = this.getCurrentConfig();
            config["command"] = "DELETE";
            config["parent"] = this;
            this.children.push(new RouteStackLayer(config));
            return this;
        };

        RouteStackLayer.prototype.route = function(path){
            let config = this.getCurrentConfig();
            config["path"] = path;
            config["parent"] = this;
            return this.children.push(new RouteStackLayer(config));
        };

        RouteStackLayer.prototype.getFullPath = function(){
            if(this.parent !== null) {
                return path.join(this.parent.getFullPath(), this.config.path)
            }
            else{
                return this.config["path"];
            }
        };

        RouteStackLayer.prototype.getCommand = function(){
            return this.command;
        };

        RouteStackLayer.prototype.getRequiredAWSPolicies = function(){
            if(this.parent !== null){
                let alreadyThereHash = {};
                return this.parent.getRequiredAWSPolicies().concat(this.requiredPolicies)
                    .filter(elem => {
                        // use filter to remove duplicates with the help of a hash table
                        // whenever we see an element add it the the hash with a true value
                        // if we haven't see it, that means it should go in the array,
                        // if we have that means discard it
                        if(alreadyThereHash[elem] == true){
                            return false
                        }
                        else{
                            alreadyThereHash[elem] = true;
                            return true;
                        }
                    });
            }
            else{
                return this.requiredPolicies
            }
        };

        return new RouteStackLayer(_options);
    }});