module ModalCtrls {
    export interface ICsvSettingsModalScope extends ng.IScope {
        vm: CsvSettingsModalCtrl;
        delimiters: Dictionary < string > ;
        decimalCharacters: Dictionary < string > ;
        csvParseSettings: Table2Map.ICSVParseSettings;
    }

    export class CsvSettingsModalCtrl {
        public static $inject = [
            '$scope',
            '$uibModalInstance',
            'delimiters',
            'decimalCharacters',
            'csvParseSettings'
        ];

        constructor(
            private $scope: ICsvSettingsModalScope,
            private $uibModalInstance: any,
            private delimiters: Dictionary < string > ,
            public decimalCharacters: Dictionary < string > ,
            public csvParseSettings: Table2Map.ICSVParseSettings) {

            $scope.vm = this;
            $scope.delimiters = delimiters;
            $scope.decimalCharacters = decimalCharacters;
            $scope.csvParseSettings = csvParseSettings;
        }

        public ok() {
            this.$uibModalInstance.close(this.csvParseSettings);
        }

        public cancel() {
            this.$uibModalInstance.dismiss('cancel');
        }
    }


    export interface ITableViewModalScope extends ng.IScope {
        vm: TableViewModalCtrl;
    }

    export class TableViewModalCtrl {
        public static $inject = [
            '$scope',
            'messageBusService',
            '$uibModalInstance',
            '$timeout',
            'rowCollection',
            'headerCollection',
            'originalHeaders',
            'selectionOption',
            'selectionAmount',
            'itemsToSelect',
            'selectedColumns'
        ];

        private selectedRows = [];

        constructor(
            private $scope: ITableViewModalScope,
            private $messageBusService: csComp.Services.MessageBusService,
            private $uibModalInstance: any,
            private $timeout: ng.ITimeoutService,
            private rowCollection: Dictionary < any > [] = [],
            private headerCollection: Table2Map.IHeaderObject[] = [],
            private originalHeaders: string[] = [],
            private selectionOption: 'none' | 'row' | 'col',
            private selectionAmount: number,
            private itemsToSelect: string[],
            private selectedColumns: Table2Map.IHeaderObject[],
            private showTooltips: boolean = false
        ) {
            $scope.vm = this;
            if (!this.selectedColumns) this.selectedColumns = [];
            $timeout(() => {
                this.preselectColumns();
            }, 0);
        }

        private preselectColumns() {
            this.selectedColumns.forEach((col) => {
                if (col && col.hasOwnProperty('index')) {
                    $(`#st-datatable th:nth-child(${col.index + 1}), #st-datatable td:nth-child(${col.index + 1})`).toggleClass('st-selected', true);
                }
            });
        }

        public swapRows(rowIndex: number) {
            let keys = Object.keys(this.selectedColumns);
            let hObjToSwap = JSON.parse(JSON.stringify(this.selectedColumns[keys[rowIndex]]));
            this.selectedColumns[keys[rowIndex]] = this.selectedColumns[keys[rowIndex + 1]];
            this.selectedColumns[keys[rowIndex + 1]] = hObjToSwap;
        }

        public toggleTooltips() {
            this.showTooltips = !this.showTooltips;
        }

        public selectRow(row: Dictionary < any > ) {
            if (row && row['isSelected']) {
                this.$timeout(() => {
                    this.selectedRows.push(row);
                }, 0);
            }
        }

        public selectCol(col: Table2Map.IHeaderObject, index: number) {
            index += 1;
            if (this.selectionOption === 'col') {
                this.selectedColumns = this.selectedColumns.filter((selCol) => {
                    return selCol != null;
                });
                let foundIndex = _.findIndex(this.selectedColumns, (selCol) => {
                    return selCol.code === col.code;
                });
                if (foundIndex >= 0) {
                    console.log(`Deselect col ${col.code} / ${col.title} (${index})`);
                    this.selectedColumns.splice(foundIndex, 1);
                    $(`#st-datatable th:nth-child(${index}), #st-datatable td:nth-child(${index})`).toggleClass('st-selected', false);
                    return;
                } else if (this.selectedColumns.length >= this.selectionAmount) {
                    this.$messageBusService.notifyWithTranslation('TOO_MANY_COLS', 'TOO_MANY_COLS_MSG');
                    return;
                } else {
                    console.log(`Select col ${col.code} (${index})`);
                    this.selectedColumns.push(col);
                    $(`#st-datatable th:nth-child(${index}), #st-datatable td:nth-child(${index})`).toggleClass('st-selected', true);
                }
            }
        }

