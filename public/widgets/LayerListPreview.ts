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
    myModule.directive('layerlistpreview', ['$compile',
        function ($compile): ng.IDirective {
            return {
                terminal: true, // do not compile any other internal directives
                restrict: 'E', // E = elements, other options are A=attributes and C=classes
                scope: {}, // isolated scope, separated from parent. Is however empty, as this directive is self contained by using the messagebus.
                templateUrl: 'widgets/LayerListPreview.tpl.html',

                replace: true, // Remove the directive from the DOM
                transclude: true, // Add elements and attributes to the template
                controller: LayerListPreviewCtrl
            }
        }
    ]);

    import IFeature = csComp.Services.IFeature;
    import IFeatureType = csComp.Services.IFeatureType;
    import IPropertyType = csComp.Services.IPropertyType;
    import IPropertyTypeData = csComp.Services.IPropertyTypeData;

    export interface ILayerListPreviewScope extends ng.IScope {
        vm: LayerListPreviewCtrl;
    }

    export class LayerListPreviewCtrl {
        private scope: ILayerListPreviewScope;
        private project: csComp.Services.Project;

        // $inject annotation.
        // It provides $injector with information about dependencies to be injected into constructor
        // it is better to have it close to the constructor, because the parameters must match in count and type.
        // See http://docs.angularjs.org/guide/di
        public static $inject = [
            '$scope',
            '$location',
            '$sce',
            'mapService',
            'layerService',
            'messageBusService',
            '$translate',
            '$compile',
            '$timeout'
        ];

        // dependencies are injected via AngularJS $injector
        // controller's name is registered in Application.ts and specified from ng-controller attribute in index.html
        constructor(
            private $scope: ILayerListPreviewScope,
            private $location: ng.ILocationService,
            private $sce: ng.ISCEService,
            private $mapService: csComp.Services.MapService,
            private $layerService: csComp.Services.LayerService,
            private $messageBusService: csComp.Services.MessageBusService,
            private $translate: ng.translate.ITranslateService,
            private $compile: ng.ICompileService,
            private $timeout: ng.ITimeoutService
        ) {
            this.scope = $scope;
            $scope.vm = this;

            this.$messageBusService.subscribe('table2map', (title, data) => {
                switch (title) {
                    case 'update-layerlist':
                        this.$timeout(() => {
                            this.displayList( < csComp.Services.Project > data);
                        }, 0);
                        break;
                }
            });
        }

        public displayList(project: csComp.Services.Project): void {
            if (!project) return;
            this.project = project;
        }
    }
}