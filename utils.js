const underscore = require('underscore');

underscore.extend(module.exports, {getArguments: function getArgs(func) {
        // First match everything inside the function argument parens.
        var args = func.toString().match(/function\s.*?\(([^)]*)\)/)[1];

        // Split the arguments string into an array comma delimited.
        var parsedArgs = args.split(',').map(function(arg) {
            // Ensure no inline comments are parsed and trim the whitespace.
            return arg.replace(/\/\*.*\*\//, '').trim();
        }).filter(function(arg) {
            // Ensure no undefined values are added.
            return arg;
        });

        return parsedArgs;
    }
});