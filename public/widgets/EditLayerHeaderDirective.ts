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
        private canEdit: boolean = false;

        public static $inject = [
            '$scope',
            '$http',
            '$location',
            'layerService',
            'messageBusService',
            'profileService'
        ];

        constructor(
            private $scope: IEditLayerHeaderDirectiveScope,
            private $http: ng.IHttpService,
            private $location: ng.ILocationService,
            private $layerService: csComp.Services.LayerService,
            private $messageBus: csComp.Services.MessageBusService,
            private profileService: csComp.Services.ProfileService
        ) {
            $scope.vm = this;
            this.getProjectAuth();
        }

        /** Returns true if a user is logged in */
        private checkLogin(): boolean {
            let loggedIn = false;
            if (this.profileService && _.isFunction(this.profileService.isLoggedIn)) {
                loggedIn = this.profileService.isLoggedIn();
            }
            if (!loggedIn) {
                // this.$messageBus.notifyWithTranslation('LOGIN_WARNING', 'LOGIN_FIRST');
                console.warn('LOGIN FIRST');
            }
            return loggedIn;
        }

        private getProjectAuth() {
            if (!this.checkLogin()) {
                this.$messageBus.publish('zodk', 'startlogin');
                return;
            }
            let authUrl = 'api/authorizations';
            this.$http.get(authUrl).then((res: any) => {
                let params = this.$location.search();
                let projId;
                if (params.hasOwnProperty('project')) {
                    projId = params['project'];
                }
                let auths: ProjectsDirective.IAuthMessage = res.data;
                let auth = _.find(auths.message, (a: any) => {
                    return (a.resource.domain ? a.resource.domain === projId : false);
                });
                if (auth) {
                    this.canEdit = (auth ? (auth['action'] & Table2Map.IProjectRights.Author) === Table2Map.IProjectRights.Author : false);
                } else {
                    console.log(`Could not find permissions for project ${projId}`);
                }
            }).catch((err) => {
                console.warn(`Error getting authentication: ${err}`);
            });
        }

        private editProject() {
            location.href = `${Table2Map.DEPLOY_URL}?dashboard=table2map&editproject=${this.$layerService.project.id}`;
        }
    }
}
