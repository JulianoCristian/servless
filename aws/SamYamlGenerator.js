const underscore = require('underscore');

underscore.extend(module.exports, {newInst: function init(_options) {
        function SamYamlGenerator(config) {
            if (config === undefined) {
                config = {};
            }

            this.events = config["events"] || [];
            this.resources = config["resources"] || [];
        };

        return new SamYamlGenerator(_options);
    }});