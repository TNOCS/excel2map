import { Application, Request, Response, NextFunction } from 'express';
import Winston = require('winston');
import fs = require('fs');
import path = require('path');
import opn = require('opn');
import * as csweb from 'csweb';
import * as mongoose from 'mongoose';
import * as bluebird from 'bluebird';
import * as nodemailer from 'nodemailer'; // module hasn't been installed yet, only its typings
import { IConfig } from './config/IConfig';
import { NodeAuth, PolicySet, CRUD, User, IUser, DecisionCombinator, Resource, BaseRule, Rule, Decision, PrivilegeRequest, Subject, Action, PolicySetCollection } from 'node_auth';

const config: IConfig = require('config');

(<any>mongoose).Promise = bluebird;
// mongoose.connect('mongodb://localhost/test_e2m'); // connect to database
mongoose.connect(config.mongodb); // connect to database

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('DB: we are connected');
    User.find({ admin: true }, (err, res) => {
        if (err) { return console.error(err); }
        if (res.length === 0) {
            // No admin found: create one
            const user = new User(<IUser>{
                name: 'admin',
                email: 'admin@example.com',
                verified: true,
                password: 'password',
                admin: true
            });
            user.save(err => {
                if (err) { return console.error(err); };
            });
        }
    });
});

// Load of create a policy store
const policyStore = {
    name: 'example-policies.json',
    policies: <PolicySet[]>[{
        name: 'Main policy set',
        combinator: 'first',
        policies: [{
            name: 'admins rule',
            combinator: 'first',
            rules: [{
                subject: { admin: true },
                action: Action.All,
                decision: Decision.Permit
            }]
        }, {
            name: 'rbac',
            combinator: 'first',
            rules: [{
                subject: { subscribed: true },
                action: Action.Create,
                resource: {
                    type: 'project'
                },
                decision: Decision.Permit
            }, {
                subject: { email: 'erik.vullings@gmail.com' },
                action: Action.Manage,
                decision: Decision.Permit,
                resource: {
                    type: 'project'
                }
            }, {
                desc: 'Anyone can read public resources',
                action: Action.Read,
                decision: Decision.Permit,
                resource: {
                    articleID: ['public_article']
                }
            }, {
                desc: 'Subscribed users can create new resources',
                subject: {
                    subscribed: true
                },
                action: Action.Create,
                decision: Decision.Permit
            }]
        }]
    }]
};

Winston.remove(Winston.transports.Console);
Winston.add(Winston.transports.Console, <Winston.ConsoleTransportOptions>{
    colorize: true,
    label: 'csWeb',
    prettyPrint: true
});

var cs = new csweb.csServer(__dirname, <csweb.csServerOptions>{
    port: 3004,
    swagger: false,
    connectors: {}
});

var debug = true;

