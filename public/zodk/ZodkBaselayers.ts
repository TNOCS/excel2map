module zodk {
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
     * Directive to display the available map layers.
     */
    myModule.directive('zodkbaselayers', [function (): ng.IDirective {
        return {
            restrict: 'E', // E = elements, other options are A=attributes and C=classes
            scope: {}, // isolated scope, separated from parent. Is however empty, as this directive is self contained by using the messagebus.
            templateUrl: 'zodk/ZodkBaselayers.tpl.html',
            replace: true, // Remove the directive from the DOM
            transclude: false, // Add elements and attributes to the template
            controller: ZodkBaselayersCtrl
        }
    }]);

    export class ZodkBaselayersData {
        baselayers: IBaseLayerOption[];
        showLabels: boolean;
    }

    export interface IBaseLayerOption {
        image: string;
        title: string;
        layerWithoutLabels: string;
        layerWithLabels: string;
    }

    export interface IZodkBaselayersScope extends ng.IScope {
        vm: ZodkBaselayersCtrl;
        data: ZodkBaselayersData;
        style: csComp.Services.GroupStyle;
        filter: csComp.Services.GroupFilter;
        minimized: boolean;
        selectedBaselayer: IBaseLayerOption;
    }

    export class ZodkBaselayersCtrl {
        private scope: IZodkBaselayersScope;
        private widget: csComp.Services.IWidget;
        private parentWidget: JQuery;
        private mBusHandles: csComp.Services.MessageBusHandle[] = [];

        public static $inject = [
            '$scope',
            '$timeout',
            '$translate',
            'layerService',
            'messageBusService',
            'mapService'
        ];

        constructor(
            private $scope: IZodkBaselayersScope,
            private $timeout: ng.ITimeoutService,
            private $translate: ng.translate.ITranslateService,
            private $layerService: csComp.Services.LayerService,
            private $messageBus: csComp.Services.MessageBusService,
            private $mapService: csComp.Services.MapService
        ) {
            $scope.vm = this;
            var par = < any > $scope.$parent;
            this.widget = par.widget;
            if (!this.widget) return;
            this.parentWidget = $(`#${this.widget.elementId}-parent`);

            $scope.data = < ZodkBaselayersData > this.widget.data;
            $scope.minimized = false;

            this.mBusHandles.push(this.$messageBus.subscribe('baselayer', (title: string, data: any) => {
                this.handleBaselayerUpdate(title, data);
            }));

            this.init();

            if (this.$layerService.$rootScope.$$phase !== '$apply' && this.$layerService.$rootScope.$$phase !== '$digest') {
                this.$layerService.$rootScope.$apply();
            }
        }

        private init() {
            this.$scope.selectedBaselayer = _.findWhere(this.$scope.data.baselayers, {
                'layerWithoutLabels': this.$mapService.activeBaseLayerId
            });
            if (this.$scope.selectedBaselayer) return;
            this.$scope.selectedBaselayer = _.findWhere(this.$scope.data.baselayers, {
                'layerWithLabels': this.$mapService.activeBaseLayerId
            });
            this.$scope.data.showLabels = true;
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
            this.hide();
        }

        public stop() {
            if (this.mBusHandles && this.mBusHandles.length > 0) {
                this.mBusHandles.forEach((mbh) => {
                    this.$messageBus.unsubscribe(mbh);
                });
            }
        }

        private hide() {
            if (this.parentWidget.hasClass('collapse')) {
                this.parentWidget.parent().collapse('hide');
            } else {
                this.parentWidget.hide();
            }
        }

        private show() {
            if (this.parentWidget.hasClass('collapse')) {
                this.parentWidget.parent().collapse('show');
            } else {
                this.parentWidget.show();
            }
        }

        private selectBaselayer(bl ? : IBaseLayerOption) {
            if (bl) this.$scope.selectedBaselayer = bl;
            bl = this.$scope.selectedBaselayer;
            if (!bl) return;
            if (this.$scope.data.showLabels && bl.layerWithLabels) {
                this.updateBaselayer(bl.layerWithLabels);
            } else if (this.$scope.data.showLabels && !bl.layerWithLabels) {
                this.$messageBus.notifyWithTranslation('BASELAYER_NOT_AVAILABLE', 'BASELAYER_NOT_AVAILABLE_WITH_LABELS');
                this.$scope.data.showLabels = false;
                this.updateBaselayer(bl.layerWithoutLabels);
            } else if (!this.$scope.data.showLabels && !bl.layerWithoutLabels) {
                this.$messageBus.notifyWithTranslation('BASELAYER_NOT_AVAILABLE', 'BASELAYER_NOT_AVAILABLE_WITHOUT_LABELS');
                this.$scope.data.showLabels = true;
                this.updateBaselayer(bl.layerWithLabels);
            } else {
                this.updateBaselayer(bl.layerWithoutLabels);
            }
        }

        private toggleLabels() {
            this.$scope.data.showLabels = !this.$scope.data.showLabels;
            this.selectBaselayer();
        }

        private updateBaselayer(layerTitle: string) {
            let layerObject = this.$mapService.getBaselayer(layerTitle);
            if (layerObject) {
                this.$layerService.activeMapRenderer.changeBaseLayer(layerObject);
                this.$mapService.changeBaseLayer(layerTitle);
            }
        }

        private handleBaselayerUpdate(title: string, data ? : any) {
            switch (title) {
                case 'removelegend':
                    break;
                default:
                    if (this.$scope.$root.$$phase !== '$apply' && this.$scope.$root.$$phase !== '$digest') {
                        this.$scope.$apply();
                    }
            }
        }
    }
}
