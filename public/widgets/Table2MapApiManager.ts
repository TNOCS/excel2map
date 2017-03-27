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
            let url = `api/projects/${projectId}/group`;
            this.$http.post(url, group, {
                timeout: TIMEOUT
            }).then((result) => {
                cb(null);
            }).catch((err) => {
                cb(err);
            });
        }

        public sendLayer(projectId: string, groupId: string, layer: csComp.Services.ProjectLayer, cb: Function) {
            if (!layer || !projectId || !groupId) {
                cb('No layer provided');
                return;
            }
            //send layer
            let url1 = `api/layers/${layer.id}`;
            this.$http.post(url1, layer, {
                timeout: TIMEOUT
            }).then((result) => {
                cb(null);
            }).catch((err) => {
                cb(err);
            });
            //add layer to project
            let url2 = `api/projects/${projectId}/group/${groupId}/layer/${layer.id}`;
            this.$http.post(url2, layer, {
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

        public sendResourceType(resourceType: csComp.Services.IFeatureType, cb: Function) {
            if (!resourceType) {
                cb('No icon provided');
                return;
            }
            let url = `api/resources`;
            this.$http.post(url, resourceType, {
                timeout: TIMEOUT
            }).then((result) => {
                cb(null);
            }).catch((err) => {
                cb(err);
            });
        }
    }
}