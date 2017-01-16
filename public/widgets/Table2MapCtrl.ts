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
        addSectionMode: boolean;
    }

    export interface ICSVParseSettings {
        delimiter: string;
        decimalCharacter: string;
        hasHeader: boolean;
    }

    export interface Table2MapData {
        dataExtensions: string[];
        iconExtensions: string[];
        hideTitle: boolean;
        canMinimize: boolean;
    }

    export interface ITable2MapClusterOptions {
        clustering: boolean;
        clusterLevel: number;
    }

    export interface ITable2MapGeometryType {
        name: string;
        cols: string[];
        drawingMode: 'Point' | 'Polygon';
    }

    export interface IHeaderObject {
        title: string; // Title text
        code: string; // A, B, C etc.
        index: number;
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
    export var DEFAULT_MARKER_ICON = 'images/marker.png';
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
        private fileExtensions: Dictionary < string[] > ;
        private numberOfCols: number;
        private numberOfRows: number;
        private rowCollection: Dictionary < any > [] = [];
        private headerCollection: IHeaderObject[] = [];
        private originalHeaders: string[] = [];
        private sections: Dictionary < string > = {};
        private geometryColumns: Dictionary < IHeaderObject > = {};
        private project: Project = < Project > {
            groups: [{
                title: 'My group',
                id: 'ae34f6'
            }]
        };
        private clusterOptions: ITable2MapClusterOptions = {
            clustering: true,
            clusterLevel: 14
        };
        private layer: IProjectLayer = < IProjectLayer > {};
        private featureType: IFeatureType = < IFeatureType > {};
        private feature: IGeoFeature = < IGeoFeature > {};
        private pType: IPropertyType = < IPropertyType > {};
        private marker: L.Marker | L.GeoJSON;
        private selectedRowIndex = 0;
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
            '$uibModal',
            '$translate'
        ];

        constructor(
            private $scope: ITable2MapScope,
            private $http: ng.IHttpService,
            public layerService: csComp.Services.LayerService,
            private $messageBus: csComp.Services.MessageBusService,
            private actionService: csComp.Services.ActionService,
            private $timeout: ng.ITimeoutService,
            private $sce: ng.ISCEService,
            private $uibModal: ng.ui.bootstrap.IModalService,
            private $translate: ng.translate.ITranslateService
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

            $scope.$watch('currentStep', () => {
                console.log(`Select step ${this.$scope.currentStep}`);
                if (this.$scope.currentStep === ConversionStep.FeatureProps) {
                    this.$messageBus.publish('table2map', 'update-rightpanel', this.feature);
                }
            });

            this.$messageBus.subscribe('table2map', (title, data) => {
                switch (title) {
                    case 'editPropertyType':
                        this.pType = < IPropertyType > data;
                        break;
                };
            });

            /* File uploads */
            this.fileExtensions = {
                'data': $scope.data.dataExtensions || [],
                'icon': $scope.data.iconExtensions || []
            };
            $('#file-upload').change(() => {
                let file = ( < any > $('#file-upload')[0]).files[0];
                this.readFile(file, 'data');
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
                    this.readFile(file, 'icon');
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
            this.readFile(evt.dataTransfer.files[0], 'data');
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
        private readFile(file: any, fileType: 'data' | 'icon') {
            if (!this.uploadAvailable) {
                this.$messageBus.notifyError('Cannot upload files', 'Try using a modern browser (Chrome, FireFox, Edge) to be able to upload files, or use the copy/paste option.');
                return;
            }
            if (!file || !file.name || file.name.indexOf('.') < 0) {
                this.$messageBus.notifyError('Cannot upload this file', 'The file should have one of these extensions: ' + this.printExtensions(this.fileExtensions[fileType]));
                return;
            } else {
                var ext = file.name.split('.').pop();
                if (!_.contains(this.fileExtensions[fileType], ext.toLowerCase())) {
                    this.$messageBus.notifyError('Cannot upload this file', 'The file should have one of these extensions: ' + this.printExtensions(this.fileExtensions[fileType]));
                    return;
                }
            }
            var reader = new FileReader();

            reader.onload = (e) => {
                if (fileType === 'data') {
                    this.textContent = reader.result;
                    this.updatedContent();
                } else {
                    $('#iconImage').attr('src', reader.result);
                    this.featureType.style.iconUri = file.name;
                    this.updateMarker();
                }
            };

            if (fileType === 'data') {
                reader.readAsText(file);
            } else {
                reader.readAsDataURL(file);
            }
        }

        private resetVariables() {
            this.headerCollection.length = 0;
            this.headerCollection = _.map(Table2MapCtrl.defaultHeaders(MAX_NR_COLUMNS), (code: string, index: number) => {
                return {
                    code: code,
                    title: '',
                    index: index
                };
            });
            this.rowCollection.length = 0;
            this.featureType = {};
            this.featureType.style = {
                iconUri: '',
                iconWidth: 24,
                iconHeight: 24,
                cornerRadius: 0,
                drawingMode: 'Point',
                stroke: true,
                strokeWidth: 2,
                selectedStrokeWidth: 3,
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
            $('#iconImage').attr('src', DEFAULT_MARKER_ICON);
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
                        headers: _.pluck(this.headerCollection, 'code'),
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
                            // Store header row if present, otherwise use column code as title
                            if (this.csvParseSettings.hasHeader) {
                                let titles = _.values(jsonArr.splice(0, 1)[0]);
                                _.each(titles, (title, index) => {
                                    this.headerCollection[index].title = title;
                                });
                            } else {
                                _.each(this.headerCollection, (headerObj: IHeaderObject) => {
                                    headerObj.title = headerObj.code;
                                });
                            }
                            this.rowCollection = jsonArr;
                            this.generateFeatureType();
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

        /** Provide option 'none' | 'row' | 'col' and number of selectable items */
        public openTable(selectionOption ? : string, selectionAmount ? : number, isNameLabel ? : boolean) {
            let itemsToSelect: string[];
            // First determine whether to just show the table, or add selection options for rows/cols
            if (selectionOption == null || selectionAmount == null) {
                switch (this.$scope.currentStep) {
                    case ConversionStep.StyleSettings:
                        selectionOption = 'col';
                        if (!this.featureType.name) {
                            this.$messageBus.notifyWithTranslation('SELECT_GEOMETRYTYPE_FIRST', '');
                            return;
                        }
                        let type = GEOMETRY_TYPES[this.featureType.name];
                        selectionAmount = (type ? type.cols.length : 1);
                        itemsToSelect = type.cols;
                        break;
                    case ConversionStep.FeatureProps:
                        selectionOption = 'row';
                        selectionAmount = 1;
                        itemsToSelect = [this.$translate.instant('SELECT_ROW_FOR_PREVIEW')];
                        break;
                    case ConversionStep.LayerSettings:
                        selectionOption = 'none';
                        itemsToSelect = [this.$translate.instant('SELECT_ROW_FOR_PREVIEW')];
                        break;
                    default:
                        selectionOption = 'none';
                }
            }
            if (isNameLabel) {
                itemsToSelect = [this.$translate.instant('SELECT_NAMELABEL')];
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
                    selectionAmount: () => selectionAmount,
                    itemsToSelect: () => itemsToSelect
                }
            });

            modalInstance.result.then((selectedRowCol: any[]) => {
                if (!selectedRowCol) return;
                if (isNameLabel) {
                    this.featureType.style.nameLabel = selectedRowCol[0].code;
                    return;
                }
                if (selectionOption === 'col') {
                    console.log(`Selected ${JSON.stringify(selectedRowCol)}`);
                    if (this.$scope.currentStep === ConversionStep.StyleSettings) {
                        this.geometryColumns = < Dictionary < IHeaderObject >> _.object(GEOMETRY_TYPES[this.featureType.name].cols, selectedRowCol);
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

        private swapRows(rowIndex) {
            let keys = Object.keys(this.geometryColumns);
            let hObjToSwap = JSON.parse(JSON.stringify(this.geometryColumns[keys[rowIndex]]));
            this.geometryColumns[keys[rowIndex]] = this.geometryColumns[keys[rowIndex + 1]];
            this.geometryColumns[keys[rowIndex + 1]] = hObjToSwap;
            console.log(`Swapped row ${keys[rowIndex]} with row ${keys[rowIndex + 1]}`);
        }

        private getColumnTitle(col: string): string {
            let hObj = _.findWhere(this.headerCollection, {code: col});
            if (hObj) {
                return hObj.title;
            } else {
                return col;
            }
        }

        private updatePropertyPreview = _.debounce(this.updatePropertyPreviewDebounced, 1000);

        private updatePropertyPreviewDebounced() {
            this.$messageBus.publish('table2map', 'editPropertyType', this.feature);
        }

        private addSection(newSection: string) {
            this.$timeout(() => {
                if (newSection !== 'Default') {
                    this.sections[newSection] = newSection;
                }
                this.pType.section = this.sections[newSection];
                this.$scope.addSectionMode = false;
                $('#new-section-input').val('');
            }, 0);
            this.updatePropertyPreview();
        }

        private toggleAddSectionWindow() {
            this.$timeout(() => {
                this.$scope.addSectionMode = !this.$scope.addSectionMode;
            }, 0);
            this.$timeout(() => {
                $('#new-section-input').focus();
            }, 50);
        }

        private generateFeatureType() {
            this.featureType._propertyTypeData = [];
            let properties = _.pluck(this.headerCollection, 'code');
            this.featureType.propertyTypeKeys = properties.join(';');
            this.headerCollection.forEach((hObj: IHeaderObject) => {
                this.featureType._propertyTypeData.push( < IPropertyType > {
                    label: hObj.code,
                    title: hObj.title,
                    type: 'text',
                    description: '',
                    visibleInCallOut: true
                });
            });
            this.sections = {
                'Default': null
            };
        }

        public updateMarker = _.throttle(this.updateMarkerDebounced, 500, {
            leading: false,
            trailing: true
        });

        private updateMarkerDebounced() {
            if (!this.feature || !this.feature.geometry || !this.featureType || !this.featureType.style || !this.featureType.style.drawingMode) return;
            let drawingMode = this.featureType.style.drawingMode;
            if (this.marker) this.previewMap.removeLayer(this.marker);
            this.feature['effectiveStyle'] = this.featureType.style;
            this.feature.geometry.type = drawingMode;
            this.feature.properties = this.rowCollection[this.selectedRowIndex];
            this.feature['fType'] = this.featureType;
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