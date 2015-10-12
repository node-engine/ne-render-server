'use strict';

var React = require('react');
var Router = require('react-router');
var axios = require ('axios');
var _ = require('lodash');

var neRender = {

    meta: function (req, appmeta, pathForMeta){

        var path = pathForMeta;

        console.log('');
        console.log('');
        console.log('ne-data: pathForMeta');
        console.log(pathForMeta);
        console.log('');
        console.log('');

        var meta = _.find(appmeta, { path: path });

        if (meta === undefined){

            var meta = {
                path: "path not in config",
                meta:
                {
                    title: "Undefined path: " + req.path,
                    description: "Not found"
                }
            };

            meta.appname = process.env.APPNAME;

            console.log('');
            console.log('');
            console.log('ne-data: meta default set');
            console.log(meta);
            console.log('');
            console.log('');

            return meta
        }

        meta.appname = process.env.APPNAME;

        console.log('');
        console.log('');
        console.log('ne-data: meta init');
        console.log(meta);
        console.log('');
        console.log('');

        if (meta.neDataCustom){

            var meta = appmeta.custom(meta, req);

            console.log('');
            console.log('');
            console.log('ne-data: meta with custom');
            console.log(meta);
            console.log('');
            console.log('');

            return meta

        }

        else {

            return meta;

            // this.sendMeta(routeMeta);


        }

    },

    before: function(meta){
        var self = this;

        var nedbNumber = meta.neDataBefore;

        if (nedbNumber === 1) {

            console.log('');
            console.log('');
            console.log("ne-data: Requesting < " + nedbNumber + " nedb packets > for < " + meta.title +" >");
            console.log('');
            console.log('');

            var nedb1 = meta.nedb1;
            // meta.nedb1.func();

            return axios.all([self.getBefore(nedb1, meta)])
                .then(function(results){
                    return {
                        nedb1: results[0].data
                    }
                });
        }

        else if (nedbNumber === 2) {

            console.log('');
            console.log('');
            console.log("ne-data: Requesting < " + nedbNumber + " nedb packets > for < " + meta.title +" >");
            console.log('');
            console.log('');

            var nedb1 = meta.nedb1;
            var nedb2 = meta.nedb2;
            return axios.all([self.getBefore(nedb1, meta),self.getBefore(nedb2, meta)])
                .then(function(results){
                    return {
                        nedb1: results[0].data,
                        nedb2: results[1].data
                    }
                });
        }

        else if (nedbNumber === 3) {

            console.log('');
            console.log('');
            console.log("ne-data: Requesting < " + nedbNumber + " nedb packets > for < " + meta.title +" >");
            console.log('');
            console.log('');

            var nedb1 = meta.nedb1;
            var nedb2 = meta.nedb2;
            var nedb3 = meta.nedb3;
            return axios.all([self.getBefore(nedb1, meta),self.getBefore(nedb2, meta),self.getBefore(nedb3, meta)])
                .then(function(results){
                    return {
                        nedb1: results[0].data,
                        nedb2: results[1].data,
                        nedb3: results[2].data
                    }
                });
        }

        else if (nedbNumber > 3)  {

            console.log('');
            console.log('');
            console.log("ne-data: The page had" + nedbNumber + "pre render data requests" );
            console.log("Only a maximun of 3 pre render data requests are supported");
            console.log("If you need more it can be added on request by opening an issue on github");
            console.log('');
            console.log('');

            return {
                errorMessage: "dataNumber did not match",
                dataNumber: nedbNumber
            }
        }
        else {

            console.log('');
            console.log('');
            console.log("ne-data: nedbNumber Error");
            console.log("The page had" + nedbNumber + "pre render data requests" );
            console.log("Only a maximun of 3 pre render data requests are supported");
            console.log("If you need more it can be added on request by opening an issue on github");
            console.log('');
            console.log('');

            return {
                errorMessage: "pdNumber error",
                pdNumber: nedbNumber
            }
        }
    },

    getBefore: function(nedbx, meta) {
        if(nedbx.pathFunction){
            var path = nedbx.pathFunction(meta);
        }
        else {
            var path = nedbx.path;
            var query = nedbx-query;
        }

        console.log('');
        console.log('');
        console.log('ne-data: path');
        console.log(path);
        console.log('');
        console.log('');

        return axios.get(path);

    },

    cycleBefore: function(){

    },

    after: function(){

        console.log('');
        console.log('');
        console.log("ne-data: Future feature for getting data after the page has rendered already and updating the page")
        console.log('');
        console.log('');
    },

    cycleAfter: function(){

    },

    serverRender: function (server, appmeta, routes, apiref){
        var self = this;

        server.get('*', function (req, res) {

            Router.run(routes, req.path, function (Root, state) {

                // Log pathString
                var pathForMeta = state.routes[1].path;

                console.log('');
                console.log('');
                console.log('neRender: pathForMeta');
                console.log(pathForMeta);
                console.log('');
                console.log('');

                var neDataReqTimeoutTime = process.env.NEDATA_TIMEOUT_TIME || 6000;
                var neDataReqTimeoutMessage = process.env.NEDATA_TIMEOUT_MSG || "neDataReq Not Authorized";

                // Compile page meta
                var meta = self.meta(req, appmeta, pathForMeta);
                meta.query = req.query;
                meta.params = state.params;
                meta.body = req.body;
                if (req.claims){
                    meta.claims = req.claims;
                }
                if (!req.claims){
                    meta.claims = {
                        displayName: "Not Logged In"
                    };
                }
                if (req.cookies && req.cookies.token){
                    meta.token = req.cookies.token;
                }
                if (req.query && req.query.token){
                    meta.token = req.query.token;
                }

                console.log('');
                console.log('');
                console.log('ne-render: meta before ne-data');
                console.log(meta);
                console.log('');
                console.log('');

                // Render the page
                function renderPage (data, fetchError){

                    if (!fetchError) {
                        stopTimeout();
                    }
                    if (fetchError) {
                        data = {
                            message: neDataReqTimeoutMessage
                        };
                    }
                    state.meta = meta;
                    state.data = data;
                    state.query = req.query;
                    state.body = req.body;
                    state.apiref = apiref;
                    if (!fetchError) {
                        stopTimeout();
                        state.data = data;
                    }
                    if (req.user) {
                        state.user = req.user;
                    }

                    console.log('');
                    console.log('');
                    console.log('ne-render: state before render');
                    console.log(state);
                    console.log('');
                    console.log('');

                    console.log('');
                    console.log('');
                    console.log('ne-render: Rendering < ' + meta.title + ' > from Server - START');
                    console.log('');
                    console.log('');

                    var html = React.renderToStaticMarkup(React.createElement(Root, state));
                    var doctype = '<!DOCTYPE html>';
                    var fullHtml = doctype + html;
                    res.send(fullHtml);

                    console.log('');
                    console.log('');
                    console.log('ne-render: Rendering < ' + meta.title + ' > from Server - DONE');
                    console.log('');
                    console.log('');

                }


                // Handle errors with neData requests
                var timeOut;
                var startTimeout = function  (){
                    timeOut = setTimeout(function(){
                        var data = {};
                        var fetchError = {};
                        renderPage(data, fetchError);
                    },neDataReqTimeoutTime);
                };
                var stopTimeout = function (){
                    clearTimeout(timeOut);
                };
                startTimeout ();



                // Handle neData Requests
                if (meta.neDataBefore) {

                    if (meta.neDataCycle){

                        // this just uses the query params 'limit' and 'batch'
                        // to change the next and previous button url's and
                        // to get different sets of data for different values of limit and batch
                        // the cycle can be on before and after render data
                        self.cycleBefore(meta)
                            .then(function(data) {
                                renderPage(data);
                            });
                    }

                    else {

                        self.before(meta)
                            .then(function(data) {
                                renderPage(data);
                            });
                    }

                }

                else {
                    var data = {};
                    renderPage (data);
                }



            });
        });
    },
    clientRender: function(server, path, routes){
        console.log("ne-render: Future Feature")

        Router.run(routes, path, function(Root, state){

            //var pathString = state.routes[1].path.substr(1);
            var pathString = "about";

            function renderPage (data){
                state.data = data;
                state.meta = {};

                console.log('');
                console.log('');
                console.log("Rendering < " + pathString + " > from CLIENT - START");
                console.log('');
                console.log('');

                React.render(React.createElement(Root, state), document.getElementById("react-mount"));

                console.log('');
                console.log('');
                console.log("Rendering < " + pathString + " > from CLIENT - START");
                console.log('');
                console.log('');
            }

            var data = {}
            renderPage(data)
        })

    }

};

module.exports = neRender;