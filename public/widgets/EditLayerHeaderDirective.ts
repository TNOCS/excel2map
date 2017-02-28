module EditLayerHeaderDirective {
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
    myModule.directive('editLayerHeaderDirective', [function (): ng.IDirective {
        return {
            restrict: 'E', // E = elements, other options are A=attributes and C=classes
            scope: {}, // isolated scope, separated from parent. Is however empty, as this directive is self contained by using the messagebus.
            templateUrl: 'widgets/EditLayerHeaderDirective.tpl.html',
            replace: true, // Remove the directive from the DOM
            transclude: false, // Add elements and attributes to the template
            controller: EditLayerHeaderDirectiveCtrl
        };
    }]);

    export interface IEditLayerHeaderDirectiveScope extends ng.IScope {
        vm: EditLayerHeaderDirectiveCtrl;
    }

    export class EditLayerHeaderDirectiveCtrl {

        public static $inject = [
            '$scope',
            'layerService',
            'messageBusService'
        ];

        constructor(
            private $scope: IEditLayerHeaderDirectiveScope,
            private $layerService: csComp.Services.LayerService,
            private $messageBus: csComp.Services.MessageBusService
        ) {
            $scope.vm = this;
        }

        private editProject() {
            location.href = `/?dashboard=table2map&editproject=${this.$layerService.project.id}`;
        }
    }
}