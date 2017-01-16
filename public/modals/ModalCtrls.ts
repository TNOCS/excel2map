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
            'rowCollection',
            'headerCollection',
            'originalHeaders',
            'selectionOption',
            'selectionAmount',
            'itemsToSelect'
        ];

        private selectedColumns: Table2Map.IHeaderObject[] = [];
        private selectedRows = [];

        constructor(
            private $scope: ITableViewModalScope,
            private $messageBusService: csComp.Services.MessageBusService,
            private $uibModalInstance: any,
            private rowCollection: Dictionary < any > [] = [],
            private headerCollection: Table2Map.IHeaderObject[] = [],
            private originalHeaders: string[] = [],
            private selectionOption: 'none' | 'row' | 'col',
            private selectionAmount: number,
            private itemsToSelect: string[]
        ) {
            $scope.vm = this;
        }

        public selectRow(row: Dictionary < any > ) {
            if (row && row['isSelected']) {
                this.selectedRows.push(row);
            }
        }

        public selectCol(col: Table2Map.IHeaderObject, index: number) {
            index += 1;
            if (this.selectionOption === 'col') {
                if (this.selectedColumns.indexOf(col) >= 0) {
                    console.log(`Deselect col ${col.code} / ${col.title} (${index})`);
                    this.selectedColumns.splice(this.selectedColumns.indexOf(col), 1);
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