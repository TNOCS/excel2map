module Table2Map {
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
    myModule.directive('tableToMap', [function (): ng.IDirective {
        return {
            restrict: 'E', // E = elements, other options are A=attributes and C=classes
            scope: {}, // isolated scope, separated from parent. Is however empty, as this directive is self contained by using the messagebus.
            templateUrl: 'widgets/Table2Map.tpl.html',
            replace: true, // Remove the directive from the DOM
            transclude: false, // Add elements and attributes to the template
            controller: Table2MapCtrl
        };
    }]);

    export interface ITable2MapScope extends ng.IScope {
        vm: Table2MapCtrl;
        data: Table2MapData;
        isOpen: boolean;
        minimized: boolean;
        handleFiles: Function;
        currentStep: number;
        numberOfSteps: number;
        displayedCollection: Dictionary < any > [];
        delimiters: Dictionary < string > ;
        decimalCharacters: Dictionary < string > ;
        propertyTypeTypes: Dictionary < string > ;
        stringFormats: Dictionary < string > ;
        metaData: {
            nr: number,
            total: number
        };
        scrollTo: Function;
    }

    export interface ICSVParseSettings {
        delimiter: string;
        decimalCharacter: string;
        hasHeader: boolean;
    }

    export interface Table2MapData {
        fileExtensions: string[];
        hideTitle: boolean;
        canMinimize: boolean;
    }

    export enum ConversionStep {
        UploadData_1 = 1,
            SetColumnTypes_2 = 2,
            IconFormatting_3 = 3,
            LayerSettings_4 = 4
    }

    /** Assumption of the number of columns before table is parsed. */
    export var MAX_NR_COLUMNS = 100;
    /** Number of columns to show in the widget. */
    export var SHOW_NR_COLUMNS = 20;
    export var NUMBER_OF_STEPS = Object.keys(ConversionStep).length / 2;
    export var DELIMITERS = {
        ';': ';',
        ',': ',',
        'tab': '\t'
    };
    export var DECIMAL_CHARS = {
        '.': '.',
        ',': ','
    };
    export var PROPERTY_TYPES = {
        text: 'string',
        number: 'number',
        options: 'options',
        date: 'date',
        url: 'url',
        textarea: 'textarea'
    };
    export var STRING_FORMATS = {
        'No_decimals': '{0:#,#}',
        'One_decimal': '{0:#,#.#}',
        'Two_decimals': '{0:#,#.##}',
        'Euro_no_decimals': '€{0:#,#}',
        'Euro_two_decimals': '€{0:#,#.00}',
        'Percentage_no_decimals': '{0:#,#}%',
        'Percentage_one_decimal': '{0:#,#.#}%',
        'Percentage_two_decimals': '{0:#,#.##}%',
        'Percentage_four_decimals': '{0:#,#.####}%'
    };

    import Project = csComp.Services.Project;
    import IProjectLayer = csComp.Services.IProjectLayer;
    import ProjectGroup = csComp.Services.ProjectGroup;
    import IFeatureType = csComp.Services.IFeatureType;
    import IFeature = csComp.Services.IFeature;

    export class Table2MapCtrl {
        private widget: csComp.Services.IWidget;
        private parentWidget: JQuery;
        private dataProperties: {
            [key: string]: any
        };
        private msgBusHandle: csComp.Services.MessageBusHandle;
        private textContent: string;
        private parsedContent: any;
        private projectId: string;
        private password: string;
        private selectedFile: string;
        private uploadAvailable: boolean;
        private fileExtensions: string[];
        private numberOfCols: number;
        private numberOfRows: number;
        private rowCollection: Dictionary < any > [] = [];
        private headerCollection: string[] = [];
        private originalHeaders: string[] = [];
        private sections: string[] = [];
        private project: Project = < Project > {
            groups: [{
                title: 'My group',
                id: 'ae34f6'
            }]
        };
        private layer: IProjectLayer = < IProjectLayer > {};
        private featureType: IFeatureType = < IFeatureType > {};
        private selectedGroup: ProjectGroup = < ProjectGroup > {};
        private csvParseSettings: ICSVParseSettings = {
            hasHeader: true,
            delimiter: ';',
            decimalCharacter: '.'
        };

        public static $inject = [
            '$scope',
            '$http',
            'layerService',
            'messageBusService',
            'actionService',
            '$timeout',
            '$sce'
        ];

        constructor(
            private $scope: ITable2MapScope,
            private $http: ng.IHttpService,
            public layerService: csComp.Services.LayerService,
            private $messageBus: csComp.Services.MessageBusService,
            private actionService: csComp.Services.ActionService,
            private $timeout: ng.ITimeoutService,
            private $sce: ng.ISCEService
        ) {
            $scope.vm = this;
            var par = < any > $scope.$parent;
            this.widget = par.widget;

            $scope.data = < Table2MapData > this.widget.data || < Table2MapData > {};
            $scope.isOpen = true;
            $scope.numberOfSteps = NUMBER_OF_STEPS;
            $scope.currentStep = ConversionStep.UploadData_1;
            $scope.delimiters = Table2Map.DELIMITERS;
            $scope.decimalCharacters = Table2Map.DECIMAL_CHARS;
            $scope.propertyTypeTypes = Table2Map.PROPERTY_TYPES;
            $scope.stringFormats = Table2Map.STRING_FORMATS;
            $scope.metaData = {
                nr: 0,
                total: this.rowCollection.length
            };
            $scope.scrollTo = (parent, id) => {
                $(`#${parent}`).animate({
                        scrollTop: $(`#${id}`).offset().top
                    },
                    'slow');
            };

            /* File uploads */
            this.fileExtensions = $scope.data.fileExtensions || [];
            $('#file-upload').change(() => {
                let file = ( < any > $('#file-upload')[0]).files[0];
                this.readFile(file);
            });
            document.getElementById('drop-box').addEventListener('drop', (evt) => {
                this.fileDropped(evt);
            }, false);

            // Check for the various File API support.
            if (( < any > window).File && ( < any > window).FileReader) {
                // Required File APIs are supported.
                this.uploadAvailable = true;
            } else {
                this.uploadAvailable = false;
            }
        }

        private fileDropped(evt) {
            evt.stopPropagation();
            evt.preventDefault();
            this.readFile(evt.dataTransfer.files[0]);
        }

        private canMinimize() {
            return (this.$scope.data.hasOwnProperty('canMinimize')) ?
                this.$scope.data['canMinimize'] :
                true;
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
            this.parentWidget.hide();
        }

        public stop() {
            if (this.msgBusHandle) {
                this.$messageBus.unsubscribe(this.msgBusHandle);
            }
        }

        private escapeRegExp(str: string) {
            return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
        }

        private printExtensions(exts: string[]): string {
            return '*.' + exts.join(', *.');
        }

        private replaceAll(str: string, find: string, replace: string) {
            return str.replace(new RegExp(this.escapeRegExp(find), 'g'), replace);
        }

        /** Reads a  */
        private readFile(file: any) {
            if (!this.uploadAvailable) {
                this.$messageBus.notifyError('Cannot upload files', 'Try using a modern browser (Chrome, FireFox, Edge) to be able to upload files, or use the copy/paste option.');
                return;
            }
            if (!file || !file.name || file.name.indexOf('.') < 0) {
                this.$messageBus.notifyError('Cannot upload this file', 'The file should have one of these extensions: ' + this.printExtensions(this.fileExtensions));
                return;
            } else {
                var ext = file.name.split('.').pop();
                if (!_.contains(this.fileExtensions, ext.toLowerCase())) {
                    this.$messageBus.notifyError('Cannot upload this file', 'The file should have one of these extensions: ' + this.printExtensions(this.fileExtensions));
                    return;
                }
            }
            var reader = new FileReader();

            reader.onload = (e) => {
                this.textContent = reader.result;
                this.updatedContent();
            };

            reader.readAsText(file);
        }

        /** Parse the uploaded csv data to JSON format, for displaying it in a html table. */
        private updatedContent() {
            this.headerCollection = Table2MapCtrl.defaultHeaders(MAX_NR_COLUMNS);
            try {
                ( < any > window).csvtojson({
                        noheader: true, //parse header too, manually extract it from the data afterwards
                        delimiter: [this.csvParseSettings.delimiter],
                        quote: null,
                        trim: false,
                        headers: this.headerCollection,
                        flatKeys: true,
                        maxRowLength: 65535
                    })
                    .fromString(this.textContent)
                    .on('csv', (line, lineIdx) => {
                        if (lineIdx === 0) {
                            this.numberOfCols = line.length;
                        }
                        if (lineIdx % 100 === 0) {
                            console.log(`Parsed ${lineIdx} lines`);
                        }
                    })
                    .on('end_parsed', (jsonArr: any[]) => {
                        console.log(`Parsed ${jsonArr.length} lines`);
                        if (!jsonArr || jsonArr.length === 0 || (this.csvParseSettings.hasHeader && jsonArr.length === 1)) {
                            console.warn(`Warning: parsing csv resulted in empty table`);
                            return;
                        }
                        this.$timeout(() => {
                            this.numberOfCols = Object.keys(jsonArr[0]).length;
                            if (this.numberOfCols > MAX_NR_COLUMNS) {
                                console.error('Too many columns!');
                            } else if (this.numberOfCols < this.headerCollection.length) {
                                this.headerCollection = this.headerCollection.slice(0, this.numberOfCols);
                            }
                            // Store header row if present
                            if (this.csvParseSettings.hasHeader) {
                                this.originalHeaders = _.values(jsonArr.splice(0, 1)[0]);
                            } else {
                                this.originalHeaders = this.headerCollection;
                            }
                            this.rowCollection = jsonArr;
                            this.$scope.metaData = {
                                nr: Math.min(SHOW_NR_COLUMNS, this.rowCollection.length),
                                total: this.rowCollection.length
                            };
                            this.$scope.currentStep = ConversionStep.SetColumnTypes_2;
                        }, 0);
                    })
                    .on('error', (err) => {
                        console.warn(`Error parsing csv: ${err}`);
                    });
            } catch (error) {
                console.warn(error);
            }

            if (this.$scope.$root.$$phase !== '$apply' && this.$scope.$root.$$phase !== '$digest') {
                this.$scope.$apply();
            }
        }

        private convertData() {
            this.updatedContent();
            if (!this.rowCollection) {
                this.$messageBus.notifyError('Invalid data format', 'Could not extract a table from the supplied data.');
                return;
            }
        }

        public selectRow(row: Dictionary < any > ) {
            if (row && row['isSelected']) {
                console.log(`Selected row ${JSON.stringify(row)}`);
            }
        }

        public static defaultHeaders(total: number): string[] {
            let ordA = 'A'.charCodeAt(0);
            let ordZ = 'Z'.charCodeAt(0);
            let len = ordZ - ordA + 1;
            let result = [];
            for (let c = 0; c < total; c++) {
                let n = c;
                let s = '';
                while (n >= 0) {
                    s = String.fromCharCode(n % len + ordA) + s;
                    n = Math.floor(n / len) - 1;
                }
                result.push(s);
            }
            return result;
        }
    }
}