        public ok() {
            if (this.selectionOption === 'col') {
                this.$uibModalInstance.close(this.selectedColumns);
            } else if (this.selectionOption === 'row') {
                this.$uibModalInstance.close(this.selectedRows);
            } else {
                this.$uibModalInstance.dismiss('nothing selected');
            }
        }

        public cancel() {
            this.$uibModalInstance.dismiss('cancel');
        }
    }

    export interface ICreateProjectModalScope extends ng.IScope {
        vm: CreateProjectModalCtrl;
    }

    export class CreateProjectModalCtrl {
        public static $inject = [
            '$scope',
            '$uibModalInstance',
            '$http'
        ];

        private title: string;
        private idStatus: 'ok' | 'checking' | 'invalid' = 'invalid';

        constructor(
            private $scope: ICreateProjectModalScope,
            private $uibModalInstance: any,
            private $http: ng.IHttpService) {

            $scope.vm = this;
        }

        private checkExistenceDebounced() {
            if (this.title.length <= 1 || this.title.match(/\"/g)) {
                this.idStatus = 'invalid';
            } else {
                this.idStatus = 'ok';
            }
            if (this.$scope.$root.$$phase !== '$apply' && this.$scope.$root.$$phase !== '$digest') {
                this.$scope.$apply();
            }
        }

        private checkExistence = _.debounce(this.checkExistenceDebounced, 400);

        private inputChanged() {
            this.idStatus = 'checking';
            this.checkExistence();
        }

        public ok() {
            this.$uibModalInstance.close(this.title);
        }

        public cancel() {
            this.$uibModalInstance.dismiss('cancel');
        }
    }

    export interface IChooseLayerModalScope extends ng.IScope {
        vm: ChooseLayerModalCtrl;
    }

    export class ChooseLayerModalCtrl {
        public static $inject = [
            '$scope',
            '$uibModalInstance',
            '$http',
            '$interpolate',
            'project'
        ];

        private groupId: string;
        private layerId: string;
        private clone: boolean;

        constructor(
            private $scope: IChooseLayerModalScope,
            private $uibModalInstance: any,
            private $http: ng.IHttpService,
            private $interpolate: ng.IInterpolateService,
            private project: csComp.Services.Project) {

            $scope.vm = this;
        }

        private selectLayer(groupId: string, layerId: string, closeModal: boolean = false) {
            this.layerId = layerId;
            this.groupId = groupId;
            if (closeModal) this.ok();
        }

        private createLayer(groupId: string) {
            this.groupId = groupId;
            this.layerId = null;
            this.ok();
        }

        private cloneLayer($event, groupId: string, layerId: string) {
            this.groupId = groupId;
            this.layerId = layerId;
            this.clone = true;
            this.ok();
        }

        private removeLayerQuestion($event, groupId: string, layerId: string) {
            let elm = $event.currentTarget || $event.srcElement;
            if (!elm) return;

            const popupElement = this.$interpolate(`<div class="confirmation-popover"><div>{{'REALLY_DELETE_LAYER' | translate}}</div><div class="btn-group"><button id="popover-no" class="btn btn-sm t2m-btn green">{{'NO' | translate}}</button><button id="popover-yes" class="btn btn-sm t2m-btn red" ng-click="vm.removeLayer()">{{'YES' | translate}}</button></div></div>`);
            $(elm).popover({
                animation: true,
                content: popupElement,
                placement: 'left',
                html: true
            });
            $(elm).popover('show');
            $('#popover-yes').on('click', () => {
                this.removeLayer(groupId, layerId);
            });
            $('#popover-no').on('click', () => {
                $(elm).popover('hide');
            });
        }

        private removeLayer(groupId: string, layerId: string) {
            let url = `/api/projects/${this.project.id}/group/${groupId}/layer/${layerId}`;
            this.$http.delete(url, {
                    timeout: 10000
                })
                .then((res) => {
                    if (res.status === 200) {
                        console.log(`Removed layer on server`);
                        // Remove in scope too
                        let g = _.find(this.project.groups, (g) => {
                            return g.id === groupId;
                        });
                        g.layers = g.layers.filter((l) => {
                            return l.id !== layerId;
                        });
                    }
                }).catch((err) => {
                    console.warn(`Could not remove layer: ${err}`);
                });
        }

        private renameGroupQuestion($event, groupId: string) {
            let elm = $event.currentTarget || $event.srcElement;
            if (!elm) return;

            const popupElement = this.$interpolate(`<div class="confirmation-popover"><div>{{'ENTER_NEW_TITLE' | translate}}</div><input id="popoverTitleInput" type="text"/><div class="btn-group"><button id="popover-no" class="btn btn-sm t2m-btn red">{{'CANCEL' | translate}}</button><button id="popover-yes" class="btn btn-sm t2m-btn green">{{'OK' | translate}}</button></div></div>`);
            $(elm).popover({
                animation: true,
                content: popupElement,
                placement: 'left',
                html: true
            });
            $(elm).popover('show');
            $('#popover-yes').on('click', () => {
                var newTitle = $('#popoverTitleInput').val();
                this.updateGroup(this.project.id, groupId, newTitle);
                $(elm).popover('hide');
            });
            $('#popover-no').on('click', () => {
                $(elm).popover('hide');
            });
        }

