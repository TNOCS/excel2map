module Table2Map {
    /**
     * Config
     */
    var moduleName = 'csComp';

    /**
     * Module
     */
    export var myModule;
    try {
        myModule = angular.module(moduleName);
    } catch (err) {
        // named module does not exist, so create one
        myModule = angular.module(moduleName, []);
    }

    /**
     * Directive to display a feature's properties in a panel.
     *
     * @seealso          : http://www.youtube.com/watch?v=gjJ5vLRK8R8&list=UUGD_0i6L48hucTiiyhb5QzQ
     * @seealso          : http://plnkr.co/edit/HyBP9d?p=preview
     */
    myModule.directive('rightpanelpreview', ['$compile',
        function ($compile): ng.IDirective {
            return {
                terminal: true, // do not compile any other internal directives
                restrict: 'E', // E = elements, other options are A=attributes and C=classes
                scope: {}, // isolated scope, separated from parent. Is however empty, as this directive is self contained by using the messagebus.
                templateUrl: 'widgets/RightPanelPreview.tpl.html',

                replace: true, // Remove the directive from the DOM
                transclude: true, // Add elements and attributes to the template
                controller: RightPanelPreviewCtrl
            }
        }
    ]);

    export interface IRightPanelPreviewScope extends ng.IScope {
        vm: RightPanelPreviewCtrl;
        data: any;
        disableEdit: boolean;
    }

    export class RightPanelPreviewCtrl {

        private placesAutocomplete;
        private propertyTable: PropertyTable;
        private selectedItems: IFeature[];
        private mBusHandles: csComp.Services.MessageBusHandle[] = [];
        private lastSelectedName: string;

        public locationFilterActive: boolean;
        public filterCount: number;
        public activeFilterKeys: string[];
        public activeFilters: csComp.Services.GroupFilter[];
        public layerCount: number;
        private selectedProp: any;

        public name: string;
        public userName: string;
        public userPassword: string;

        private hideSubNav: boolean = false;

        public static $inject = [
            '$scope',
            '$http',
            'layerService',
            'messageBusService',
            'actionService',
            '$timeout',
            '$translate',
            '$sce',
            '$uibModal',
            'profileService'
        ];

        constructor(
            private $scope: IRightPanelPreviewScope,
            private $http: ng.IHttpService,
            public layerService: csComp.Services.LayerService,
            private messageBusService: csComp.Services.MessageBusService,
            private actionService: csComp.Services.ActionService,
            private $timeout: ng.ITimeoutService,
            private $translate: ng.translate.ITranslateService,
            private $sce: ng.ISCEService,
            private $uibModal: ng.ui.bootstrap.IModalService,
            private profileService: csComp.Services.ProfileService
        ) {
            $scope.vm = this;

            var par = < any > $scope.$parent;
            if (par.widget) {
                $scope.data = < any > par.widget.data;
            } else {
                $scope.data = < any > par.data;
            }
            if (!$scope.data) {
                $scope.data = {};
            }

            this.mBusHandles.push(this.messageBusService.subscribe('feature', (title, f) => {
                this.featureMessageReceived(title, f);
            }));

            this.mBusHandles.push(this.messageBusService.subscribe('table2map', (title, data) => {
                switch (title) {
                    case 'update-rightpanel':
                        this.$timeout(() => {
                            this.selectFeature( [< IFeature > data]);
                        }, 0);
                        break;
                }
            }));

            this.propertyTable = new PropertyTable(this.layerService, this.$timeout);

            this.init();
        }

        public init() {
        }

        private selectFeature(fts: IFeature[]) {
            if (!fts || !_.isArray(fts)) return;
            this.propertyTable.displayFeature(fts);
        }

        private featureMessageReceived(title: string, f: IFeature): void {
            switch (title) {
                case 'onFeatureDeselect':
                    // this.propertyTable.clearTable();
                    // this.$scope.$apply();
                    break;
                case 'onUpdateWidgets':
                case 'onFeatureSelect':
                    this.messageBusService.publish('zodk', 'openpanel');
                    this.selectFeature([f]);
            };
        }

        private zodkMessageReceived(title: string): void {
            switch (title) {
                case 'clear-rightpanel':
                    this.propertyTable.clearTable();
                    break;
            };
        }

        public publish(msg: string, data ? : any) {
            this.messageBusService.publish('zodk', msg, data);
        }

        private editPropertyType(item: any) {
            this.selectedProp = item;
            this.messageBusService.publish('table2map', 'editPropertyType', item.propertyType);
        }
    }
}