const underscore = require('underscore');

/*
  GetFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: index.get
      Runtime: nodejs6.10
      Policies: AmazonDynamoDBReadOnlyAccess
      Environment:
        Variables:
          TABLE_NAME: !Ref Table
      Events:
        GetResource:
          Type: Api
          Properties:
            Path: /resource/{resourceId}
            Method: get
 */

underscore.extend(module.exports, {newInst: function init(_options) {
        function LambdaApiGatewayEvent(config) {
            if (config === undefined) {
                config = {};
            }

            this.fullPathComponents = config["fullPathComponents"] || [];
            this.executeFunction = config["executeFunction"] || "";
            this.resources = config["resources"] || "";
            this.command = config["command"] || "";
            this.policies = config["policies"] || [];
            this.environmentVariables = config["environment"] || [];
        };

        LambdaApiGatewayEvent.prototype.getNameForEvent = function() {
            return this.fullPathComponents.map(e =>{
                e = e.replace(/[^A-z0-9]/g, '');
                return e.charAt(0).toUpperCase() + e.slice(1)})
                .join("") + this.command;
        };

        LambdaApiGatewayEvent.prototype.getJSONForEvent = function(){
            var referencedVariables = [];

            referencedVariables = this.resources.map(elem => {
                if(elem.shouldAddReferenceToCallingFunction()){
                    var theHash = {};
                    theHash[elem.getReferenceNameForResource()] = ' !Ref ' + elem.getNameForResource();

                    return theHash;
                }
                else {
                    return undefined;
                }
            }).filter(elem => {return elem !== null && elem !== undefined});

            var allVariables = referencedVariables.concat(this.environmentVariables);

            return {
                Type: "AWS::Serverless::Function",
                Runtime: "nodejs8.10",
                Handler: 'app.handleCall',
                Policies: this.policies,
                Environment:{
                    Variables:allVariables
                },
                Events:{
                    GetResource:{
                        Type: "Api",
                        Properties:{
                            Path: this.fullPathComponents.join("/"),
                            Method: this.command
                        }
                    }
                }
            };
        };

        return new LambdaApiGatewayEvent(_options);
    }});