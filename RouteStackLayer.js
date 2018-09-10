const underscore = require('underscore');
const path = require("path");
const flatten = require('flatten');
const Promise = require("bluebird");

function formatPath(path){
    // make sure the path starts with a slash and has no trailing slash
    if(path.startsWith("/") === false){
        path = "/" + path;
    }

    if(path.endsWith("/") === true && path.length > 1){
        path = path.substring(0, path.length - 1);
    }

    return path;
}

underscore.extend(module.exports, {inject: function init(_options) {
        function RouteStackLayer(config) {
            if(config === undefined){
                config = {};
            }
            this.requiredPolicies = [];
            this.parent = config["parent"] || null;
            this.command = config["command"] || "";
            this.path = config["path"] || "";
            this.children = [];
        };

        RouteStackLayer.prototype.getCurrentConfig = function(){
            return {
                parent: this.parent,
                command: this.command,
                path: this.path
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
            config["path"] = "";
            config["command"] = "GET";
            config["parent"] = this;
            this.children.push(new RouteStackLayer(config));
            return this;
        };

        // UPDATE
        RouteStackLayer.prototype.put = function(){
            let config = this.getCurrentConfig();
            config["path"] = "";
            config["command"] = "PUT";
            config["parent"] = this;
            this.children.push(new RouteStackLayer(config));
            return this;
        };

        // CREATE
        RouteStackLayer.prototype.post = function(){
            let config = this.getCurrentConfig();
            config["path"] = "";
            config["command"] = "POST";
            config["parent"] = this;
            this.children.push(new RouteStackLayer(config));
            return this;
        };

        // DELETE
        RouteStackLayer.prototype.delete = function(){
            let config = this.getCurrentConfig();
            config["path"] = "";
            config["command"] = "DELETE";
            config["parent"] = this;
            this.children.push(new RouteStackLayer(config));
            return this;
        };

        RouteStackLayer.prototype.route = function(path){
            let config = this.getCurrentConfig();
            config["path"] = path;
            config["parent"] = this;
            let child = new RouteStackLayer(config);
            this.children.push(child);
            return child;
        };

        RouteStackLayer.prototype.getPath = function(){
            return this.path;
        };

        RouteStackLayer.prototype.getFullPath = function(){
            if(this.parent !== null) {
                return formatPath(path.join(this.parent.getFullPath(), this.path));
            }
            else{
                return formatPath(this.path);
            }
        };

        RouteStackLayer.prototype.getGeneratedFunctionName = function(){
            return this.getFullPath().replace(/\//g,"_");
        };

        RouteStackLayer.prototype.getCommand = function(){
            return this.command;
        };

        RouteStackLayer.prototype.getChildren = function(){
            return this.children;
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

        RouteStackLayer.prototype.getAllAWSPoliciesInTree = function(){
            if(this.children.length === 0){
                return this.requiredPolicies;
            }
            else{
                return flatten(this.children.map(elem => {
                    return elem.getAllAWSPoliciesInTree();
                })
                    .concat(this.requiredPolicies));
            }
        };


        return new RouteStackLayer(_options);
    }});