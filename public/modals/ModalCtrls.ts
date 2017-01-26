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
                let foundIndex = this.selectedColumns.findIndex((selCol) => {
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
}