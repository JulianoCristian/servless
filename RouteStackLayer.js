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
            if (config === undefined) {
                config = {};
            }
            this.requiredPolicies = [];
            this.parent = config["parent"] || null;
            this.command = config["command"] || "";
            this.path = config["path"] || "";
            this.children = [];
            this.promiseFunction = config["promiseFunction"] || null;
            this.environmentVariables = config["environmentVariables"] || {};
        };

        RouteStackLayer.prototype.environment = function(vars){
            Object.keys(vars).forEach(elem => {
                this.environmentVariables[elem] = vars[elem];
            });

            return this;
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
        RouteStackLayer.prototype.get = function(promiseFunction){
            let config = {};
            config["path"] = "";
            config["command"] = "GET";
            config["parent"] = this;
            config["promiseFunction"] = promiseFunction;
            this.children.push(new RouteStackLayer(config));
            return this;
        };

        // UPDATE
        RouteStackLayer.prototype.put = function(promiseFunction){
            let config = {};
            config["path"] = "";
            config["command"] = "PUT";
            config["parent"] = this;
            config["promiseFunction"] = promiseFunction;
            this.children.push(new RouteStackLayer(config));
            return this;
        };

        // CREATE
        RouteStackLayer.prototype.post = function(promiseFunction){
            let config = {};
            config["path"] = "";
            config["command"] = "POST";
            config["parent"] = this;
            config["promiseFunction"] = promiseFunction;
            this.children.push(new RouteStackLayer(config));
            return this;
        };

        // DELETE
        RouteStackLayer.prototype.delete = function(promiseFunction){
            let config = {};
            config["path"] = "";
            config["command"] = "DELETE";
            config["parent"] = this;
            config["promiseFunction"] = promiseFunction;
            this.children.push(new RouteStackLayer(config));
            return this;
        };

        RouteStackLayer.prototype.route = function(path){
            // make sure to format our paths without slashes
            if(path.endsWith("/")){
                path = path.substring(0, path.length - 1)
            }

            if(path.startsWith("/")){
                path = path.substring(1, path.length - 1)
            }

            let config = {};
            config["path"] = path;
            config["parent"] = this;
            let child = new RouteStackLayer(config);
            this.children.push(child);
            return child;
        };

        RouteStackLayer.prototype.getPath = function(){
            return this.path + "/";
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
            return this.getFullPath().replace(/\//g,"_") + this.getCommand();
        };

        RouteStackLayer.prototype.getCommand = function(){
            return this.command;
        };

        RouteStackLayer.prototype.getChildren = function(){
            return this.children;
        };

        RouteStackLayer.prototype.getEnvironmentVariables = function(){
            var combinedEnv = {};
            if(this.parent !== null){
                combinedEnv = this.parent.getEnvironmentVariables();
            }

            let self = this;
            Object.keys(this.environmentVariables).forEach(elem => {
                combinedEnv[elem] = self.environmentVariables[elem];
            });

            return combinedEnv;
        };

        RouteStackLayer.prototype.getFunctionByPathAndCommand = function(thePath, command){
            return this._internalGetFunctionByPathAndCommand(thePath.split("/").filter(elem => {return elem != "" && elem !== null}), command)
        };

        RouteStackLayer.prototype._internalGetFunctionByPathAndCommand = function(pathList, command){
            // we've traversed our stack tree all the way
            // find GET,POST,PUT,DELETE
            if(pathList.length == 0){
                let func = this.children.filter(elem => {
                    return elem.getCommand() == command;
                });

                if(func.length > 0){
                    return func[0].promiseFunction;
                }
                else{
                    throw("Could not find any route with this path");
                }
            }
            // else keep traversing the tree
            else{
                let rightKid = this.children.filter(elem => {
                    return elem.path == pathList[0];
                });

                if(rightKid.length > 0){
                    return rightKid[0]._internalGetFunctionByPathAndCommand(pathList.slice(1), command);
                }
                else{
                    throw("Could not find any route with this path");
                }
            }
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