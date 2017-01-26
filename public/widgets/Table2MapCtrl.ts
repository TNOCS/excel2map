module Table2Map {
    /** Config */
    var moduleName = 'csComp';

    /** Module */
    export var myModule;
    try {
        myModule = angular.module(moduleName);
    } catch (err) {
        // named module does not exist, so create one
        myModule = angular.module(moduleName, []);
    }

    /** Directive to send a message to a REST endpoint. Similar in goal to the Chrome plugin POSTMAN. */
    myModule.directive('tableToMap', [function (): ng.IDirective {
        return {
            restrict: 'E', // E = elements, other options are A=attributes and C=classes
            scope: {}, // isolated scope, separated from parent. Is however empty, as this directive is self contained by using the messagebus.
            templateUrl: 'widgets/Table2Map.tpl.html',
            replace: true, // Remove the directive from the DOM
            transclude: false, // Add elements and attributes to the template
            controller: Table2MapCtrl
        };
    }]);

    import Helpers = csComp.Helpers;
    import Project = csComp.Services.Project;
    import ProjectLayer = csComp.Services.ProjectLayer;
    import ProjectGroup = csComp.Services.ProjectGroup;
    import IFeatureType = csComp.Services.IFeatureType;
    import IFeature = csComp.Services.IFeature;
    import IGeoFeature = Helpers.IGeoFeature;

    export interface ITable2MapScope extends ng.IScope {
        vm: Table2MapCtrl;
        data: Table2MapData;
        isOpen: boolean;
        minimized: boolean;
        handleFiles: Function;
        numberOfSteps: number;
        displayedCollection: Dictionary < any > [];
        delimiters: Dictionary < string > ;
        decimalCharacters: Dictionary < string > ;
        propertyTypeTypes: Dictionary < string > ;
        stringFormats: INameValueObject < string > [];
        geometryTypes: Dictionary < ITable2MapGeometryType > ;
        nrSelectedGeometryColumns: number;
        scrollTo: Function;
        selectHighlighted: Function;
    }

    export class Table2MapCtrl {
        private widget: csComp.Services.IWidget;
        private parentWidget: JQuery;
        private parentWidgetId: string;
        private dataProperties: {
            [key: string]: any
        };
        private msgBusHandle: csComp.Services.MessageBusHandle;

        public static $inject = [
            '$scope',
            '$http',
            'layerService',
            'messageBusService',
            'actionService',
            '$timeout',
            '$sce',
            '$uibModal',
            '$translate',
            'tableToMapSvc'
        ];

        constructor(
            private $scope: ITable2MapScope,
            private $http: ng.IHttpService,
            public layerService: csComp.Services.LayerService,
            private $messageBus: csComp.Services.MessageBusService,
            private actionService: csComp.Services.ActionService,
            private $timeout: ng.ITimeoutService,
            private $sce: ng.ISCEService,
            private $uibModal: ng.ui.bootstrap.IModalService,
            private $translate: ng.translate.ITranslateService,
            private t2mSvc: Table2Map.Table2MapSvc
        ) {
            $scope.vm = this;
            var par = < any > $scope.$parent;
            this.widget = par.widget;
            this.parentWidgetId = `${this.widget.elementId}-parent`;
            this.parentWidget = $(`#${this.parentWidgetId}`);

            $scope.data = < Table2MapData > this.widget.data || < Table2MapData > {};
            $scope.isOpen = true;
            $scope.geometryTypes = Table2Map.GEOMETRY_TYPES;
            $scope.stringFormats = Table2Map.STRING_FORMATS;
            $scope.propertyTypeTypes = Table2Map.PROPERTY_TYPES;
            $scope.decimalCharacters = Table2Map.DECIMAL_CHARS;
            $scope.nrSelectedGeometryColumns = 0;

            $scope.$watchCollection('vm.t2mSvc.featureType.style', () => {
                this.t2mSvc.updateMarker();
            });

            $scope.$watchCollection('vm.t2mSvc.geometryColumns', () => {
                $scope.nrSelectedGeometryColumns = _.values(this.t2mSvc.geometryColumns).filter(col => {
                    return col != undefined;
                }).length;
            });

            $scope.$watchCollection('vm.t2mSvc.pType', () => {
                this.t2mSvc.updatePropertyPreview();
            });

            $scope.$watchCollection('vm.t2mSvc.project', () => {
                if (this.t2mSvc.project && this.t2mSvc.project.groups) {
                    this.enableInputs();
                } else {
                    this.disableInputs();
                }
            });

            $scope.$watch('vm.t2mSvc.currentStep', () => {
                console.log(`Select step ${this.t2mSvc.currentStep}`);
                if (this.t2mSvc.currentStep === ConversionStep.FeatureProps) {
                    this.$messageBus.publish('table2map', 'update-rightpanel', this.t2mSvc.feature);
                }
            });

            $scope.selectHighlighted = (value) => {

            };

            this.$messageBus.subscribe('table2map', (title, data) => {
                switch (title) {
                    case 'update-widget-scope':
                        this.updateWidgetScope();
                        break;
                };
            });

            /* File uploads */
            this.t2mSvc.fileExtensions = {
                'data': $scope.data.dataExtensions || [],
                'icon': $scope.data.iconExtensions || [],
                'logo': $scope.data.iconExtensions || []
            };
            $('#file-upload').change(() => {
                let file = ( < any > $('#file-upload')[0]).files[0];
                this.t2mSvc.readFile(file, 'data');
            });
            document.getElementById('drop-box').addEventListener('drop', (evt) => {
                this.fileDropped(evt);
                ( < HTMLElement > event.target).style.background = '';
                ( < HTMLElement > event.target).style.borderWidth = '';
            }, false);

            document.getElementById('drop-box').addEventListener('dragenter', (event) => {
                ( < HTMLElement > event.target).style.background = 'rgba(100, 255, 100, 0.3)';
                ( < HTMLElement > event.target).style.borderWidth = '3px';
            }, false);

            document.getElementById('drop-box').addEventListener('dragleave', (event) => {
                // reset background of potential drop target when the draggable element leaves it
                ( < HTMLElement > event.target).style.background = '';
                ( < HTMLElement > event.target).style.borderWidth = '';
            }, false);

            document.getElementById('drop-box').addEventListener('dragend', (event) => {
                // reset background of potential drop target when the dragevent ends
                ( < HTMLElement > event.target).style.background = '';
                ( < HTMLElement > event.target).style.borderWidth = '';
            }, false);

            $('#icon-upload').change(() => {
                this.imageSelected('icon');
            });
            $('#logo-upload').change(() => {
                this.imageSelected('logo');
            });

            this.disableInputs();
            this.t2mSvc.initPreviewMap();
        }

        private enableInputs() {
            $('#project-settings').css('opacity', 1);
            $('#project-settings input,ui-select').removeAttr('disabled');
        }

        private disableInputs() {
            $('#project-settings').css('opacity', 0.5);
            $('#project-settings input,ui-select').attr('disabled', 'disabled');
        }

        private imageSelected(type: 'icon' | 'logo') {
            let file: File;
            if (type === 'icon') {
                file = ( < any > $('#icon-upload')[0]).files[0];
            } else if (type === 'logo') {
                file = ( < any > $('#logo-upload')[0]).files[0];
            } else {
                return;
            }
            if (!file.type || file.type !== 'image/png') {
                this.$messageBus.notifyWithTranslation('UNKNOWN_FORMAT', 'UNKNOWN_FORMAT_MSG');
            } else if (!file.size || file.size > MAX_ICON_SIZE) {
                this.$messageBus.notifyWithTranslation('FILE_TOO_LARGE', 'FILE_TOO_LARGE_MSG');
            } else {
                this.t2mSvc.readFile(file, type);
            }
        }

        private fileDropped(evt) {
            evt.stopPropagation();
            evt.preventDefault();
            this.t2mSvc.readFile(evt.dataTransfer.files[0], 'data');
        }

        private canMinimize() {
            return (this.$scope.data.hasOwnProperty('canMinimize')) ?
                this.$scope.data['canMinimize'] :
                true;
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
            return (this.$scope.data.hasOwnProperty('canClose')) ?
                this.$scope.data['canClose'] :
                true;
        }

        private close() {
            this.parentWidget.hide();
        }

        public stop() {
            if (this.msgBusHandle) {
                this.$messageBus.unsubscribe(this.msgBusHandle);
            }
        }

        public updateWidgetScope() {
            if (this.$scope.$root.$$phase !== '$apply' && this.$scope.$root.$$phase !== '$digest') {
                this.$scope.$apply();
            }
        }
    }
}