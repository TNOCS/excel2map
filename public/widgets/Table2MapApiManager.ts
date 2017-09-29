module Table2Map {

    export const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    import Project = csComp.Services.Project;
    import ProjectGroup = csComp.Services.ProjectGroup;
    import ProjectLayer = csComp.Services.ProjectLayer;

    var TIMEOUT = 30000;
    var PROJECT_URL = '/api/projects';
    var LAYER_URL = '/api/layers';
    var RESOURCES_URL = '/api/resources';
    var PROJECT_MEMBERS_URL = '/api/authorizations';

    export class Table2MapApiManager {
        constructor(private $http: ng.IHttpService, private $messageBus: csComp.Services.MessageBusService) {}

        public createProject(project: Project, cb: Function) {
            let url = PROJECT_URL;
            this.$http.post(url, {
                    title: project.title || 'Mijn titel'
                }, {
                    timeout: 20000
                })
                .then((res: {
                    data: Project
                }) => {
                    project = res.data;
                    cb(project);
                })
                .catch((err) => {
                    console.warn(`Error creating project ${project.id}. ${err}`);
                    cb(null);
                });
        }

        public getProject(projectId: string, cb: Function) {
            let url = `${PROJECT_URL}/${projectId}`;
            this.$http.get(url, {
                    timeout: 20000
                })
                .then((res: {
                    data: Project
                }) => {
                    cb(res.data);
                })
                .catch((err) => {
                    console.warn(`Error creating project ${projectId}. ${err}`);
                    cb(null);
                });
        }

        public deleteProject(projectId: string, cb: Function) {
            if (!projectId) {
                cb();
                return;
            }
            let url = `api/projects/${projectId}`;
            this.$http.delete(url, {
                timeout: TIMEOUT
            }).then((result) => {
                cb(null);
            }).catch((err) => {
                cb(err);
            });
        }

        public sendProject(project: Project, cb: Function) {
            if (!project) {
                cb('No project provided');
                return;
            }
            let url = `api/projects/${project.id}`;
            this.$http.put(url, project, {
                timeout: TIMEOUT
            }).then((result) => {
                cb(null);
            }).catch((err) => {
                cb(err);
            });
        }

        public cloneProject(title: string, projectId: string, cb: Function) {
            if (!projectId) {
                cb('No projectId provided');
                return;
            }
            // First create a new project as clone target
            this.createProject(<any>{title: title + ' (kopie)'}, (createdProject) => {
                if (!createdProject) {
                    console.log('Could not create a new project');
                    cb();
                    return;
                }
                let url = `api/cloneproject/${projectId}/${createdProject.id}`;
                this.$http.get(url, {
                    timeout: TIMEOUT
                }).then((result) => {
                    cb(result);
                }).catch((err) => {
                    cb(err);
                });
            });
        }

        public sendGroup(projectId: string, group: ProjectGroup, cb: Function) {
            if (!group || !projectId) {
                cb('No group provided');
                return;
            }
            let url = `api/projects/${projectId}/group/${group.id}`;
            this.$http.put(url, group, {
                timeout: TIMEOUT
            }).then((result) => {
                cb(null);
            }).catch((err) => {
                cb(err);
            });
        }

        public deleteGroup(projectId: string, groupId: string, cb: Function) {
            if (!projectId || !groupId) {
                cb('No group provided');
                return;
            }
            let url = `api/projects/${projectId}/group/${groupId}`;
            this.$http.delete(url, {
                timeout: TIMEOUT
            }).then((result) => {
                cb(null);
            }).catch((err) => {
                cb(err);
            });
        }

        public sendLayer(projectId: string, groupId: string, layer: ProjectLayer, featuresUpdated: boolean, cb: Function) {
            if (!layer || !projectId || !groupId) {
                cb('No layer provided');
                return;
            }
            if (!featuresUpdated) {
                //send layer
                let url = `api/layers/${layer.id}`;
                this.$http.put(url, layer, {
                    headers: {
                        'Domain': projectId
                    },
                    timeout: TIMEOUT
                }).then((result) => {
                    this.addLayerToProject(projectId, groupId, layer, cb);
                }).catch((err) => {
                    cb(err);
                });
            } else {
                // convert layer
                let url = `api/convertlayer/${layer.id}`;
                this.$http.post(url, {
                    layer: layer
                }, {
                    headers: {
                        'Domain': projectId
                    },
                    timeout: TIMEOUT
                }).then((result) => {
                    if (result && result.data && result.data['notFound']) {
                        let notFoundAdr = Object.keys(result.data['notFound']).join('\n');
                        this.$messageBus.notify('Niet gevonden locaties:', notFoundAdr, csComp.Services.NotifyLocation.TopBar, csComp.Services.NotifyType.Normal, 10000);
                    }
                    this.addLayerToProject(projectId, groupId, layer, cb);
                }).catch((err) => {
                    cb(err);
                });
            }
        }

        public getLayer(projectId: string, layerId: string, cb: Function) {
            let url = `${LAYER_URL}/${layerId}`;
            this.$http.get(url, {
                    headers: {
                        'Domain': projectId
                    },
                    timeout: 20000
                })
                .then((res: {
                    data: ProjectLayer
                }) => {
                    cb(res.data);
                })
                .catch((err) => {
                    console.warn(`Error requesting layer ${layerId}. ${err}`);
                    cb(null);
                });
        }

        public addLayerToProject(projectId: string, groupId: string, layer: ProjectLayer, cb: Function) {
            //add layer to project
            let url = `api/projects/${projectId}/group/${groupId}/layer/${layer.id}`;
            this.$http.post(url, layer, {
                timeout: TIMEOUT
            }).then((result) => {
                cb(null);
            }).catch((err) => {
                cb(err);
            });
        }

        public sendIcon(b64: string, folder: string, filePath: string, cb: Function) {
            if (!b64 || !filePath) {
                cb('No icon provided');
                return;
            }
            let url = `api/files/${folder}/${filePath}`;
            this.$http.post(url, {
                base64: b64
            }, {
                timeout: TIMEOUT
            }).then((result) => {
                cb(null);
            }).catch((err) => {
                cb(err);
            });
        }

        public sendResourceType(resourceType: csComp.Services.ITypesResource, cb: Function) {
            if (!resourceType) {
                cb('No icon provided');
                return;
            }
            let url = RESOURCES_URL;
            this.$http.put(url, resourceType, {
                timeout: TIMEOUT
            }).then((result) => {
                cb(null);
            }).catch((err) => {
                cb(err);
            });
        }

        public getResourceType(layer: ProjectLayer, cb: Function) {
            let url = `${layer.typeUrl}`;
            this.$http.get(url, {
                    timeout: 20000
                })
                .then((res: {
                    data: csComp.Services.ITypesResource
                }) => {
                    cb(res.data);
                })
                .catch((err) => {
                    console.warn(`Error requesting featureType from ${layer.typeUrl}. ${err}`);
                    cb(null);
                });
        }

        public getUsers(projectId: string, cb: Function) {
            let resource: Resource = {
                domain: projectId,
                type: 'project'
            };
            let params = this.mapParameters(resource);
            let url = `${PROJECT_MEMBERS_URL}/resources?${params}`;
            this.$http.get(url, {
                    timeout: 20000
                })
                .then((res: {
                    data: any
                }) => {
                    cb(res.data);
                })
                .catch((err) => {
                    console.warn(`Error requesting project members from ${url}. ${err.data}`);
                    cb(null);
                });
        }

        public addOrDeleteUser(projectId: string, email: string, action: IProjectRights, decision: Decision, cb: Function) {
            let privRequest = < IPrivilegeRequest > {
                subject: {
                    email: email
                },
                action: action,
                resource: {
                    domain: projectId,
                    type: 'project'
                },
                decision: decision
            };
            let url = `${PROJECT_MEMBERS_URL}`;
            this.$http.post(url, privRequest, {
                    timeout: 20000
                })
                .then((res: {
                    data: any
                }) => {
                    cb(res.data);
                })
                .catch((err) => {
                    console.warn(`Error adding or deleting users from ${url}. ${err.data}`);
                    cb(null);
                });
        }

        public addUser(projectId: string, email: string, action: IProjectRights, cb: Function) {
            this.addOrDeleteUser(projectId, email, action, Decision.Permit, cb);
        }

        public deleteUser(projectId: string, email: string, action: IProjectRights, cb: Function) {
            this.addOrDeleteUser(projectId, email, IProjectRights.All, Decision.Deny, cb);
        }

        public updateUser(projectId: string, user: IProjectUser, cb: Function) {
            if (user.rights === IProjectRights.None) {
                this.deleteUser(projectId, user.email, IProjectRights.All, cb);
                return;
            }
            let privRequest = < IPrivilegeRequest > {
                subject: {
                    email: user.email
                },
                action: user.rights,
                resource: {
                    domain: projectId,
                    type: 'project'
                },
                decision: Decision.Permit,
                meta: user.meta,
                $loki: user.$loki
            };
            let params = this.mapParameters(privRequest.resource);
            let url = `${PROJECT_MEMBERS_URL}?${params}`;
            this.$http.put(url, privRequest, {
                    timeout: 20000
                })
                .then((res: {
                    data: any
                }) => {
                    cb(res.data);
                })
                .catch((err) => {
                    console.warn(`Error update user role ${url}. ${err.data}`);
                    cb(null);
                });
        }

        private mapParameters(resource: Resource): string {
            return _.map(resource, (val: any, key: string) => {
                return key.concat('=', val);
            }, '').join('&');
        }

        public loadLogo(imgUrl: string, cb: Function) {
            let url = imgUrl;
            this.$http.get(imgUrl, {
                    responseType: 'arraybuffer'
                })
                .then((res: any) => {
                    let file = new File([res.data], imgUrl.split('/').pop(), {
                        type: 'image/png'
                    });
                    cb(file);
                }).catch((err) => {
                    console.warn(`Could not get project logo: ${err}`);
                    cb(null);
                });
        }
    }
}