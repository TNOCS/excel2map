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
        geometryTypes: Dictionary < ITable2MapGeometryType > ;
        metaData: {
            nr: number,
            total: number
        };
        scrollTo: Function;
        currentZoom: number;
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

    export interface ITable2MapGeometryType {
        name: string;
        nrCols: number;
        drawingMode: 'Point' | 'Polygon';
    }

    export enum ConversionStep {
        UploadData = 1,
            StyleSettings = 2,
            FeatureProps = 3,
            LayerSettings = 4
    }

    /** Assumption of the number of columns before table is parsed. */
    export var MAX_NR_COLUMNS = 100;
    /** Number of columns to show in the widget. */
    export var SHOW_NR_COLUMNS = 20;
    export var NUMBER_OF_STEPS = Object.keys(ConversionStep).length / 2;
    export var MAX_ICON_SIZE = 20 * 1024; // 20kB
    export var PREVIEW_ZOOMLEVEL = 15;
    export var PREVIEW_COORDINATES_POINT = [52.079855, 4.320966];
    export var PREVIEW_COORDINATES_POLYGON = [
        [
            [
                4.31496620,
                52.0788598
            ],
            [
                4.31887149,
                52.0789785
            ],
            [
                4.31917190,
                52.0765915
            ],
            [
                4.3251800,
                52.07845
            ],
            [
                4.32256221,
                52.0817609
            ],
            [
                4.317498,
                52.08046
            ],
            [
                4.314966,
                52.078859
            ]
        ]
    ];

    import Project = csComp.Services.Project;
    import IProjectLayer = csComp.Services.IProjectLayer;
    import ProjectGroup = csComp.Services.ProjectGroup;
    import IFeatureType = csComp.Services.IFeatureType;
    import IFeature = csComp.Services.IFeature;
    import IGeoFeature = csComp.Helpers.IGeoFeature;

    export class Table2MapCtrl {
        private widget: csComp.Services.IWidget;
        private parentWidget: JQuery;
        private parentWidgetId: string;
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
        private geometryColumns: string[] = [];
        private project: Project = < Project > {
            groups: [{
                title: 'My group',
                id: 'ae34f6'
            }]
        };
        private layer: IProjectLayer = < IProjectLayer > {};
        private featureType: IFeatureType = < IFeatureType > {};
        private feature: IGeoFeature = < IGeoFeature > {};
        private marker: L.Marker | L.GeoJSON;
        private selectedGroup: ProjectGroup = < ProjectGroup > {};
        private csvParseSettings: ICSVParseSettings = {
            hasHeader: true,
            delimiter: 'auto',
            decimalCharacter: '.'
        };
        private previewMap: L.Map;

        public static $inject = [
            '$scope',
            '$http',
            'layerService',
            'messageBusService',
            'actionService',
            '$timeout',
            '$sce',
            '$uibModal'
        ];

        constructor(
            private $scope: ITable2MapScope,
            private $http: ng.IHttpService,
            public layerService: csComp.Services.LayerService,
            private $messageBus: csComp.Services.MessageBusService,
            private actionService: csComp.Services.ActionService,
            private $timeout: ng.ITimeoutService,
            private $sce: ng.ISCEService,
            private $uibModal: ng.ui.bootstrap.IModalService
        ) {
            $scope.vm = this;
            var par = < any > $scope.$parent;
            this.widget = par.widget;
            this.parentWidgetId = `${this.widget.elementId}-parent`;
            this.parentWidget = $(`#${this.parentWidgetId}`);

            $scope.data = < Table2MapData > this.widget.data || < Table2MapData > {};
            $scope.isOpen = true;
            $scope.numberOfSteps = NUMBER_OF_STEPS;
            $scope.currentStep = ConversionStep.UploadData;
            $scope.delimiters = Table2Map.DELIMITERS;
            $scope.decimalCharacters = Table2Map.DECIMAL_CHARS;
            $scope.propertyTypeTypes = Table2Map.PROPERTY_TYPES;
            $scope.stringFormats = Table2Map.STRING_FORMATS;
            $scope.geometryTypes = Table2Map.GEOMETRY_TYPES;
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

            $scope.$watchCollection('vm.featureType.style', () => {
                this.updateMarker();
            });

            /* File uploads */
            this.fileExtensions = $scope.data.fileExtensions || [];
            $('#file-upload').change(() => {
                let file = ( < any > $('#file-upload')[0]).files[0];
                this.readFile(file);
            });
            document.getElementById('drop-box').addEventListener('drop', (evt) => {
                this.fileDropped(evt);
                ( < HTMLElement > event.target).style.background = '';
                ( < HTMLElement > event.target).style.borderWidth = '';
            }, false);

            document.getElementById('drop-box').addEventListener('dragenter', (event) => {
                ( < HTMLElement > event.target).style.background = 'rgba(100, 255, 100, 0.3)';
                ( < HTMLElement > event.target).style.borderWidth = '3px';
            }, false);

            document.getElementById('drop-box').addEventListener('dragleave', (event) => {
                // reset background of potential drop target when the draggable element leaves it
                ( < HTMLElement > event.target).style.background = '';
                ( < HTMLElement > event.target).style.borderWidth = '';
            }, false);

            document.getElementById('drop-box').addEventListener('dragend', (event) => {
                // reset background of potential drop target when the dragevent ends
                ( < HTMLElement > event.target).style.background = '';
                ( < HTMLElement > event.target).style.borderWidth = '';
            }, false);

            $('#icon-upload').change(() => {
                let file: File = ( < any > $('#icon-upload')[0]).files[0];
                if (!file.type || file.type !== 'image/png') {
                    this.$messageBus.notifyWithTranslation('UNKNOWN_FORMAT', 'UNKNOWN_FORMAT_MSG');
                } else if (!file.size || file.size > MAX_ICON_SIZE) {
                    this.$messageBus.notifyWithTranslation('FILE_TOO_LARGE', 'FILE_TOO_LARGE_MSG');
                } else {
                    this.readFile(file);
                }
            });

            // Check for the various File API support.
            if (( < any > window).File && ( < any > window).FileReader) {
                // Required File APIs are supported.
                this.uploadAvailable = true;
            } else {
                this.uploadAvailable = false;
            }

            this.initPreviewMap();
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

        /** Reads a file */
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

        private resetVariables() {
            this.headerCollection = Table2MapCtrl.defaultHeaders(MAX_NR_COLUMNS);
            this.rowCollection.length = 0;
            this.featureType = {};
            this.featureType.style = {
                iconUri: '',
                iconWidth: 24,
                iconHeight: 24,
                drawingMode: 'Point',
                stroke: true,
                strokeWidth: 2,
                strokeColor: '#000',
                selectedStrokeColor: '#00f',
                fillColor: '#ff0',
                opacity: 1,
                fillOpacity: 1,
                nameLabel: ''
            };
            this.feature = {
                type: 'Feature',
                geometry: {
                    coordinates: null,
                    type: null
                },
                properties: {}
            };
            this.layer = < IProjectLayer > {};
        }

        /** Parse the uploaded csv data to JSON format, for displaying it in a html table. */
        private updatedContent() {
            this.resetVariables();
            try {
                ( < any > window).csvtojson({
                        noheader: true, //parse header too, manually extract it from the data afterwards
                        delimiter: this.csvParseSettings.delimiter,
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
                            this.$scope.currentStep = ConversionStep.StyleSettings;
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

        public openParseSettings() {
            var modalInstance = this.$uibModal.open({
                templateUrl: 'modals/CsvSettingsModal.tpl.html',
                controller: 'CsvSettingsModalCtrl',
                resolve: {
                    delimiters: () => this.$scope.delimiters,
                    decimalCharacters: () => this.$scope.decimalCharacters,
                    csvParseSettings: () => JSON.parse(JSON.stringify(this.csvParseSettings))
                }
            });

            modalInstance.result.then((csvParseSettings: ICSVParseSettings) => {
                if (!csvParseSettings) return;
                this.csvParseSettings = csvParseSettings;
                this.convertData();
            }, () => {
                console.log('Modal dismissed at: ' + new Date());
            });
        }

        /** Provide option 'none' | 'row' | 'col' */
        public openTable(justShow ? : boolean) {
            // First determine whether to just show the table, or add selection options for rows/cols
            let selectionOption, selectionAmount;
            if (justShow) {
                selectionOption = 'none';
                selectionAmount = 0;
            } else {
                switch (this.$scope.currentStep) {
                    case ConversionStep.StyleSettings:
                        selectionOption = 'col';
                        if (!this.featureType.name) {
                            this.$messageBus.notifyWithTranslation('SELECT_GEOMETRYTYPE_FIRST', '');
                            return;
                        }
                        let type = GEOMETRY_TYPES[this.featureType.name];
                        selectionAmount = (type ? type.nrCols : 1);
                        break;
                    case ConversionStep.FeatureProps:
                        selectionOption = 'row';
                        selectionAmount = 1;
                        break;
                    case ConversionStep.LayerSettings:
                        selectionOption = 'none';
                        break;
                    default:
                        selectionOption = 'none';
                }
            }
            // Create the modal containing the table
            var modalInstance = this.$uibModal.open({
                templateUrl: 'modals/TableViewModal.tpl.html',
                controller: 'TableViewModalCtrl',
                size: 'lg',
                resolve: {
                    rowCollection: () => this.rowCollection,
                    headerCollection: () => this.headerCollection,
                    originalHeaders: () => this.originalHeaders,
                    selectionOption: () => selectionOption,
                    selectionAmount: () => selectionAmount
                }
            });

            modalInstance.result.then((selectedRowCol: any[]) => {
                if (!selectedRowCol) return;
                if (selectionOption === 'col') {
                    console.log(`Selected ${JSON.stringify(selectedRowCol)}`);
                    if (this.$scope.currentStep === ConversionStep.StyleSettings) {
                        this.geometryColumns = _.clone(selectedRowCol);
                    }
                } else if (selectionOption === 'row') {
                    console.log(`Selected ${JSON.stringify(selectedRowCol)}`);
                }
                /** Do something with the selected row */
            }, (reason ? : string) => {
                console.log(`TableViewModal dismissed. ${reason || ''}`);
            });
        }

        private initPreviewMap() {
            this.previewMap = L.map('previewMap').setView(PREVIEW_COORDINATES_POINT, PREVIEW_ZOOMLEVEL);
            let baseLayer = new L.TileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
                subdomains: ['a', 'b', 'c', 'd'],
                minZoom: 6,
                maxZoom: 21
            });
            this.previewMap.on('zoomend', (evt: L.LeafletEvent) => {
                this.updateZoom();
            });
            baseLayer.addTo(this.previewMap);
            this.updateZoom();
        }

        private updateZoom() {
            this.$timeout(() => {
                this.$scope.currentZoom = this.previewMap.getZoom();
            }, 0);
        }

        private selectGeoType() {
            let type = GEOMETRY_TYPES[this.featureType.name];
            this.featureType.style.drawingMode = type.drawingMode;
            this.updateMarker();
        }

        private updateMarker = _.throttle(this.updateMarkerDebounced, 500, {
            leading: false,
            trailing: true
        });

        private updateMarkerDebounced() {
            if (!this.feature || !this.feature.geometry || !this.featureType || !this.featureType.style || !this.featureType.style.drawingMode) return;
            let drawingMode = this.featureType.style.drawingMode;
            if (this.marker) this.previewMap.removeLayer(this.marker);
            this.feature['effectiveStyle'] = this.featureType.style;
            this.feature.geometry.type = drawingMode;
            if (drawingMode === 'Point') {
                this.feature.geometry.coordinates = PREVIEW_COORDINATES_POINT;
                let icon: L.DivIcon = this.getPointIcon( < IFeature > this.feature);
                this.marker = new L.Marker(new L.LatLng(this.feature.geometry.coordinates[0], this.feature.geometry.coordinates[1]), {
                    icon: icon
                });
            } else {
                this.feature.geometry.coordinates = PREVIEW_COORDINATES_POLYGON;
                this.marker = new L.GeoJSON( < any > this.feature);
                this.marker.setStyle(this.getLeafletStyle(this.feature['effectiveStyle']));
            }
            this.marker.addTo(this.previewMap);
        }

        public getPointIcon(feature: IFeature): any {
            var icon: L.DivIcon;
            if (feature.htmlStyle != null) {
                icon = new L.DivIcon({
                    className: '',
                    iconSize: new L.Point(feature.effectiveStyle.iconWidth, feature.effectiveStyle.iconHeight),
                    html: feature.htmlStyle
                });
            } else {
                var iconHtml = csComp.Helpers.createIconHtml(feature);
                icon = new L.DivIcon({
                    className: '',
                    iconSize: new L.Point(iconHtml['iconPlusBorderWidth'], iconHtml['iconPlusBorderHeight']),
                    html: iconHtml['html']
                });
            }
            return icon;
        }

        private getLeafletStyle(style: any) {
            var s = {
                fillColor: style.fillColor,
                weight: style.strokeWidth,
                opacity: style.strokeOpacity,
                fillOpacity: style.fillOpacity
            };
            s['color'] = (typeof style.stroke !== 'undefined' && style.stroke === false) ?
                style.fillColor :
                style.strokeColor;
            return s;
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