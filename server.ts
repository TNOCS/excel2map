import Winston = require('winston');
import fs = require('fs');
import path = require('path');
import request = require('request');
import auth = require('basic-auth');
import * as csweb from "csweb";
import * as BAG from "./public/BagDatabase/BagDatabase";

Winston.remove(Winston.transports.Console);
Winston.add(Winston.transports.Console, <Winston.ConsoleTransportOptions>{
    colorize: true,
    label: 'csWeb',
    prettyPrint: true
});

var cs = new csweb.csServer(__dirname, <csweb.csServerOptions>{
    port: 3004,
    swagger: false,
    //connectors: { mqtt: { server: 'localhost', port: 1883 }, mongo: { server : '127.0.0.1', port: 27017} }
});

var passwords = {};
cs.start(() => {
    readPass();

    this.config = new csweb.ConfigurationService('./configuration.json');
    this.config.add('server', 'http://localhost:' + cs.options.port);
    var bagDatabase = new BAG.BagDatabase(this.config);
    var mapLayerFactory = new csweb.MapLayerFactory(<any>bagDatabase, cs.messageBus, cs.api);

    cs.server.post('/projecttemplate', (req, res) => {
        var creds = auth(req);
        if (!creds || !passwords.hasOwnProperty(creds.name) || creds.pass !== passwords[creds.name]) {
            console.log('Wrong password');
            res.statusCode = 401;
            res.end();
        } else {
            mapLayerFactory.process(req, res);
        }
    });

    cs.server.post('/requestproject', (req, res) => {
        request.post('http://localhost:' + cs.options.port + '/api/projects', { json: true, body: req.body }, (err, httpResponse, body) => {
            var project = body;
            if (httpResponse.statusCode === csweb.ApiResult.OK) {
                if (project.hasOwnProperty('id') && !passwords.hasOwnProperty(project.id)) {
                    passwords[project.id] = generatePass();
                    addPass(project.id + ':' + passwords[project.id]);
                    project['password'] = passwords[project.id];
                } else {
                    console.log('Password already exists');
                }
            } else {
                console.log('ID already exists');
            }
            res.statusCode = httpResponse.statusCode;
            res.send(project);
        });


        // cs.server.post('/bagcontours', (req, res) => mapLayerFactory.processBagContours(req, res));
        console.log('Excel2map functions started');
        //    //{ key: "imb", s: new ImbAPI.ImbAPI("app-usdebug01.tsn.tno.nl", 4000),options: {} }
        //    var ml = new MobileLayer.MobileLayer(api, "mobilelayer", "/api/resources/SGBO", server, messageBus, cm);
    });
});

function generatePass() {
    var s: string = (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    return 'p' + s + (Date.now() % 9);
};

function readPass() {
    var pwfile = path.join(__dirname, '.users.htpasswd');
    fs.exists(pwfile, (exists) => {
        if (exists) {
            fs.readFile(pwfile, 'utf8', (err, data) => {
                if (err) {
                    console.log('Error reading htpasswds');
                    return;
                }
                var entries = data.split('\n');
                entries.forEach((e) => {
                    var un_pw = e.split(':');
                    passwords[un_pw[0]] = un_pw[1];
                });
            });
        }
    });
}

function addPass(entry: string) {
    var pwfile = path.join(__dirname, '.users.htpasswd');
    fs.exists(pwfile, (exists) => {
        if (exists) {
            fs.appendFile(pwfile, '\n' + entry, {encoding: 'utf8'}, (err) => {
                if (err) {
                    console.log('Error adding htpasswd');
                    return;
                }
            });
        } else {
            fs.writeFile(pwfile, entry, {encoding: 'utf8'}, (err) => {
                if (err) {
                    console.log('Error writing htpasswd file');
                    return;
                }
            });
        }
    });
}