        private removeGroupQuestion($event, groupId: string) {
            let elm = $event.currentTarget || $event.srcElement;
            if (!elm) return;

            const popupElement = this.$interpolate(`<div class="confirmation-popover"><div>{{'REALLY_DELETE_GROUP' | translate}}</div><div class="btn-group"><button id="popover-no" class="btn btn-sm t2m-btn green">{{'NO' | translate}}</button><button id="popover-yes" class="btn btn-sm t2m-btn red" ng-click="vm.removeGroup()">{{'YES' | translate}}</button></div></div>`);
            $(elm).popover({
                animation: true,
                content: popupElement,
                placement: 'left',
                html: true
            });
            $(elm).popover('show');
            $('#popover-yes').on('click', () => {
                this.removeGroup(this.project.id, groupId);
                $(elm).popover('hide');
            });
            $('#popover-no').on('click', () => {
                $(elm).popover('hide');
            });
        }

        private removeGroup(projectId: string, groupId: string) {
            let url = `/api/projects/${this.project.id}/group/${groupId}`;
            this.$http.delete(url, {
                    timeout: 10000
                })
                .then((res) => {
                    if (res.status === 200) {
                        console.log(`Removed group on server`);
                        // Remove in scope too
                        this.project.groups = this.project.groups.filter((g) => {
                            return g.id !== groupId;
                        });
                    }
                }).catch((err) => {
                    console.warn(`Could not remove group: ${err}`);
                });
        }

        private updateGroup(projectId: string, groupId: string, newTitle: string) {
            let url = `/api/projects/${this.project.id}/group/${groupId}`;
            this.$http.put(url, {id: groupId, title: newTitle}, {
                    timeout: 10000
                })
                .then((res) => {
                    if (res.status === 200) {
                        console.log(`Updated group on server`);
                        // Remove in scope too
                        let group = _.find(this.project.groups, (g) => {
                            return g.id === groupId;
                        });
                        group.title = newTitle;
                    }
                }).catch((err) => {
                    console.warn(`Could not rename group: ${err}`);
                });
        }

        public ok() {
            this.$uibModalInstance.close({
                groupId: this.groupId,
                layerId: this.layerId,
                clone: this.clone
            });
        }

        public cancel() {
            this.$uibModalInstance.dismiss('cancel');
        }
    }

    export interface IManageProjectModalScope extends ng.IScope {
        vm: ManageProjectModalCtrl;
    }

    import IProjectUser = Table2Map.IProjectUser;

    export class ManageProjectModalCtrl {
        public static $inject = [
            '$scope',
            '$uibModalInstance',
            '$http',
            '$translate',
            '$interpolate',
            'tableToMapSvc',
            'project'
        ];

        private newUser: IProjectUser = < IProjectUser > {};
        private users: IProjectUser[] = [];
        private actions: {
            key: string,
            val: any
        }[] = [];

        constructor(
            private $scope: IManageProjectModalScope,
            private $uibModalInstance: any,
            private $http: ng.IHttpService,
            private $translate: ng.translate.ITranslateService,
            private $interpolate: ng.IInterpolateService,
            private t2mSvc: Table2Map.Table2MapSvc,
            private project: csComp.Services.Project) {

            $scope.vm = this;

            for (var a in Table2Map.IChoosableProjectRights) {
                if (typeof Table2Map.IChoosableProjectRights[a] === 'number') {
                    // this.actions[a] = Table2Map.IProjectRights[a];
                    this.actions.push({
                        key: this.$translate.instant(a),
                        val: Table2Map.IChoosableProjectRights[a]
                    });
                }
            }
            this.requestUsers();
            this.resetNewUser();
        }

        private requestUsers() {
            this.t2mSvc.restApi.getUsers(this.project.id, (users) => {
                if (users && users.message) {
                    //filter empty subjects
                    users.message = users.message.filter((obj: Table2Map.IPrivilegeRequest) => {
                        return obj.subject && obj.subject.email && obj.action !== Table2Map.IProjectRights.None;
                    });
                    //parse loki objects
                    this.users = _.map(users.message, this.parseLokiUser);
                }
            });
        }

