import { Application, Router, Request, Response, NextFunction, Send, static as ExpressStatic } from 'express';
import Winston = require('winston');
import fs = require('fs');
import path = require('path');
import opn = require('opn');
import * as csweb from 'csweb';
import * as mongoose from 'mongoose';
import * as bluebird from 'bluebird';
import * as nodemailer from 'nodemailer'; // module hasn't been installed yet, only its typings
import { IConfig } from './config/IConfig';
import { NodeAuth, PolicySet, PolicyStoreFactory, CRUD, User, IUser, initPEP, DecisionCombinator, Resource, Rule, Decision, PrivilegeRequest, Subject, Action } from 'node_auth';
import { sendInterceptor } from 'node_auth';

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
const policyStore = <PolicySet[]>[{
    name: 'Main policy set',
    combinator: 'first',
    policies: [
        {
            name: 'admins rule',
            combinator: 'first',
            rules: [{
                desc: 'Admins are allowed to request all projects',
                subject: { admin: true },
                action: Action.All,
                decision: Decision.Permit,
                resource: {
                    type: 'project'
                }
            }]
        },
        {
            name: 'rbac',
            combinator: 'first',
            rules: [{
                subject: { verified: false },
                action: Action.Create | Action.Read,
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
}];

const ps = PolicyStoreFactory('policies.json', policyStore);

Winston.remove(Winston.transports.Console);
Winston.add(Winston.transports.Console, <Winston.ConsoleTransportOptions>{
    colorize: true,
    label: 'csWeb',
    prettyPrint: true
});

var cs = new csweb.csServer(__dirname, <csweb.csServerOptions>{
    port: 3004,
    swagger: false,
    apiFolder: '/data/api',
    connectors: {},
    corrsEnabled: true,
    corrsSupportedMethods: '*'
});

cs.server.route('*')
    .all((req, res, next) => {
        console.log(`${req.method}: ${req.url}`);
        // if (req.body) { console.log(req.body); }
        console.log(`HEADERS: ${JSON.stringify(req.headers, null, 2)}`);
        next();
    });

const auth = NodeAuth(cs.server, {
    secretKey: 'MyBigSectetThatShouldBeReplacedInProduction',
    blockUnauthenticatedUser: false, // if true, default, no unauthenticated user will pass beyond this point
    policyStore: ps,
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

const pep = initPEP(ps);
const cop = pep.getPolicyEnforcer('Main policy set', { resource: { type: 'project' } });
const policyEditor = ps.getPolicyEditor('rbac', 'Main policy set');

// const sendInterceptor = (res: Response, cb: (body: { [key: string]: any }) => void) => {
//     const oldSend = res.send;
//     res.send = function () {
//         const body = JSON.parse(arguments[0]);
//         cb(body);
//         return oldSend.apply(res, arguments);
//     };
// };

cs.server.route('/api/projects')
    .get((req, res, next) => {
        console.log('GET /api/projects');
        console.log(JSON.stringify(req['user'], null, 2));
        cop(req, res, next);
    })
    .post((req, res, next) => {
        console.log('POST /api/projects');
        console.log(JSON.stringify(req['user'], null, 2));
        cop(req, res, next);
    })
    .post((req, res, next) => {
        const email = (<IUser>req['user']).email;
        console.log('POST /api/projects AUTHN SUCCEEDED');
        sendInterceptor(res, (body) => {
            console.log('INTERCEPTING SEND: /api/projects');
            console.log(JSON.stringify(body, null, 2));
            policyEditor('add', ({
                desc: `Allow ${email} to manage project with id ${body.id}`,
                subject: { email: email },
                action: Action.Manage,
                resource: {
                    domain: body.id,
                    type: 'project'
                },
                decision: Decision.Permit
            }));
            ps.save(err => {
                if (err) { console.error(err); }
                if (!err) { console.log(`Allow ${email} to manage project with id ${body.id}`); }
            });
        });
        next();
    });

cs.server.route('/api/projects/:domain')
    .all((req, res, next) => {
        req['resource'] = {
            type: 'project',
            domain: req.params.domain
        };
        cop(req, res, next);
    });

cs.server.route('/api/layers/:layerId')
    .all((req, res, next) => {
        req['resource'] = {
            type: 'project',
            domain: req.headers.domain
        };
        cop(req, res, next);
    });

cs.server.route('/api/convertlayer/:layerId')
    .post((req, res, next) => {
        console.log('convertlayer');
        req['resource'] = {
            type: 'project',
            domain: req.headers.domain
        };
        cop(req, res, next);
    });

cs.server.use(ExpressStatic(path.resolve(__dirname, 'data')));
// cs.server.use(auth);

var debug = true;

cs.start(() => {

    // const pep = nodeAuth.initPEP(policyStore);
    // const cop = pep.getPolicyEnforcer('Main policy set');

    this.config = cs.config;
    this.config.add('server', 'http://localhost:' + cs.options.port);
    // const bagDatabase = new csweb.BagDatabase(this.config);
    const osmDatabase = new csweb.NominatimSource(this.config);
    const mapLayerFactory = new csweb.MapLayerFactory([
        // bagDatabase,
        osmDatabase], cs.messageBus, cs.api, cs.dir);

    const apiRoutes = Router();
    apiRoutes.route('/projecttemplate')
        .post((req, res, next) => {
            console.log('projecttemplate');
            next();
        })
        .post(mapLayerFactory.process);

    apiRoutes.route('/api/convertlayer/:layerId')
        .post((req, res, next) => {
            console.log('convertlayer');
            mapLayerFactory.addGeometryRequest(req, res);
            // next();
        });

    apiRoutes.route('/requestproject')
        .post((req, res) => {
            const project = <csweb.Project>req.body;
            cs.api.addProject(project, {}, (result: csweb.CallbackResult) => {
                if (result.result === csweb.ApiResult.OK) {
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

    apiRoutes.route('/updategrouptitle')
        .post((req, res) => {
            const creds = req['user']; // auth(req);
            if (req.body) {
                const data = req.body;
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
        });

    apiRoutes.route('/clearproject')
        .post((req, res) => {
            const creds = req['user']; // auth(req);
            if (req.body) {
                const data = req.body;
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
        });

    apiRoutes.route('/bagsearchaddress')
        .post(mapLayerFactory.processBagSearchQuery);

    cs.server.use(apiRoutes);

    console.log('Excel2map functions started');
    // Open start webpage
    if (!debug) opn('http://localhost:' + cs.options.port);
});
