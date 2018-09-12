const underscore = require('underscore');
const pathModule = require("path");
const flatten = require('flatten');
const Promise = require("bluebird");

function rawGetPathComponents(path){
    return path.split("/").map(elem => {
        if(elem.length === 0){
            return null
        }
        if(elem === "/"){
            return null;
        }
        return elem
    }).filter(elem => {
        return elem !== null
    });
}

underscore.extend(module.exports, {newInst: function init(_options) {
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

        RouteStackLayer.prototype.route = function(thePath, subroutes){
            if(thePath === null || thePath === undefined || thePath === ""){
                thePath = "/";
            }

            // make sure to format our paths without slashes
            if(thePath.endsWith("/")){
                thePath = thePath.substring(0, thePath.length - 1)
            }

            if(thePath.startsWith("/")){
                thePath = thePath.substring(1, thePath.length)
            }

            if(subroutes === null || subroutes === undefined){
                let config = {};
                config["path"] = thePath;
                config["parent"] = this;
                let child = new RouteStackLayer(config);
                this.children.push(child);

                // make sure there are no duplicate routes, leading to un-deterministic behavior
                if(this.listDuplicatePaths().length !== 0){
                    throw("The route " + this.listDuplicatePaths()[0] + " already exists in this route stack");
                }

                // here we return the child, because the usecase is
                // route("a")
                // .route("path")
                // .route("to/somewhere")
                // .get(...)
                return child;
            }
            else{
                var partPath = subroutes.getFullPath();
                var thisPath = rawGetPathComponents(pathModule.join(thePath, subroutes.getPath())).join("/");
                subroutes.path = rawGetPathComponents(pathModule.join(thePath, subroutes.getPath())).join("/");
                subroutes.parent = this;
                this.children.push(subroutes);

                // make sure there are no duplicate routes, leading to un-deterministic behavior
                if(this.listDuplicatePaths().length !== 0){
                    throw("The route " + this.listDuplicatePaths()[0] + " already exists in this route stack");
                }

                // note, here we return the origional object because this is used to attach relative paths to
                // the current path.  Usecase is
                // routes("apath", require("morepaths"))
                return this;
            }
        };

        RouteStackLayer.prototype.getPath = function(){
            return rawGetPathComponents(this.path).join("/");
        };

        RouteStackLayer.prototype.listDuplicatePaths = function(){
            var uniqueHash = {};
            var dups = [];

            var listRoutes = this.getRoot().getAllRoutes();
            // note the call to get root, which will always give us the
            // root member of this tree
            this.getRoot().getAllRoutes().map(elem => {
                var candidatePath = pathModule.join(elem.fullPath, elem.command);
                if(candidatePath in uniqueHash){
                    dups.push(candidatePath);
                }
                else{
                    uniqueHash[candidatePath] = "a value";
                }
            });

            return dups;
        };

        RouteStackLayer.prototype.getFullPathComponents = function() {
            var parentPath = [];
            if(this.parent !== null) {
                parentPath = this.parent.getFullPathComponents();
            }

            var currentPath = rawGetPathComponents(this.path);

            return parentPath.concat(currentPath);
        };

        RouteStackLayer.prototype.getFullPath = function(){
            return "/" + this.getFullPathComponents().join("/");
        };


        RouteStackLayer.prototype.getAllRoutes = function(){
            if(this.children.length === 0){
                return [{fullPath: this.getFullPath(),
                        command: this.getCommand(),
                        routeObject: this}]
            }
            return flatten(this.children.map(elem => {return elem.getAllRoutes();}), 1);
        };

        RouteStackLayer.prototype.getRoot = function(){
            if(this.parent === null){
                return this;
            }
            else{
                return this.parent.getRoot();
            }
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
                combinedEnv[elem] = "" + self.environmentVariables[elem];
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