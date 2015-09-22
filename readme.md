# ne-render (Node Engine Render)

## Server rendering in NodeJS with React and React-Router 

A tool to render pages Node Engine style on a NodeJS server.

Rendering React with React-Router on the server with Pre-Render Data from API's added to the state and props.

// Server Rendering with React Router but after getting data from a api request.
// This version stores the data request in the page object for that path

## Sample Server file

```js

////////////////////////
// Create the Server
////////////////////////

var nodeEngineServer = require('ne-server');
var server = nodeEngineServer.init(process.env.PORT);

var mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL);


//////////////////////
// Static Assets
//////////////////////

var dirName = __dirname;
var cacheTime = 100;

nodeEngineServer.static(server, dirName, cacheTime);


///////////////
// REST API
///////////////

var mongoRest = require('ne-mongo-rest');

var apiPath = "/api";
mongoRest.server(server, dirName, apiPath);


//////////////////////////////
// Express Test
//////////////////////////////

server.use('/express', require('./server/express'));


////////////////////////////////////////////////////////////
// Rendering React with React-Router on the server with Pre-Render Data from API's
////////////////////////////////////////////////////////////

var neRender = require('ne-render');
var appmeta = require ('./appmeta');
var routes = require ('./routes');

neRender.serverRender(server, appmeta, routes);

```

## Sample routes File

```js

'use strict';

import React from 'react';
import {Router, Route, DefaultRoute, NotFoundRoute } from 'react-router';

// Handlers
import MainHandler from './handlers/MainHandler.js';
import IndexHandler from './handlers/IndexHandler.js';
import AboutHandler from './handlers/AboutHandler.js';
import ContactHandler from './handlers/ContactHandler.js';
import PostsHandler from './handlers/PostsHandler.js';
import PeopleHandler from './handlers/PeopleHandler.js';
import NotFoundHandler from './handlers/NotFoundHandler.js';

var Routes = (
    <Route name="MainRoute" path="/" handler={MainHandler}>
        <Route name="about" path="about" handler={AboutHandler}></Route>
        <Route name="contact" path="contact" handler={ContactHandler}></Route>
        <Route name="posts" path="posts" handler={PostsHandler}></Route>
        <Route name="posts/:id" path="posts/:id" handler={PostsHandler}></Route>
        <Route name="people" path="people" handler={PeopleHandler}></Route>
        <DefaultRoute name="IndexRoute" handler={IndexHandler}></DefaultRoute>
        <NotFoundRoute name="NotFoundRoute" handler={NotFoundHandler}></NotFoundRoute>
    </Route>
);

export default Routes;


```

## Sample appConfig File

```js

var appmeta = {

    globals: {
        "APPNAME": "Node Engine Sample",
        "SITENAME": "Node Engine Sample",
        "DESCRIPTION": "A Example site for the Node Engine Approach"
    },

    paths: [

        {
            path: "/about",
            title: "About Us",
            description: "This is About Us page"
        },

        {
            path: "/contact",
            title: "Contact Us",
            description: "This is Contact Us page"
        },

        {
            path: "/posts",
            title: "Posts",
            description: "This is Posts page",

            nedBefore:
            {
                number: 1,
                nedb1:
                {
                    path: "http://localhost:3001/api/posts"
                }
            }
        },

        {
            path: "/something",
            title: "Something",
            description: "This is Something",

            nedCustom:
            {
                call:  "something"
            }
        }

    ],

    custom: function(meta, req){

        console.log('meta in custom at trans');
        console.log(meta);

        switch (meta.nedCustom.call){
            case 'something':
                console.log('something case matched');
                return this.something(meta, req);
        }
    },

    something: function (meta, req){

        // Example usage can be to use the req.params to change the meta title

        meta.title = "Dynamic Title for " + req.path;
        console.log('Do something with the routeMeta object before sending it back');
        return meta

    }

};

module.exports = appmeta;


```

## Sample configDevelopment File

```json

{
  "env": {
    "NODE_ENV"         : "development",
    "ROOTURL"          : "http://localhost:3001",
    "PORT"             : 3001,
    "MONGO_URL"        : "mongodb://username:password@domain.com:27000/databasename",
    "SENDGRID_APIKEY"  : "xxx",
  }
}

```

## Sample configProduction File

```json

{
  "env": {
    "NODE_ENV"         : "production",
    "ROOTURL"          : "http://domain.com",
    "PORT"             : 3001,
    "MONGO_URL"        : "mongodb://username:password@domain.com:27000/databasename",
    "SENDGRID_APIKEY"  : "xxx",
  }
}

```

## Sample component file

``` js

import React from 'react';

class Head extends React.Component {

    render(){

        return (
            <head>
                <title>{`${this.props.meta.title} - ${this.props.meta.globals.SITENAME}`}</title>
                <meta name="description" content={this.props.meta.description}/>
                <link rel='stylesheet' href='/style.css' />
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <script src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script>
            </head>
        )

    }
}

export default Head;

```

## Sample API file in the apiPath folder 

```js

var router = require('express').Router();
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoRest = require('ne-mongo-rest');

var modelSchema = new Schema({
    firstName:{type: String, required: true},
    lastName:{type: String, required: true},
    email:{type: String, required: true},
    createdAt:{type: String, required: true, default: new Date()}
});

var Model = mongoose.model(
    'people',
    modelSchema,
    'people'
    );

mongoRest.model(router, Model);

module.exports = router;


```