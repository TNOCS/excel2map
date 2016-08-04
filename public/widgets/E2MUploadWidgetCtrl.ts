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
            document.getElementById("drop-box").addEventListener("drop", (evt) => {this.fileDropped(evt);}, false);

            // Check for the various File API support.
            if ((<any>window).File && (<any>window).FileReader) {
                // Required File APIs are supported.
                this.uploadAvailable = true;
            } else {
                this.uploadAvailable = false;
                this.$messageBus.notifyError('Cannot upload files', 'Try using a modern browser (Chrome, FireFox, Edge) to be able to upload files, or use the copy/past option.');
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
            if (!file) {
                file = (<any>$('#file-upload')[0]).files[0];
            }
            var reader = new FileReader();

            reader.onload = (e) => {
                $("#clipboard-box").val(reader.result);
                this.updatedContent();
            }

            reader.readAsText(file);
        }

        // Extract the projectID from the json-data and set it in the projectId box
        private updatedContent() {
            this.textContent = $("#clipboard-box").val();
            try {
                this.parsedContent = JSON.parse(this.textContent);
                if (this.parsedContent.hasOwnProperty('projectId')) {
                    this.projectId = this.parsedContent['projectId'];
                    $("#projectid").val(this.projectId);
                } else {
                    console.log("Could not find projectId");
                }
            } catch (error) {
                console.log("Error extracting projectId");
            }
        }

        private convertData() {
            this.updatedContent();
            var pw = $("#password").val().trim();
            $.ajax({
                type: "POST",
                url: "http://localhost:3004/projecttemplate",
                data: this.parsedContent,
                headers: {
                    "Authorization": "Basic " + btoa(this.projectId + ":" + pw)
                },
                success: () => {
                    this.$messageBus.notify('Project uploaded', 'Your data has been uploaded successfully');
                },
                error: (err, type, msg) => {
                    this.$messageBus.notifyError('Error while uploading project', 'An error occurred when uploading your data: ' + type + ' ' + msg);
                }
            });
        }
    }
}
