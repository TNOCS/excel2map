import Winston = require('winston');
import fs = require('fs');
import path = require('path');
import auth = require('basic-auth');
import * as csweb from "csweb";

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
    var bagDatabase = new csweb.BagDatabase(this.config);
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
        var project = new csweb.Project;
        project = req.body;
        cs.api.addProject(project, {}, (result: csweb.CallbackResult) => {
            if (result.result === csweb.ApiResult.OK) {
                if (result.project.hasOwnProperty('id') && !passwords.hasOwnProperty(result.project.id)) {
                    passwords[result.project.id] = generatePass();
                    addPass(result.project.id + ':' + passwords[result.project.id]);
                    result.project['password'] = passwords[result.project.id];
                } else {
                    console.log('Password already exists');
                }
            } else {
                console.log('ID already exists');
            }
            res.statusCode = result.result;
            res.send(result.project);
        });
    });

    cs.server.post('/updategrouptitle', (req, res) => {
        var creds = auth(req);
        if (!creds || !passwords.hasOwnProperty(creds.name) || creds.pass !== passwords[creds.name]) {
            console.log('Wrong password');
            res.statusCode = 401;
            res.end();
        } else {
            var data;
            if (req.body) {
                data = req.body;
                cs.api.updateGroup(data.projectId, data.oldTitle, <any>{ id: data.newTitle, title: data.newTitle }, {}, (result: csweb.CallbackResult) => {
                    if (result && result.result === csweb.ApiResult.OK) {
                        res.statusCode = 200;
                        res.end();
                    } else {
                        res.statusCode = 404;
                        res.end();
                    }
                });
            }
        }
    });

    cs.server.post('/clearproject', (req, res) => {
        var creds = auth(req);
        if (!creds || !passwords.hasOwnProperty(creds.name) || creds.pass !== passwords[creds.name]) {
            console.log('Wrong password');
            res.statusCode = 401;
            res.end();
        } else {
            var data;
            if (req.body) {
                data = req.body;
                if (!data.hasOwnProperty('projectId')) {
                    res.statusCode = 404;
                    res.end();
                } else {
                    cs.api.clearProject(data.projectId, {}, (result: csweb.CallbackResult) => {
                        if (result && result.result === csweb.ApiResult.OK) {
                            res.statusCode = 200;
                            res.end();
                        } else {
                            res.statusCode = 404;
                            res.end();
                        }
                    });
                }
            }
        }
    });
    console.log('Excel2map functions started');
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
            fs.appendFile(pwfile, '\n' + entry, { encoding: 'utf8' }, (err) => {
                if (err) {
                    console.log('Error adding htpasswd');
                    return;
                }
            });
        } else {
            fs.writeFile(pwfile, entry, { encoding: 'utf8' }, (err) => {
                if (err) {
                    console.log('Error writing htpasswd file');
                    return;
                }
            });
        }
    });
}
