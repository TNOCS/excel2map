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
import { NodeAuth, IPolicySet, PolicyStoreFactory, CRUD, User, IUser, initPEP, DecisionCombinator, Resource, IRule, Decision, IPrivilegeRequest, Subject, Action, INodeAuthOptions } from 'node_auth';
import { sendInterceptor, IPolicyStore } from 'node_auth';

const config: IConfig = require('config');
const csCconfig = new csweb.ConfigurationService('./configuration.json');

// Should be set to true for server on zodk
const runOnZODKServer = true;
const zodkServerAddress = (runOnZODKServer ? 'http://www.zorgopdekaart.nl/zelfkaartenmaken' : '');
const port = process.env.PORT || 3004;
const deployPath = process.env.deployPath || '';
console.log('Process env port: ' + port);
console.log('deployPath: ' + deployPath );

(<any>mongoose).Promise = bluebird;
// mongoose.connect('mongodb://localhost/test_e2m'); // connect to database
mongoose.connect(config.mongodb); // connect to database
console.log(config.mongodb.substring(0, 19));

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('DB: we are connected ');
    User.find({ admin: true }, (err, res) => {
        if (err) { return console.error(err); }
        if (res.length === 0) {
            // No admin found: create one
            const user = new User(<IUser>{
                name: config.adminUser,
                email: 'admin@example.com',
                verified: true,
                password: config.adminPassword,
                admin: true
            });
            user.save(err => {
                if (err) { return console.error('Err' + err); };
            });
        }
    });
    // Delete admin
    // User.findOneAndRemove({ admin: true }, (err, res) => {
    //     if (err) { return console.error(err); }
    //     if (res){
    //         console.log(JSON.stringify(res));
    //     }
    // });
});

// Load of create a policy store
const policySets = <IPolicySet[]>[{
    name: 'Main policy set',
    combinator: 'first',
    policies: [
        {
            name: 'rbac',
            combinator: 'first',
            rules: [{
                desc: 'Admins are allowed to request all projects',
                subject: { admin: true },
                action: Action.All,
                decision: Decision.Permit,
                resource: {
                    type: 'project'
                }
            }, {
                // subject: { verified: false },
                action: Action.Create | Action.Read,
                resource: {
                    type: 'project'
                },
                decision: Decision.Permit
            }, {
                action: Action.Create | Action.Read,
                resource: {
                    type: 'image'
                },
                decision: Decision.Permit
            }, {
                desc: 'Subscribed users can create new resources',
                subject: {
                    subscribed: true
                },
                action: Action.Create,
                decision: Decision.Permit
            }]
        },
        {
            name: 'dynamic_rules',
            combinator: 'first',
            rules: []
        }]
}];

Winston.remove(Winston.transports.Console);
Winston.add(Winston.transports.Console, <Winston.ConsoleTransportOptions>{
    colorize: true,
    label: 'csWeb',
    prettyPrint: true
});

var cs = new csweb.csServer(__dirname, <csweb.csServerOptions>{
    port: port,
    swagger: false,
    apiFolder: path.join(`${__dirname}`, 'private', 'data', 'api'),
    corrsEnabled: true,
    corrsSupportedMethods: '*'
});

cs.server.route('*')
    .all((req, res, next) => {
        console.log(`${req.method}: ${req.url}`);
        if (req.body) { console.log(req.body); }
        // console.log(`HEADERS: ${JSON.stringify(req.headers, null, 2)}`);
        next();
    });

