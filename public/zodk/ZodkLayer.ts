module zodk {
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
    myModule.directive('zodklayer', [function (): ng.IDirective {
        return {
            restrict: 'E', // E = elements, other options are A=attributes and C=classes
            scope: {}, // isolated scope, separated from parent. Is however empty, as this directive is self contained by using the messagebus.
            templateUrl: 'zodk/ZodkLayer.tpl.html',
            replace: true, // Remove the directive from the DOM
            transclude: false, // Add elements and attributes to the template
            controller: ZodkLayerCtrl
        };
    }]);

    export interface ZodkLayerData {
        title: string;
    }

    export interface IZodkLayerScope extends ng.IScope {
        vm: ZodkLayerCtrl;
        data: ZodkLayerData;
    }

    export class ZodkLayerCtrl {

        private mBusHandles: csComp.Services.MessageBusHandle[] = [];
        private widget: csComp.Services.IWidget;


        public static $inject = [
            '$scope',
            '$timeout',
            '$translate',
            'layerService',
            'messageBusService',
            'mapService'
        ];

        constructor(
            private $scope: IZodkLayerScope,
            private $timeout: ng.ITimeoutService,
            private $translate: ng.translate.ITranslateService,
            private layerService: csComp.Services.LayerService,
            private messageBusService: csComp.Services.MessageBusService,
            private $mapService: csComp.Services.MapService
        ){
            $scope.vm = this;
            var par = < any > $scope.$parent;

            if (par.widget) {
                $scope.data = < any > par.widget.data;
            } else {
                $scope.data = < any > par.data;
            }

            this.mBusHandles.push(this.messageBusService.subscribe('layer', (title) => {
               console.log("layer update: " + title);
               console.log($scope.vm.layerService.project.groups);

            }));

            this.init();
        }

        private init() {
        }

        private toggleLayer(layer: csComp.Services.ProjectLayer): void {
            this.layerService.toggleLayer(layer);
        }

        /** Hide groups whose title or id start with an underscore */
        private filterHiddenGroups(group: csComp.Services.ProjectGroup) {
            return group.title[0] !== '_' && group.id[0] !== '_';
        }

        private turnOffLayers(){
          this.layerService.closeProject();
        }

    }
}