var passwords = {};
cs.start(() => {
    // readPass();
    const auth = NodeAuth(cs.server, {
        secretKey: 'MyBigSectetThatShouldBeReplacedInProduction',
        blockUnauthenticatedUser: false, // if true, default, no unauthenticated user will pass beyond this point
        policyStore: policyStore,
        verify: {
            route: true,
            baseUrl: 'WWW.MYDOMAIN.COM/api/activate',
            mailService: null,
            verifyMailOptions: {
                from: 'erik.vullings@gmail.com',
                subject: 'Just verifying that your email is correct',
                html: 'Hello'
            },
            confirmMailOptions: {
                from: 'erik.vullings@gmail.com',
                subject: 'Just confirming that your account is setup and good to go',
                html: 'Yay!'
            }
        },
        onUserChanged: (user: IUser, req: Request, change: CRUD) => {
            console.log(`User ${change}d:`);
            console.log(JSON.stringify(user, null, 2));
        }
    });
    cs.server.use(auth);

    // const pep = nodeAuth.initPEP(policyStore);
    // const cop = pep.getPolicyEnforcer('Main policy set');

    this.config = cs.config;
    this.config.add('server', 'http://localhost:' + cs.options.port);
    var bagDatabase = new csweb.BagDatabase(this.config);
    var osmDatabase = new csweb.NominatimSource(this.config);
    var mapLayerFactory = new csweb.MapLayerFactory(osmDatabase, cs.messageBus, cs.api, cs.dir);

    cs.server.post('/projecttemplate', (req, res) => {
        // var creds = auth(req);
        // if (!creds || !passwords.hasOwnProperty(creds.name) || creds.pass !== passwords[creds.name]) {
        //     console.log('Wrong password');
        //     res.statusCode = HTTPStatusCodes.UNAUTHORIZED;
        //     res.end();
        // } else {
        //     if (debug) {
        //         fs.writeFile('debug.json', JSON.stringify(req.body), (err) => {
        //             console.log(`Wrote debug.json (${err || 'OK'})`);
        //         });
        //     }
        //     mapLayerFactory.process(req, res);
        // }
        mapLayerFactory.process(req, res);
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
                res.statusCode = result.result;
                res.send(result.project);
            } else {
                console.log('ID already exists');
                cs.api.getProject(project.id, {}, (result: csweb.CallbackResult) => {
                    if (result.result !== csweb.ApiResult.OK) {
                        console.log('Could not find project.');
                    }
                    console.log('Found project.');
                    res.statusCode = result.result;
                    res.send(result.project);
                });
            }
        });
    });

    cs.server.post('/updategrouptitle', (req, res) => {
        var creds = req['user']; // auth(req);
        if (!creds || !passwords.hasOwnProperty(creds.name) || creds.pass !== passwords[creds.name]) {
            console.log('Wrong password');
            res.statusCode = HTTPStatusCodes.UNAUTHORIZED;
            res.end();
        } else {
            var data;
            if (req.body) {
                data = req.body;
                cs.api.updateGroup(data.projectId, data.oldTitle, <any>{
                    id: data.newTitle,
                    title: data.newTitle
                }, {}, (result: csweb.CallbackResult) => {
                    if (result && result.result === csweb.ApiResult.OK) {
                        res.statusCode = HTTPStatusCodes.OK;
                        res.end();
                    } else {
                        res.statusCode = HTTPStatusCodes.NOT_FOUND;
                        res.end();
                    }
                });
            }
        }
    });

    cs.server.post('/clearproject', (req, res) => {
        var creds = req['user']; // auth(req);
        if (!creds || !passwords.hasOwnProperty(creds.name) || creds.pass !== passwords[creds.name]) {
            console.log('Wrong password');
            res.statusCode = HTTPStatusCodes.UNAUTHORIZED;
            res.end();
        } else {
            var data;
            if (req.body) {
                data = req.body;
                if (!data.hasOwnProperty('projectId')) {
                    res.statusCode = HTTPStatusCodes.NOT_FOUND;
                    res.end();
                } else {
                    cs.api.clearProject(data.projectId, {}, (result: csweb.CallbackResult) => {
                        if (result && result.result === csweb.ApiResult.OK) {
                            res.statusCode = HTTPStatusCodes.OK;
                            res.end();
                        } else {
                            res.statusCode = HTTPStatusCodes.NOT_FOUND;
                            res.end();
                        }
                    });
                }
            }
        }
    });

    cs.server.post('/bagsearchaddress', (req, res) => {
        mapLayerFactory.processBagSearchQuery(req, res);
    });

    console.log('Excel2map functions started');
    // Open start webpage
    if (!debug) opn('http://localhost:' + cs.options.port);
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
            fs.appendFile(pwfile, '\n' + entry, {
                encoding: 'utf8'
            }, (err) => {
                if (err) {
                    console.log('Error adding htpasswd');
                    return;
                }
            });
        } else {
            fs.writeFile(pwfile, entry, {
                encoding: 'utf8'
            }, (err) => {
                if (err) {
                    console.log('Error writing htpasswd file');
                    return;
                }
            });
        }
    });
}