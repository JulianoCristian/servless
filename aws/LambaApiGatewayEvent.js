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
            this.command = config["command"] || "";
            this.policies = config["policies"] || [];
            this.environmentVariables = config["environment"] || [];
        };

        LambdaApiGatewayEvent.prototype.getNameForEvent = function() {
            return this.fullPathComponents.map(e =>{
                e.replace(/\W/g, '');
                return e.charAt(0).toUpperCase() + e.slice(1)})
                .join() + this.command;        };

        LambdaApiGatewayEvent.prototype.getJSONForEvent = function(){
            return {
                Type: "AWS::Serverless::Function",
                Runtime: "nodejs8.10",
                Policies: this.policies,
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