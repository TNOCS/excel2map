module Table2Map {

    var TIMEOUT = 30000;

    export class Table2MapApiManager {
        constructor(private $http: ng.IHttpService) {}

        public sendProject(project: csComp.Services.Project, cb: Function) {
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

        public sendGroup(projectId: string, group: csComp.Services.ProjectGroup, cb: Function) {
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

        public sendLayer(projectId: string, groupId: string, layer: csComp.Services.ProjectLayer, featuresUpdated: boolean, cb: Function) {
            if (!layer || !projectId || !groupId) {
                cb('No layer provided');
                return;
            }
            if (!featuresUpdated) {
                //send layer
                let url = `api/layers/${layer.id}`;
                this.$http.post(url, layer, {
                    timeout: TIMEOUT
                }).then((result) => {
                    this.addLayerToProject(projectId, groupId, layer, cb);
                }).catch((err) => {
                    cb(err);
                });
            } else {
                // convert layer
                let url = `api/convertlayer/${layer.id}`;
                this.$http.post(url, {layer: layer}, {
                    timeout: TIMEOUT
                }).then((result) => {
                    this.addLayerToProject(projectId, groupId, layer, cb);
                }).catch((err) => {
                    cb(err);
                });
            }
        }

        public addLayerToProject(projectId: string, groupId: string, layer: csComp.Services.ProjectLayer, cb: Function) {
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
            let url = `api/resources`;
            this.$http.put(url, resourceType, {
                timeout: TIMEOUT
            }).then((result) => {
                cb(null);
            }).catch((err) => {
                cb(err);
            });
        }
    }
}