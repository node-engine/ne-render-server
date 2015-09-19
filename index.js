'use strict';

var React = require('react');
var Router = require('react-router');
var beforeData = require('ne-data-before');


var neRender = {

    serverRender: function (server, routes, pageAPIPath, globals){

        server.get('*', function (req, res) {

            Router.run(routes, req.path, function (Root, state) {

                var pathString = state.routes[1].path.substr(1);

                function renderPage (data){
                    data.globals = globals;
                    state.data = data;
                    state.query = req.query;
                    console.log('Rendering ' + pathString + 'from Server - START');
                    var html = React.renderToStaticMarkup(React.createElement(Root, state));
                    var doctype = '<!DOCTYPE html>';
                    var fullHtml = doctype + html;
                    res.send(fullHtml);
                    console.log('Rendering ' + pathString + 'from Server - DONE');
                }

                beforeData.fetch(pageAPIPath, pathString)
                    .then(function(data) {
                        renderPage(data);
                    });

            });
        });
    }

}

module.exports = neRender;