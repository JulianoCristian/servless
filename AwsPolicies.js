const AWS = require('aws-sdk');

require('underscore').extend(module.exports, {inject: function init(_options) {
        function AwsPolicies(config) {
            this.config = config;
        }

        AwsPolicies.prototype.getPolicies = function(config){
            AWS.config.update({
                region:config.region,

                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey
            });

            var iam = new AWS.IAM({apiVersion: config.apiVersion});

            return new Promise(function(resolve, reject) {
                iam.listPolicies(
                    {
                        OnlyAttached: true,
                        Scope: "AWS"
                    },
                    function (err, data) {
                        if (err) reject("It looks like this user cannot ready their own IAM credentials.  Add 'IAMReadOnlyAccess' permission to fix."); // an error occurred
                        else resolve(data);           // successful response
                    });
            })
                .then((data)=>{
                    return data.Policies.map(elem => {return elem.PolicyName});
                });
        };

        return new AwsPolicies(_options);
}});
