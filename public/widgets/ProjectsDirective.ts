module ProjectsDirective {
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
    myModule.directive('projectsDirective', [function (): ng.IDirective {
        return {
            restrict: 'E', // E = elements, other options are A=attributes and C=classes
            scope: {}, // isolated scope, separated from parent. Is however empty, as this directive is self contained by using the messagebus.
            templateUrl: 'widgets/ProjectsDirective.tpl.html',
            replace: true, // Remove the directive from the DOM
            transclude: false, // Add elements and attributes to the template
            controller: ProjectsDirectiveCtrl
        };
    }]);

    import Helpers = csComp.Helpers;
    import Project = csComp.Services.Project;
    import ProjectLayer = csComp.Services.ProjectLayer;
    import ProjectGroup = csComp.Services.ProjectGroup;

    export interface IProjectsDirectiveScope extends ng.IScope {
        vm: ProjectsDirectiveCtrl;
    }

    export class ProjectsDirectiveCtrl {
        private msgBusHandle: csComp.Services.MessageBusHandle;
        private projects: Project[] = [];

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
            'profileService'
        ];

        constructor(
            private $scope: IProjectsDirectiveScope,
            private $http: ng.IHttpService,
            public layerService: csComp.Services.LayerService,
            private $messageBus: csComp.Services.MessageBusService,
            private actionService: csComp.Services.ActionService,
            private $timeout: ng.ITimeoutService,
            private $sce: ng.ISCEService,
            private $uibModal: ng.ui.bootstrap.IModalService,
            private $translate: ng.translate.ITranslateService,
            private profileService: csComp.Services.ProfileService
        ) {
            $scope.vm = this;

            this.msgBusHandle = this.$messageBus.subscribe('profileservice', (title, profile) => {
                this.handleProfileServiceMsg(title, profile);
            });

            this.init();
        }

        private init() {
            this.getUserProjects();
        }

        private handleProfileServiceMsg(title, profile) {
            switch (title) {
                case 'login':
                    this.getUserProjects();
                    break;
                case 'logout':
                    this.clearProjectsList();
                    break;
                default:
                    break;
            }
        }

        private clearProjectsList() {
            this.projects.length = 0;
        }

        /** Returns true if a user is logged in */
        private checkLogin(): boolean {
            let loggedIn = false;
            if (this.profileService && _.isFunction(this.profileService.isLoggedIn)) {
                loggedIn = this.profileService.isLoggedIn();
            }
            if (!loggedIn) {
                this.$messageBus.notify('LOGIN_WARNING', 'LOGIN_FIRST');
            }
            return loggedIn;
        }

        private getUserProjects() {
            if (!this.checkLogin()) {
                this.profileService.startLogin();
                return;
            }
            $('#project-list-refresh').addClass('fa-spin');
            let url = 'api/projects';
            this.$http.get(url).then((res: any) => {
                let projects: _.Collection < Project > = res.data;
                this.projects = _.toArray(projects);
            }).catch((err) => {
                console.warn(`Error getting projects: ${err}`);
            }).finally(() => {
                $('#project-list-refresh').removeClass('fa-spin');
            });
        }

        private editProject(project: Project) {
            this.$messageBus.publish('table2map', 'editproject', (project ? project.id : null));
        }

        private showProject(project: Project) {
            window.location.href = `/?project=${project.id}`;
        }

        private manageProjectRights(project: Project) {
            // this.$messageBus.notify('table2map', 'manageProjectRights');
            if (!this.checkLogin()) return;
            var modalInstance = this.$uibModal.open({
                templateUrl: 'modals/ManageProjectModal.tpl.html',
                controller: 'ManageProjectModalCtrl',
                size: 'lg',
                resolve: {
                    project: () => project,
                }
            });

            modalInstance.result.then((finished: boolean) => {
                if (!finished) return;
                this.$messageBus.notify('table2map', `Update rights for project ${project.title}`);
            }, () => {
                console.log('Modal dismissed at: ' + new Date());
            });
        }

        private createProject() {
            if (!this.checkLogin()) return;
            var modalInstance = this.$uibModal.open({
                templateUrl: 'modals/CreateProjectModal.tpl.html',
                controller: 'CreateProjectModalCtrl',
                resolve: {}
            });

            modalInstance.result.then((title: string) => {
                if (!title) return;
                this.$messageBus.publish('table2map', 'createproject', title);
            }, () => {
                console.log('Modal dismissed at: ' + new Date());
            });
        }
    }
}