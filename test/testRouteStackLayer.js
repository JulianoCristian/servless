
const assert = require('assert');
const servless = require("../index");
const relativePaths = require("./addRelativeRoutes");

describe('Route State Layer', function() {
    describe('Simple Route Test', function() {
        var app = servless.App();

        let baseRoute = app.route("/");

        it('It should return /', function() {
            assert.equal(baseRoute.getFullPath(), "/");
            let emptyQoutes = servless.App().route("");
            assert.equal(emptyQoutes.getPath(), "");
            assert.equal(emptyQoutes.getFullPath(), "/");

            let wayTooManyQuotes = servless.App().route("////////");
            assert.equal(wayTooManyQuotes.getPath(), "");
            assert.equal(wayTooManyQuotes.getFullPath(), "/");
        });

        let tooManySlashes = baseRoute.route("/testing-too-many-slashes/");
        it('It should return /testing-too-many-slashes', function() {
            assert.equal(tooManySlashes.getPath(), "testing-too-many-slashes");
            assert.equal(tooManySlashes.getFullPath(), "/testing-too-many-slashes");
        });

        let doubleSlashes = baseRoute.route("//testing-double-slashes//");
        it('It should return /testing-double-slashes', function() {
            assert.equal(doubleSlashes.getPath(), "testing-double-slashes");
            assert.equal(doubleSlashes.getFullPath(), "/testing-double-slashes");
        });

        let doubleSlashesInside = baseRoute.route("//testing-double//slashes//");
        it('It should return /testing-double/slashes', function() {
            assert.equal(doubleSlashesInside.getPath(), "testing-double/slashes");
            assert.equal(doubleSlashesInside.getFullPath(), "/testing-double/slashes");
        });

        var t = baseRoute.getAllRoutes();
        baseRoute.route("/rel-path", relativePaths);
        it('It should return awesome', function() {
            var theList = baseRoute.getAllRoutes();

            theList.forEach(elem => {

                assert.equal(elem.fullPath, elem.routeObject.getFullPath());
                assert.equal(elem.command, elem.routeObject.getCommand());
            });

            assert.equal(theList[0].fullPath,"/testing-too-many-slashes");
            assert.equal(theList[1].fullPath,"/testing-double-slashes");
            assert.equal(theList[2].fullPath,"/testing-double/slashes");

            assert.equal(theList[3].fullPath,"/rel-path/a-relative-path");
            assert.equal(theList[3].command,"GET");

            assert.equal(theList[4].fullPath,"/rel-path/a-relative-path");
            assert.equal(theList[4].command,"POST");

            assert.equal(theList[5].fullPath,"/rel-path/a-relative-path");
            assert.equal(theList[5].command,"PUT");

            assert.equal(theList[6].fullPath,"/rel-path/a-relative-path");
            assert.equal(theList[6].command,"DELETE");
        });

    });
});
