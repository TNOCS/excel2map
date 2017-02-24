module widgets {
    export class E2MUploadWidgetData {
        title: string;
        url: string;
    }

    export interface IE2MUploadWidgetScope extends ng.IScope {
        vm: E2MUploadWidgetCtrl;
        data: E2MUploadWidgetData;
        minimized: boolean;
        handleFiles: Function;
    }

    export class E2MUploadWidgetCtrl {
        private scope: IE2MUploadWidgetScope;
        private widget: csComp.Services.IWidget;
        private parentWidget: JQuery;
        private dataProperties: { [key: string]: any };
        private msgBusHandle: csComp.Services.MessageBusHandle;
        private textContent: string;
        private parsedContent: any;
        private projectId: string;
        private password: string;
        private selectedFile: string;
        private uploadAvailable: boolean;

        public static $inject = [
            '$scope',
            '$timeout',
            'layerService',
            'messageBusService',
            'mapService'
        ];

        constructor(
            private $scope: IE2MUploadWidgetScope,
            private $timeout: ng.ITimeoutService,
            private $layerService: csComp.Services.LayerService,
            private $messageBus: csComp.Services.MessageBusService,
            private $mapService: csComp.Services.MapService
        ) {
            $scope.vm = this;
            var par = <any>$scope.$parent;
            this.widget = par.widget;

            $scope.data = <E2MUploadWidgetData>this.widget.data;
            $scope.minimized = false;
            this.dataProperties = {};

            this.parentWidget = $('#' + this.widget.elementId).parent();

            $("#file-upload").change(() => { this.readFile(); });
            document.getElementById('drop-box').addEventListener('drop', (evt) => { this.fileDropped(evt); }, false);

            // Check for the various File API support.
            if ((<any>window).File && (<any>window).FileReader) {
                // Required File APIs are supported.
                this.uploadAvailable = true;
            } else {
                this.uploadAvailable = false;
            }
        }

        private fileDropped(evt) {
            evt.stopPropagation();
            evt.preventDefault();
            this.readFile(evt.dataTransfer.files[0]);
        }

        private canMinimize() {
            return (this.$scope.data.hasOwnProperty('canMinimize'))
                ? this.$scope.data['canMinimize']
                : true;
        }

        private minimize() {
            this.$scope.minimized = !this.$scope.minimized;
            if (this.$scope.minimized) {
                this.parentWidget.css('height', '30px');
            } else {
                this.parentWidget.css('height', this.widget.height);
            }
        }

        private canClose() {
            return (this.$scope.data.hasOwnProperty('canClose'))
                ? this.$scope.data['canClose']
                : true;
        }

        private close() {
            this.parentWidget.hide();
        }

        public stop() {
            if (this.msgBusHandle) {
                this.$messageBus.unsubscribe(this.msgBusHandle);
            }
        }

        private escapeRegExp(str: string) {
            return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
        }

        private replaceAll(str: string, find: string, replace: string) {
            return str.replace(new RegExp(this.escapeRegExp(find), 'g'), replace);
        }

        private readFile(file?: any) {
            if (!this.uploadAvailable) {
                this.$messageBus.notifyError('Cannot upload files', 'Try using a modern browser (Chrome, FireFox, Edge) to be able to upload files, or use the copy/paste option.');
                return;
            }
            if (!file) {
                file = (<any>$('#file-upload')[0]).files[0];
            }
            if (!file || !file.name || file.name.indexOf('.') < 0) {
                this.$messageBus.notifyError('Cannot upload this file', 'The file should have the .json-extension.');
                return;
            } else {
                var ext = file.name.split('.').pop();
                if (ext.toLowerCase() !== 'json') {
                    this.$messageBus.notifyError('Cannot upload this file', 'The file should have the .json-extension.');
                    return;
                }
            }
            var reader = new FileReader();

            reader.onload = (e) => {
                this.textContent = reader.result;
                this.updatedContent();
            }

            reader.readAsText(file);
        }

        // Extract the projectID from the json-data and set it in the projectId box
        private updatedContent() {
            try {
                this.parsedContent = JSON.parse(this.textContent);
                if (this.parsedContent.hasOwnProperty('projectId') && this.parsedContent['projectId'].length > 0) {
                    this.projectId = this.parsedContent['projectId'];
                    this.textContent = JSON.stringify(this.parsedContent, null, 2);
                } else {
                    this.projectId = null;
                    this.password = null;
                    console.log('No project id found');
                }
            } catch (error) {
                this.parsedContent = null;
            }
            if (this.$scope.$root.$$phase !== '$apply' && this.$scope.$root.$$phase !== '$digest') { this.$scope.$apply(); }
        }

        private convertData() {
            this.updatedContent();
            if (!this.parsedContent) {
                this.$messageBus.notifyError('Invalid data format', 'Could not find a project ID in the supplied data.');
                return;
            }
            // If projectID is supplied, use it. Else request a new project instead. 
            if (!this.projectId) {
                this.$messageBus.notifyError('No project ID supplied', 'Could not find a project ID in the supplied data. Excel2Map will create a new project ID for you.');
                $.ajax({
                    type: 'POST',
                    url: '/requestproject',
                    data: {},
                    success: (data) => {
                        this.$timeout(() => {
                            this.$messageBus.notify('Project ID acquired', 'A new project ID has been created successfully');
                            this.password = data.password;
                            this.projectId = data.id;
                            this.parsedContent['projectId'] = data.id;
                            this.textContent = JSON.stringify(this.parsedContent, null, 2);
                        }, 0);
                        this.$timeout(() => {
                            this.uploadProject();
                        }, 200);
                    },
                    error: (err, type, msg) => {
                        this.$messageBus.notifyError('Error while creating project', 'An error occurred when creating your project: ' + err.status + ' ' + msg);
                    }
                });
            } else {
                this.uploadProject();
            }
        }

        private uploadProject() {
            $.ajax({
                type: 'POST',
                url: '/projecttemplate',
                data: this.parsedContent,
                headers: {
                    'Authorization': 'Basic ' + btoa(this.projectId + ':' + this.password)
                },
                success: () => {
                    this.$messageBus.notify('Project uploaded', 'Your data has been uploaded successfully');
                },
                error: (err, type, msg) => {
                    if (err.status == HTTPStatusCodes.UNAUTHORIZED) {
                        this.$messageBus.notifyWithTranslation('ERROR_UPLOADING_PROJECT', 'UNAUTHORIZED');
                    } else {
                        this.$messageBus.notifyWithTranslation('ERROR_UPLOADING_PROJECT', 'ERROR_MSG', { 'msg': err.status + ' ' + msg });
                    }
                }
            });
        }

        private updateProjectId() {
            if (this.parsedContent) {
                this.parsedContent['projectId'] = this.projectId;
                this.textContent = JSON.stringify(this.parsedContent, null, 2);
            }
        }
    }
}
