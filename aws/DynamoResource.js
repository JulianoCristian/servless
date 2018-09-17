const underscore = require('underscore');

/*
  DynamoDBTable:
    Type: AWS::DynamoDB::Table
    Properties:
      AttributeDefinitions:
        - AttributeName: id
          AttributeType: S
      KeySchema:
        - AttributeName: id
          KeyType: HASH
      ProvisionedThroughput:
        ReadCapacityUnits: 5
        WriteCapacityUnits: 5
      StreamSpecification:
        StreamViewType: NEW_IMAGE
 */
underscore.extend(module.exports, {newInst: function init(_options) {
        function DynamoResource(config) {
            if (config === undefined) {
                config = {};
            }
            this.tableName = config["tableName"] || [];
            this.attributes = config["attributes"] || {};
            this.keyField = config["keyField"] || [];
        };

        DynamoResource.prototype.getNameForResource = function() {
            return this.tableName;
        };

        DynamoResource.prototype.getPolicyList = function() {
            return ['AmazonDynamoDBFullAccess'];
        };

        DynamoResource.prototype.getJSONForResource = function(){
            let self = this;

            let propertiesList = this.attributes.map(attr => {
                return {AttributeName: Object.keys(attr)[0],
                    AttributeType: Object.values(attr)[0]}
            });

            return {
                Type: "AWS::DynamoDB::Table",
                Properties: propertiesList,
                KeySchema: [{AttributeName: this.keyField}, {KeyType: 'HASH'}],
                StreamSpecifications:
                    {StreamViewType: 'NEW_IMAGE'}
            };
        };

        return new DynamoResource(_options);
    }});