const policiesLoaded = (err: Error, ps: IPolicyStore) => {
    if (err) { throw err; }
    const policyStore = ps;

    const auth = NodeAuth(cs.server, <INodeAuthOptions>{
        secretKey: config.nodeAuthSecretKey,
        blockUnauthenticatedUser: false, // if true, default, no unauthenticated user will pass beyond this point
        policyStore: policyStore,
        api: deployPath + '/api',
        expiresIn: '7d',
        verify: {
            route: true,
            baseUrl: 'WWW.MYDOMAIN.COM/api/activate',
            mailService: null,
            verifyMailOptions: {
                from: 'randommail@randommail.com',
                subject: 'Just verifying that your email is correct',
                html: 'Hello'
            },
            confirmMailOptions: {
                from: 'randommail@randommail.com',
                subject: 'Just confirming that your account is setup and good to go',
                html: 'Yay!'
            }
        },
        onUserChanged: (user: IUser, req: Request, change: CRUD) => {
            console.log(`User ${change}d:`);
            console.log(JSON.stringify(user, null, 2));
        }
    });

    const pep = initPEP(policyStore);
    const cop = pep.getPolicyEnforcer('Main policy set', { resource: { type: 'project' } });
    const policyEditor = policyStore.getPolicyEditor('dynamic_rules', 'Main policy set');

    cs.server.route(deployPath + '/api/authorizations')
        .get((req, res, next) => {
            next();
        })
        .put((req, res, next) => {
            next();
        })
        .delete((req, res, next) => {
            next();
        })
        .post((req, res, next) => {
            next();
        });

    cs.server.route(deployPath + '/api/authorizations/resources/:id')
        .get((req, res, next) => {
            cop(req, res, next);
        });

    cs.server.route(deployPath + '/api/projects')
        .get((req, res, next) => {
            console.log('GET /api/projects');
            console.log(JSON.stringify(req['user'], null, 2));
            // TODO cop should be here! 
            sendInterceptor(res, (projects: { [key: string]: csweb.Project }) => {
                console.log(`Received ${Object.keys(projects).length} projects, now filtering...`);
                const privileges = policyStore.getSubjectPrivileges(req['user']);
                if (!req['user'].admin) {
                    const accessibleProjectIds = privileges.map(r => { return r.resource.domain; });
                    for (let key in projects) {
                        if (!projects.hasOwnProperty(key)) { continue; }
                        if (accessibleProjectIds.indexOf(key) >= 0) { continue; }
                        delete projects[key];
                    }
                }
                console.log(privileges);
                // res['body'] = projectFilter(privileges, projects);
                cop(req, res, next);
            });
            next();
        })
        .post((req, res, next) => {
            console.log('POST /api/projects');
            console.log(JSON.stringify(req['user'], null, 2));
            cop(req, res, next);
        })
        .put((req, res, next) => {
            console.log('PUT /api/projects');
            console.log(JSON.stringify(req['user'], null, 2));
            cop(req, res, next);
        })
        .post((req, res, next) => {
            const email = (<IUser>req['user']).email;
            const id = (<IUser>req['user'])._id;
            console.log('POST /api/projects AUTHN SUCCEEDED');
            console.log(JSON.stringify(req['user'], null, 2));
            sendInterceptor(res, (body) => {
                console.log('INTERCEPTING SEND: /api/projects');
                console.log(JSON.stringify(body, null, 2));
                policyEditor('add', ({
                    desc: `Allow ${id} (${email}) to manage project with id ${body.id}`,
                    subject: { _id: id },
                    action: Action.Manage,
                    resource: {
                        domain: body.id,
                        type: 'project'
                    },
                    decision: Decision.Permit
                }));
                policyStore.save(err => {
                    if (err) { console.error(err); }
                    if (!err) { console.log(`Allow ${email} to manage project with id ${body.id}`); }
                });
            });
            next();
        });

    cs.server.route(deployPath + '/api/projects/:domain')
        .all((req, res, next) => {
            req['resource'] = {
                type: 'project',
                domain: req.params.domain
            };
            cop(req, res, next);
        });

    cs.server.route(deployPath + '/api/layers/:layerId')
        .all((req, res, next) => {
            req['resource'] = {
                type: 'project',
                domain: req.headers.domain
            };
            req['params'] = {
                domain: req.headers.domain
            };
            cop(req, res, next);
        });

    cs.server.route(deployPath + '/api/convertlayer/:layerId')
        .post((req, res, next) => {
            console.log('convertlayer');
            req['resource'] = {
                type: 'project',
                domain: req.headers.domain
            };
            cop(req, res, next);
        });

    cs.server.route(deployPath + '/api/cloneproject/:projectId/:clonedProjectId')
        .get((req, res, next) => {
            console.log('cloneproject');
            req['resource'] = {
                type: 'project',
                domain: req.headers.domain
            };
            cop(req, res, next);
        });

    cs.server.route(deployPath + '/api/files/:folder/:file')
        .all((req, res, next) => {
            req['resource'] = {
                type: 'image'
            };
            cop(req, res, next);
        });


    cs.server.route(deployPath + '/helloworld')
        .all((req, res, next) => {
            res.send('Hello 1');
        });

    cs.server.use(ExpressStatic(path.resolve(__dirname, 'data')));
    cs.server.use(ExpressStatic(path.resolve(deployPath, __dirname, 'private', 'data', 'images')));
    // cs.server.use(auth);

    var debug = true;
    this.config = cs.config;
    this.config.add('server', (runOnZODKServer ? zodkServerAddress : 'http://localhost:') + port);
    this.config.add('baseUrl', deployPath + '/api');

    cs.start(() => {

        // const pep = nodeAuth.initPEP(policyStore);
        // const cop = pep.getPolicyEnforcer('Main policy set');

        this.config = cs.config;
        this.config.add('server', (runOnZODKServer ? zodkServerAddress : 'http://localhost:') + port);
        this.config.add('baseUrl', deployPath + '/api');
        const bagDatabase = new csweb.BagDatabase(csCconfig);
        const osmDatabase = new csweb.NominatimSource(this.config);
        const mapLayerFactory = new csweb.MapLayerFactory([
            osmDatabase,
            bagDatabase], cs.messageBus, cs.api, cs.dir, (runOnZODKServer ? 'zelfkaartenmaken/api' : 'api'));

        const apiRoutes = Router();
        apiRoutes.route(deployPath + '/projecttemplate')
            .post((req, res, next) => {
                console.log('projecttemplate');
                next();
            })
            .post(mapLayerFactory.process);

        apiRoutes.route(deployPath + '/api/convertlayer/:layerId')
            .post((req, res, next) => {
                console.log('convertlayer');
                mapLayerFactory.addGeometryRequest(req, res);
                // next();
            });

        apiRoutes.route(deployPath + '/api/cloneproject/:projectId/:clonedProjectId')
            .get((req, res, next) => {
                console.log('cloneproject');
                cs.api.cloneProject(req.params['projectId'], req.params['clonedProjectId'], {}, (result: csweb.CallbackResult) => {
                    if (result.result === csweb.ApiResult.OK) {
                        res.sendStatus(HTTPStatusCodes.OK);
                    } else {
                        res.sendStatus(HTTPStatusCodes.INTERNAL_SERVER_ERROR);
                    }
                });
                // next();
            });

        apiRoutes.route(deployPath + '/updategrouptitle')
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

        apiRoutes.route(deployPath + '/clearproject')
            .post((req, res) => {
                const creds = req['user']; //  auth(req);
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

        apiRoutes.route(deployPath + '/bagsearchaddress')
            .post(mapLayerFactory.processBagSearchQuery);

        cs.server.use(apiRoutes);

        console.log('Excel2map functions started');
        // Open start webpage
        if (!debug) opn('http://localhost:' + port);
    });
};

const policiesFile = 'policies.json';
fs.exists(policiesFile, exists => {
    if (exists) {
        console.log('PolicyStoreFactory loading... ');
        PolicyStoreFactory(policiesFile, policiesLoaded);
    } else {
        console.log('PolicyStoreFactory creating...');
        PolicyStoreFactory(policiesFile, policiesLoaded, policySets);
    }
});