        private parseLokiUser(obj: Table2Map.IPrivilegeRequest) {
            return {
                email: obj.subject.email,
                rights: obj.action,
                meta: obj.meta,
                $loki: obj.$loki
            };
        }

        private checkExistenceDebounced() {
            if (this.$scope.$root.$$phase !== '$apply' && this.$scope.$root.$$phase !== '$digest') {
                this.$scope.$apply();
            }
        }

        private checkExistence = _.debounce(this.checkExistenceDebounced, 400);

        private resetNewUser() {
            this.newUser.email = '';
            this.newUser.rights = < any > Table2Map.IChoosableProjectRights.READ;
            if (this.$scope.$root.$$phase !== '$apply' && this.$scope.$root.$$phase !== '$digest') {
                this.$scope.$apply();
            }
        }

        private validateEmail(mail: string) {
            return Table2Map.emailRegex.test(mail);
        }

        private addNewUser(user: IProjectUser) {
            if (!user.email || !this.validateEmail(user.email)) {
                return;
            }
            this.t2mSvc.restApi.addUser(this.project.id, user.email, user.rights, (result) => {
                if (result && result.success && result.message) {
                    if (!this.users) this.users = [];
                    this.users.push(this.parseLokiUser(result.message));
                } else {
                    console.warn('Error adding user.');
                }
                this.resetNewUser();
            });
        }

        private cloneUser(user: IProjectUser): IProjectUser {
            let clone = < IProjectUser > {};
            Object.keys(user).forEach((key) => {
                if (key.indexOf('$$') < 0) {
                    clone[key] = user[key];
                }
            });
            return clone;
        }

        private updateUserRole(user: IProjectUser) {
            this.t2mSvc.restApi.updateUser(this.project.id, user, (result) => {
                if (result && result.success && result.message) {
                    // Update user rights in interface
                    let u = _.find(this.users, (u) => {
                        return u.email === user.email;
                    });
                    u = this.parseLokiUser(result.message);
                } else {
                    console.warn('Error add user.');
                }
                this.resetNewUser();
            });
        }

        private deleteUserRole(user: IProjectUser) {
            this.t2mSvc.restApi.deleteUser(this.project.id, user.email, user.rights, (result) => {
                if (result && result.success) {
                    if (!this.users) this.users = [];
                    this.users = this.users.filter((u) => {
                        return u.email !== user.email;
                    });
                } else {
                    console.warn('Error add user.');
                }
                this.resetNewUser();
            });
        }

        private cloneProjectQuestion($event) {
            let elm = $event.currentTarget || $event.srcElement;
            if (!elm) return;

            const popupElement = this.$interpolate(`<div class="confirmation-popover"><div>{{'REALLY_CLONE_PROJECT' | translate}}</div><div class="btn-group"><button id="popover-no" class="btn btn-sm t2m-btn green">{{'NO' | translate}}</button><button id="popover-yes" class="btn btn-sm t2m-btn red" ng-click="vm.cloneProject()">{{'YES' | translate}}</button></div></div>`);
            $(elm).popover({
                animation: true,
                content: popupElement,
                placement: 'left',
                html: true
            });
            $(elm).popover('show');
            $('#popover-yes').on('click', () => {
                this.cloneProject();
            });
            $('#popover-no').on('click', () => {
                $(elm).popover('hide');
            });
        }

        private cloneProject() {
            this.t2mSvc.restApi.cloneProject(this.project.title, this.project.id, (result) => {
                console.log(result);
                if (result.result === HTTPStatusCodes.OK) {
                    //notify
                }
                this.ok();
            });
        }

        private deleteProjectQuestion($event) {
            let elm = $event.currentTarget || $event.srcElement;
            if (!elm) return;

            const popupElement = this.$interpolate(`<div class="confirmation-popover"><div>{{'REALLY_DELETE_PROJECT' | translate}}</div><div class="btn-group"><button id="popover-no" class="btn btn-sm t2m-btn green">{{'NO' | translate}}</button><button id="popover-yes" class="btn btn-sm t2m-btn red" ng-click="vm.deleteProject()">{{'YES' | translate}}</button></div></div>`);
            $(elm).popover({
                animation: true,
                content: popupElement,
                placement: 'left',
                html: true
            });
            $(elm).popover('show');
            $('#popover-yes').on('click', () => {
                this.deleteProject();
            });
            $('#popover-no').on('click', () => {
                $(elm).popover('hide');
            });
        }

        private deleteProject() {
            this.t2mSvc.restApi.deleteProject(this.project.id, (result) => {
                this.ok();
            });
        }

        public ok() {
            this.$uibModalInstance.close(true);
        }

        public cancel() {
            this.$uibModalInstance.dismiss('cancel');
        }
    }
}