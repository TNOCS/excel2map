module ZodkRightPanel {
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
    myModule.directive('zodkrightpanel', [function (): ng.IDirective {
        return {
            restrict: 'E', // E = elements, other options are A=attributes and C=classes
            scope: {}, // isolated scope, separated from parent. Is however empty, as this directive is self contained by using the messagebus.
            templateUrl: 'zodk/ZodkRightPanel.tpl.html',
            replace: true, // Remove the directive from the DOM
            transclude: false, // Add elements and attributes to the template
            controller: ZodkRightPanelCtrl
        };
    }]);

    export enum Panel {
        info = 1,
        layer = 2,
        filter = 3,
        mca = 4
    }

    export interface IZodkRightPanelScope extends ng.IScope {
        vm: ZodkRightPanelCtrl;
        data: any;
    }

    // export interface IZodkRightPanel {
    //     id: string;
    //     name: string;
    // }

    export class ZodkRightPanelCtrl {

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
        public panel: Panel;

        public name: string;
        public userName: string;
        public userPassword: string;

        Panel = Panel;

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
            private $scope: IZodkRightPanelScope,
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

            this.mBusHandles.push(this.messageBusService.subscribe('feature', (title, f) => {
                this.featureMessageReceived(title, f);
            }));

            this.mBusHandles.push(this.messageBusService.subscribe('zodk', (title, f) => {
                this.zodkMessageReceived(title);
            }));

            this.mBusHandles.push(this.messageBusService.subscribe('layer', (title) => {
                this.updateLayerCount();
            }));

            this.propertyTable = new PropertyTable(this.layerService, this.$timeout);

            this.panel = Panel.info

            this.locationFilterActive = false;
            this.filterCount = 0;
            this.layerCount = 0;

            this.mBusHandles.push(this.messageBusService.subscribe('filters', (action) => {
                this.updateFilterCount()
            }));

            this.init();
        }

        public init() {
            this.updateFilterCount();
            this.updateLayerCount();
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
                    this.panel = Panel.info
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

        private removeItem(item: IFeature) {
        }

        public publish(msg: string, data ? : any) {
            this.messageBusService.publish('zodk', msg, data);
        }

        public exportToImage() {
        }

        public close() {
            this.messageBusService.publish('zodk', 'closepanel');
        }

        public isLoggedIn() {
            return this.profileService.isLoggedIn()
        }

        public validateUser() {
            this.profileService.validateUser(this.userName, this.userPassword);
            this.userPassword = '';
        }

        public signupUser() {
            this.profileService.signupUser(this.name, this.userName, this.userPassword);
        }

        public logout() {
            this.profileService.logoutUser();
        }

        public openData() {
            this.panel = Panel.info
            this.$scope.$broadcast('onFilterRefresh', '');
        }

        public openLayers() {
            this.panel = Panel.layer
        }

        public openFilters() {
            if (this.filterCount == 0) {
                return;
            }
            this.panel = Panel.filter
            this.$scope.$broadcast('onFilterRefresh', '');
        }

        public openMCA() {
            this.panel = Panel.mca
        }

        private editProject() {
            location.href = `/?dashboard=table2map&editproject=${this.layerService.project.id}`;
        }

        public setStyle(g: csComp.Services.ProjectGroup, property: FeatureProps.CallOutProperty) {
            // disable all styles, we only want 1 active at the same time
            let current = false
            this.layerService.project.groups.forEach((group: csComp.Services.ProjectGroup) => {
                group.styles.forEach((style: csComp.Services.GroupStyle) => {
                    this.layerService.removeStyle(style);
                    console.log(property);
                    console.log(style);
                    if (g.id == group.id && property.property == style.property)
                        current = true
                });
            });

            // if selected style was active already, this was a toggle event
            if (!current)
                this.layerService.setStyle(property);
        }

        public setFilter(coProperty: FeatureProps.CallOutProperty) {
            this.layerService.setPropertyFilter(coProperty);
        }

        public isFilterActive(coProperty: FeatureProps.CallOutProperty):boolean {
            if (this.filterCount < 1)
                return false;
            return this.filterIndex(coProperty) > -1;
        }

        public filtersFor(coProperty: FeatureProps.CallOutProperty):csComp.Services.GroupFilter {
            return this.activeFilters[this.filterIndex(coProperty)];
        }

        private filterIndex(coProperty: FeatureProps.CallOutProperty):number {
            let key = coProperty.feature.layer.groupId + ":" + coProperty.property;
            return this.activeFilterKeys.indexOf(key);
        }

        public closeAllFilters() {
            this.layerService.project.groups.forEach((group: csComp.Services.ProjectGroup) => {
                group.filters.forEach((filter: csComp.Services.GroupFilter) => {
                    this.layerService.removeFilter(filter);
                });
            });
        }

        private updateFilterCount() {
            if (!this.layerService.project) return;

            let oldFilterCount = this.filterCount
            this.locationFilterActive = false;
            this.filterCount = 0;
            this.activeFilterKeys = [];
            this.activeFilters = [];

            this.layerService.project.groups.forEach((group: csComp.Services.ProjectGroup) => {
                this.filterCount += group.filters.length;

                group.filters.forEach((f: csComp.Services.GroupFilter) => {
                    if (f.filterType === 'location' && this.locationFilterActive === false) this.locationFilterActive = true;

                    if (!f.dimension) {
                        let info = (f.meta['propertyInfo']) ? f.meta['propertyInfo'] :this.layerService.calculatePropertyInfo(group, f.property);
                        let nBins = (f.meta['numberOfBins']) ? f.meta['numberOfBins'] : Math.ceil(Math.sqrt(Object.keys(group.markers).length));
                        let min = info.min;
                        let max = info.max;
                        let binWidth = Math.ceil(Math.abs(max - min) / nBins);

                        let dcDim = group.ndx.dimension(d => {
                            if (!d.properties.hasOwnProperty(f.property)) return null;
                            let prop = d.properties[f.property];
                            if (prop === null) return null;
                            let a = parseFloat(prop) - min;
                            // don't use binned dimensions
                            let b = min + Math.floor(a / binWidth) * binWidth;
                            return parseFloat(prop);
                        });

                        f.dimension = dcDim;
                    }

                    this.activeFilterKeys.push(group.id + ":" + f.property);
                    this.activeFilters.push(f);
                });
            });
        }

        private updateLayerCount() {
            if (!this.layerService.project) return;

            this.layerCount = 0;
            this.layerService.project.groups.forEach((group: csComp.Services.ProjectGroup) => {
                group.layers.forEach((layer: csComp.Services.ProjectLayer) => {
                    if (layer.enabled)
                        this.layerCount++;
                });
            });
        }

        private openTable() {
            this.messageBusService.publish('zodk', 'closepanel');
            this.$timeout(() => {
                var db = this.layerService.findDashboardById('zodkdatatable');
                this.messageBusService.publish('dashboard-main', 'activated', db);
            }, 200);
        }


    }
}
