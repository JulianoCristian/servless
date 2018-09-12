var routes = require("../index").Routes();

routes.route("a-relative-path/")
    .get(function(event, context){
        return Promise.resolve({commandType: "get stuff"})
    })
    .post(function(event, context){
        return Promise.resolve({commandType: "post stuff"})
    })
    .put(function(event, context){
        return Promise.resolve({commandType: "put stuff"})
    })
    .delete(function(event, context){
        return Promise.resolve({commandType: "delete stuff"})
    });

module.exports = routes;