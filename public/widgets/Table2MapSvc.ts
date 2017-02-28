module Table2Map {

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
        additionalInfo: string[]; // E.g. statistical information of geographical regions
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

    export var CONVERSION_STEPS = ['Project- en kaartlaaginstellingen', 'Stijlconfiguratie', 'Data weergave'];

    /** Assumption of the number of columns before table is parsed. */
    export var MAX_NR_COLUMNS = 100;
    /** Number of columns to show in the widget. */
    export var SHOW_NR_COLUMNS = 20;
    export var NUMBER_OF_STEPS = Object.keys(ConversionStep).length / 2;
    export var MAX_ICON_SIZE = 20 * 1024; // 20kB
    export var DEFAULT_MARKER_ICON = 'images/marker.png';
    export var NAME_LABELS = ['naam', 'name'];
    export var POSTCODE_LABELS = ['postcode', 'postal', 'zip'];
    export var H_NR_LABELS = ['huisnummer', 'huisnr', 'nr'];
    export var H_LTR_LABELS = ['huisletter', 'huisltr', 'letter'];
    export var H_TOEV_LABELS = ['huisnummertoevoeging', 'huisnrtoev', 'toevoeging'];
    export var LAT_LABELS = ['latitude', 'lat'];
    export var LNG_LABELS = ['longitude', 'long', 'lng'];
    export var RDX_LABELS = ['rdx', 'rd-x', 'x'];
    export var RDY_LABELS = ['rdy', 'rd-y', 'y'];
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

    import Helpers = csComp.Helpers;
    import Project = csComp.Services.Project;
    import ProjectLayer = csComp.Services.ProjectLayer;
    import ProjectGroup = csComp.Services.ProjectGroup;
    import IFeatureType = csComp.Services.IFeatureType;
    import IFeature = csComp.Services.IFeature;
    import IGeoFeature = Helpers.IGeoFeature;

    export class Table2MapSvc {
        private dataProperties: {
            [key: string]: any
        };
        private msgBusHandle: csComp.Services.MessageBusHandle;
        private textContent: string;
        private parsedContent: any;
        private password: string;
        private selectedFile: string;
        private uploadAvailable: boolean;
        public fileExtensions: Dictionary < string[] > = Table2Map.getDefaultFileExtensions();
        private numberOfCols: number;
        private numberOfRows: number;
        private rowCollection: Dictionary < any > [] = [];
        private headerCollection: IHeaderObject[] = [];
        private originalHeaders: string[] = [];
        private sections: INameValueObject < string > [] = [];
        private geometryType: ITable2MapGeometryType;
        private geometryTypeId: string;
        public geometryColumns: Dictionary < IHeaderObject > = {};
        public project: Project = < Project > {};
        private clusterOptions: ITable2MapClusterOptions = {
            clustering: true,
            clusterLevel: 14
        };
        public layer: ProjectLayer = < ProjectLayer > {};
        public featureType: IFeatureType = < IFeatureType > {};
        public feature: IFeature = < IFeature > {};
        public pType: IPropertyType = < IPropertyType > {};
        private marker: L.Marker | L.GeoJSON;
        private popup: L.Popup;
        private selectedRowIndex = 0;
        private selectedGroup: ProjectGroup = < ProjectGroup > {};
        private csvParseSettings: ICSVParseSettings = {
            hasHeader: true,
            delimiter: 'auto',
            decimalCharacter: '.'
        };
        public metaData: {
            nr: number,
            total: number
        };
        public addSectionMode: boolean;
        public addGroupMode: boolean;
        public numberOfSteps: number;
        public currentStep: number;
        public currentZoom: number;
        private previewMap: L.Map;
        private iconData: string; // Icon in base64 format
        private logoData: string; // Project logo in base64 format
        private conversionSteps: string[] = CONVERSION_STEPS;

        public static $inject = [
            '$http',
            'dashboardService',
            'layerService',
            'messageBusService',
            'actionService',
            '$location',
            '$timeout',
            '$sce',
            '$uibModal',
            '$translate'
        ];

        constructor(
            private $http: ng.IHttpService,
            private $dashboardService: csComp.Services.DashboardService,
            private layerService: csComp.Services.LayerService,
            private $messageBus: csComp.Services.MessageBusService,
            private actionService: csComp.Services.ActionService,
            private $location: ng.ILocationService,
            private $timeout: ng.ITimeoutService,
            private $sce: ng.ISCEService,
            private $uibModal: ng.ui.bootstrap.IModalService,
            private $translate: ng.translate.ITranslateService
        ) {

            this.$dashboardService.widgetTypes['tableToMap'] = < csComp.Services.IWidget > {
                id: 'tableToMap',
                icon: 'bower_components/csweb/dist-bower/images/widgets/table.png',
                description: 'Show Table2Map widget'
            };

            this.currentStep = ConversionStep.UploadData;
            this.numberOfSteps = Object.keys(ConversionStep).length / 2;
            this.metaData = {
                nr: 0,
                total: this.rowCollection.length
            };

            this.$messageBus.subscribe('table2map', (title, data) => {
                switch (title) {
                    case 'editPropertyType':
                        this.pType = < IPropertyType > data;
                        break;
                    case 'editproject':
                        this.editProject(data);
                        break;
                    case 'requestproject':
                        this.requestProject(data, (project) => {
                            this.project = project;
                            this.password = project['password'] || this.password;
                            this.startWizard();
                        });
                        break;
                };
            });

            // Check for the various File API support.
            if (( < any > window).File && ( < any > window).FileReader) {
                // Required File APIs are supported.
                this.uploadAvailable = true;
            } else {
                this.uploadAvailable = false;
            }

            // check whether a project-to-edit is passed in the url
            let params = this.$location.search();
            if (params && params.hasOwnProperty('editproject')) {
                this.editProject(params['editproject']);
            }
        }

        private escapeRegExp(str: string) {
            return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
        }

        private cleanRegExp(str: string) {
            return str.replace(/\W/g, '');
        }

        private printExtensions(exts: string[]): string {
            return '*.' + exts.join(', *.');
        }

        private replaceAll(str: string, find: string, replace: string) {
            return str.replace(new RegExp(this.escapeRegExp(find), 'g'), replace);
        }

        private editProject(projectId: string) {
            this.requestProject(projectId, (project) => {
                this.selectLayerForEditing(project);
            });
        }

        private startWizard(): boolean {
            let dash = this.layerService.findDashboardById('table2map');
            if (!dash) return false;
            this.$dashboardService.selectDashboard(dash, 'main');
            return true;
        }

        private selectLayerForEditing(project: Project) {
            var modalInstance = this.$uibModal.open({
                templateUrl: 'modals/ChooseLayerModal.tpl.html',
                controller: 'ChooseLayerModalCtrl',
                resolve: {
                    project: () => project
                }
            });

            modalInstance.result.then((layerId: string) => {
                if (!layerId) return;
                if (this.layerService.project.activeDashboard.id !== 'table2map') {
                    let success = this.startWizard();
                    if (!success) location.href = `/?dashboard=table2map&editproject=${this.layerService.project.id}`;
                }
                this.getLayer(layerId, (success) => {
                    if (success) {
                        this.loadLayerForWizard(project, this.layer);
                    } else {
                        this.$messageBus.notify('ERROR_GETTING_LAYER', 'ERROR_GETTING_LAYER');
                    }
                });
            }, () => {
                console.log('Modal dismissed at: ' + new Date());
            });
        }

        private loadLayerForWizard(project: Project, layer: ProjectLayer) {
            this.project = project;
            this.selectedGroup = this.findGroupForLayer(layer.id);
            this.getFeatureType(layer, (success) => {
                if (success) {
                    this.textContent = this.convertFeatureTypeToCsv(this.featureType);
                    this.textContent = this.textContent.concat('\n', this.convertLayerToCsv(layer));
                    this.feature = layer.data.features[0] || Table2Map.getDefaultFeature();
                    this.getIconData(this.featureType.style.iconUri);
                    this.updatedContent(false);
                    this.startWizard();
                } else {
                    this.$messageBus.notify('ERROR_GETTING_LAYER', 'ERROR_GETTING_LAYER');
                }
            });
        }

        private convertFeatureTypeToCsv(fType: IFeatureType) {
            if (!fType || !fType.hasOwnProperty('propertyTypeData')) return;
            let result: string[] = [];
            _.each(fType['propertyTypeData'], (prop: IPropertyType) => {
                result.push(prop.title || prop.label);
            });
            return result.join(';');
        }

        private convertLayerToCsv(layer: ProjectLayer): string {
            if (!layer.data) layer.data = {};
            if (layer.hasOwnProperty('features')) layer.data.features = layer['features'];
            if (!layer.data || !layer.data.features) return;
            let result: string[] = [];
            _.each(layer.data.features, (f: IFeature) => {
                return result.push(_.values(f.properties).join(';'));
            });
            return result.join('\n');
        }

        private findGroupForLayer(layerId: string) {
            return _.find(this.project.groups, (group) => {
                return _.find(group.layers, (layer) => {
                    return layer.id === layerId;
                });
            });
        }

        private getIconData(url: string) {
            this.$http.get(url, {
                    responseType: 'arraybuffer'
                })
                .then((res: any) => {
                    let blob = new Blob([res.data], {
                        type: 'image/png'
                    });
                    blob['name'] = url;
                    this.readFile(blob, 'icon');
                }).catch((err) => {
                    console.warn(`Could not get icon image: ${err}`);
                });
        }

        public getFeatureType(layer: ProjectLayer, cb: Function) {
            let url = `${layer.typeUrl}`;
            this.$http.get(url, {
                    timeout: 20000
                })
                .then((res: {
                    data: IFeatureType
                }) => {
                    this.featureType = res.data;
                    this.featureType.style = this.featureType['featureTypes']['Default']['style'] || {};
                    cb(true);
                })
                .catch((err) => {
                    console.warn(`Error requesting featureType from ${layer.typeUrl}. ${err}`);
                    cb(null);
                });
        }

        public getLayer(layerId: string, cb: Function) {
            let url = `/api/layers/${layerId}`;
            this.$http.get(url, {
                    timeout: 20000
                })
                .then((res: {
                    data: ProjectLayer
                }) => {
                    this.layer = res.data;
                    cb(true);
                })
                .catch((err) => {
                    console.warn(`Error requesting layer ${layerId}. ${err}`);
                    cb(null);
                });
        }

        /**
         * Either loads the project if it exists, or creates the project if it doesn't.
         */
        public requestProject(projectTitle ? : string, cb ? : Function) {
            let project = < Project > {};
            if (projectTitle) {
                project.id = this.cleanRegExp(projectTitle).toLowerCase();
                project.title = projectTitle;
            }
            let url = '/requestproject';
            this.$http.post(url, {
                    id: project.id,
                    title: project.title || 'Mijn titel'
                }, {
                    timeout: 20000
                })
                .then((res: {
                    data: Project
                }) => {
                    project = res.data;
                    cb(project);
                })
                .catch((err) => {
                    console.warn(`Error requesting project ${project.id}. ${err}`);
                    cb(null);
                });
        }

        /** Reads a file */
        public readFile(file: any, fileType: 'data' | 'icon' | 'logo') {
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
                } else if (fileType === 'icon') {
                    this.$timeout(() => {
                        this.featureType.style.iconUri = file.name;
                        this.iconData = reader.result;
                        this.updateMarker();
                    }, 0);
                } else {
                    this.$timeout(() => {
                        this.project.logo = file.name;
                        this.logoData = reader.result;
                    }, 0);
                }
            };

            if (fileType === 'data') {
                reader.readAsText(file);
            } else {
                reader.readAsDataURL(file);
            }
        }

        private resetVariables() {
            this.iconData = Table2Map.getDefaultIconData();
            this.featureType = {};
            this.featureType.style = {
                iconUri: Table2Map.getDefaultIconUri(),
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
                opacity: 100,
                fillOpacity: 100,
                nameLabel: ''
            };
            this.feature = Table2Map.getDefaultFeature();
            if (!this.layer) this.layer = < ProjectLayer > {};
            if (!this.layer.id) this.layer.id = csComp.Helpers.getGuid();
            $('#iconImage').attr('src', DEFAULT_MARKER_ICON);
        }

        /** Parse the uploaded csv data to JSON format, for displaying it in a html table. */
        public updatedContent(resetVariables: boolean = true) {
            if (resetVariables) this.resetVariables();
            this.headerCollection.length = 0;
            this.headerCollection = _.map(Table2Map.defaultHeaders(MAX_NR_COLUMNS), (code: string, index: number) => {
                return {
                    code: code,
                    title: '',
                    index: index
                };
            });
            this.rowCollection.length = 0;
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
                            this.interpretDataColumns();
                            this.metaData = {
                                nr: Math.min(SHOW_NR_COLUMNS, this.rowCollection.length),
                                total: this.rowCollection.length
                            };
                            if (this.project && this.project.title && this.selectedGroup && this.selectedGroup.id) {
                                this.currentStep = ConversionStep.StyleSettings;
                            }
                            let msg = `Delimiter: ${this.csvParseSettings.delimiter}, Headers: ${(this.csvParseSettings.hasHeader ? 'yes' : 'no')}\nResult: ${_.size(this.headerCollection)} columns & ${this.rowCollection.length} rows.`;
                            this.$messageBus.notifyWithTranslation('DATA_PARSED_CORRECTLY', msg);
                        }, 0);
                    })
                    .on('error', (err) => {
                        console.warn(`Error parsing csv: ${err}`);
                    });
            } catch (error) {
                console.warn(error);
            }

            this.widgetScopeApply();
        }

        private widgetScopeApply() {
            this.$messageBus.publish('table2map', 'update-widget-scope');
        }

        private convertAndOpen() {
            this.convert(() => {
                this.openProject();
            });
        }

        private openProject() {
            window.location.href = `/?project=${this.project.id}`;
        }

        /** Send the data and configuration to the server for conversion */
        private convert(cb: Function) {
            let geometryParams = _.values(this.geometryColumns);
            let layerDefinition: Table2MapLayerDefinition = {
                projectTitle: this.project.title,
                reference: this.layer.id,
                group: this.selectedGroup.id,
                layerTitle: this.layer.title,
                description: this.layer.description,
                featureType: this.featureType.name,
                geometryType: 'Internationaal', //TODO
                parameter1: geometryParams.getKeyAt(0, 'code'),
                parameter2: geometryParams.getKeyAt(1, 'code'),
                parameter3: geometryParams.getKeyAt(2, 'code'),
                parameter4: geometryParams.getKeyAt(3, 'code'),
                iconUri: this.featureType.style.iconUri,
                iconSize: this.featureType.style.iconHeight,
                drawingMode: this.featureType.style.drawingMode,
                fillColor: this.featureType.style.fillColor,
                strokeColor: this.featureType.style.strokeColor,
                selectedStrokeColor: this.featureType.style.selectedStrokeColor,
                strokeWidth: this.featureType.style.strokeWidth,
                isEnabled: this.layer.enabled,
                clusterLevel: this.selectedGroup.clusterLevel,
                useClustering: this.selectedGroup.clustering,
                opacity: this.featureType.style.opacity,
                nameLabel: this.featureType.style.nameLabel,
                includeOriginalProperties: false, //TODO
                defaultFeatureType: this.featureType.name,
                geometryFile: '', //TODO
                geometryKey: '' //TODO
            };
            let layerTemplate: Table2MapLayerTemplate = {
                iconBase64: (this.iconData ? this.iconData.replace(/^data:image\/\w+;base64,/, '') : this.iconData),
                logoBase64: (this.logoData ? this.logoData.replace(/^data:image\/\w+;base64,/, '') : this.logoData),
                projectId: this.project.id,
                layerDefinition: [layerDefinition],
                properties: this.rowCollection,
                propertyTypes: this.featureType._propertyTypeData
            };
            let url = '/projecttemplate';
            this.$http.post(url, layerTemplate, {
                    timeout: 30000,
                    headers: {
                        Authorization: `Basic ${btoa(this.project.id + ':' + this.password)}`
                    }
                })
                .then((res) => {
                    console.log(res.data);
                    if (res.status === 200) this.$messageBus.notifyWithTranslation('UPLOAD_SUCCESS', 'UPLOAD_SUCCESS_MSG');
                    cb();
                })
                .catch((err) => {
                    console.warn(`Error requesting project ${this.project.id}. ${err}`);
                    if (err.status === HTTPStatusCodes.UNAUTHORIZED) {
                        this.$messageBus.notifyWithTranslation('ERROR_UPLOADING_PROJECT', 'UNAUTHORIZED');
                    } else {
                        this.$messageBus.notifyWithTranslation('ERROR_UPLOADING_PROJECT', 'ERROR_MSG', {
                            'msg': err.status + ' ' + err.msg
                        });
                    }
                    cb();
                });
        }

        private parseData() {
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

        /** Try to interpret the data, in order to select the geometry type and name label */
        private interpretDataColumns() {
            let titles = _.pluck(this.headerCollection, 'title');
            let rows = this.rowCollection;
            // Find namelabel
            let hObj = this.findHeader(NAME_LABELS);
            if (hObj) {
                this.featureType.style.nameLabel = hObj.code;
            } else {
                this.featureType.style.nameLabel = this.headerCollection[0].code;
            }
            // Find geometry type
            hObj = this.findHeader(POSTCODE_LABELS);
            if (hObj) {
                let hObj2 = this.findHeader(H_NR_LABELS);
                if (hObj2) {
                    let hObj3 = this.findHeader(H_LTR_LABELS);
                    if (hObj3) {
                        this.geometryTypeId = 'Adres';
                        this.geometryType = GEOMETRY_TYPES['Adres'];
                        let hObj4 = this.findHeader(H_TOEV_LABELS);
                        if (hObj4) {
                            this.geometryColumns = < Dictionary < IHeaderObject >> _.object(this.geometryType.cols, [hObj, hObj2, hObj3, hObj4]);
                        } else {
                            this.geometryColumns = < Dictionary < IHeaderObject >> _.object(this.geometryType.cols, [hObj, hObj2, hObj3]);
                        }
                    } else {
                        this.geometryTypeId = 'Adres_simple';
                        this.geometryType = GEOMETRY_TYPES['Adres_simple'];
                        this.geometryColumns = < Dictionary < IHeaderObject >> _.object(this.geometryType.cols, [hObj, hObj2]);
                    }
                    // 2 headers required, more are optional
                    this.selectGeoType();
                    return;
                }
            }
            // Find geometry type
            hObj = this.findHeader(LAT_LABELS);
            if (hObj) {
                let hObj2 = this.findHeader(LNG_LABELS);
                if (hObj2) {
                    this.geometryTypeId = 'latlong';
                    this.selectGeoType();
                    this.geometryColumns = < Dictionary < IHeaderObject >> _.object(this.geometryType.cols, [hObj, hObj2]);
                    return;
                }
            }
            // Find geometry type
            hObj = this.findHeader(RDX_LABELS, true);
            if (hObj) {
                let hObj2 = this.findHeader(RDY_LABELS, true);
                if (hObj2) {
                    this.geometryTypeId = 'RD';
                    this.selectGeoType();
                    this.geometryColumns = < Dictionary < IHeaderObject >> _.object(this.geometryType.cols, [hObj, hObj2]);
                    return;
                }
            }
        }

        /** Search in the provided list of possible headers, whether there is a matching header in the data.
         * When the exact flag is provided, the headers should match exactly, otherwise a partial match suffices.
         */
        public findHeader(options: string[], exact: boolean = false): IHeaderObject {
            let result;
            options.some((label) => {
                return this.headerCollection.some((hObj) => {
                    let title = hObj.title.toString().toLowerCase().trim();
                    if (title === label || (title.indexOf(label) >= 0 && !exact)) {
                        result = hObj;
                        return true;
                    }
                });
            });
            return (result ? result : null);
        }

        public openParseSettings() {
            var modalInstance = this.$uibModal.open({
                templateUrl: 'modals/CsvSettingsModal.tpl.html',
                controller: 'CsvSettingsModalCtrl',
                resolve: {
                    delimiters: () => Table2Map.DELIMITERS,
                    decimalCharacters: () => Table2Map.DECIMAL_CHARS,
                    csvParseSettings: () => JSON.parse(JSON.stringify(this.csvParseSettings))
                }
            });

            modalInstance.result.then((csvParseSettings: ICSVParseSettings) => {
                if (!csvParseSettings) return;
                this.csvParseSettings = csvParseSettings;
                this.parseData();
            }, () => {
                console.log('Modal dismissed at: ' + new Date());
            });
        }

        /** Provide option 'none' | 'row' | 'col' and number of selectable items */
        public openTable(selectionOption ? : string, selectionAmount ? : number, isNameLabel ? : boolean) {
            let itemsToSelect: string[];
            let selectedColumns: {}[];
            // First determine whether to just show the table, or add selection options for rows/cols
            if (selectionOption == null || selectionAmount == null) {
                switch (this.currentStep) {
                    case ConversionStep.StyleSettings:
                        selectionOption = 'col';
                        if (!this.geometryType) {
                            this.$messageBus.notifyWithTranslation('SELECT_GEOMETRYTYPE_FIRST', '');
                            return;
                        }
                        let type = this.geometryType;
                        selectionAmount = (type ? type.cols.length : 1);
                        itemsToSelect = type.cols;
                        selectedColumns = _.toArray(this.geometryColumns).filter(col => {
                            return col != undefined;
                        });
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
                selectedColumns = [_.find(this.headerCollection, (hObj) => {
                    return this.featureType.style.nameLabel === hObj.code;
                })];
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
                    itemsToSelect: () => itemsToSelect,
                    selectedColumns: () => selectedColumns
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
                    if (this.currentStep === ConversionStep.StyleSettings) {
                        this.geometryColumns = < Dictionary < IHeaderObject >> _.object(this.geometryType.cols, selectedRowCol);
                    }
                } else if (selectionOption === 'row') {
                    console.log(`Selected ${JSON.stringify(selectedRowCol)}`);
                }
                /** Do something with the selected row */
            }, (reason ? : string) => {
                console.log(`TableViewModal dismissed. ${reason || ''}`);
            });
        }

        public initPreviewMap() {
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
                this.currentZoom = this.previewMap.getZoom();
            }, 0);
        }

        /** When the geometry type is changed manually by the user, clear
         * the selected geometry columns. Otherwise, keep them.
         */
        private selectGeoType(clearSelectedColumns: boolean = false) {
            if (clearSelectedColumns) this.geometryColumns = {};
            this.geometryType = GEOMETRY_TYPES[this.geometryTypeId];
            this.featureType.style.drawingMode = this.geometryType.drawingMode;
            this.updateMarker();
        }

        private selectRowIndex(ind: number) {
            this.updateMarkerDebounced();
            this.$messageBus.publish('table2map', 'update-rightpanel', this.feature);
        }

        private swapRows(rowIndex) {
            let keys = Object.keys(this.geometryColumns);
            let hObjToSwap = JSON.parse(JSON.stringify(this.geometryColumns[keys[rowIndex]]));
            this.geometryColumns[keys[rowIndex]] = this.geometryColumns[keys[rowIndex + 1]];
            this.geometryColumns[keys[rowIndex + 1]] = hObjToSwap;
            console.log(`Swapped row ${keys[rowIndex]} with row ${keys[rowIndex + 1]}`);
        }

        private getColumnTitle(col: string): string {
            let hObj = _.findWhere(this.headerCollection, {
                code: col
            });
            if (hObj) {
                return hObj.title;
            } else {
                return col;
            }
        }

        public updatePropertyPreview = _.debounce(this.updatePropertyPreviewDebounced, 1000);

        private updatePropertyPreviewDebounced() {
            this.$messageBus.publish('table2map', 'update-rightpanel', this.feature);
        }

        private addSection(newSection: string) {
            this.$timeout(() => {
                if (_.pluck(this.sections, 'name').indexOf(newSection) < 0) {
                    this.sections.push({
                        name: newSection,
                        val: newSection
                    });
                }
            }, 0);
            this.updatePropertyPreview();
        }

        private checkSections(newSection ? : string) {
            let section = newSection || this.pType.section;
            if (!section) return;
            if (_.pluck(this.sections, 'val').indexOf(section) >= 0) {
                this.updatePropertyPreview();
            } else {
                this.pType.section = section;
                this.addSection(section);
            }
        }

        private updateLayerListPreview = _.debounce(this.updateLayerListPreviewDebounced, 1000);

        private updateLayerListPreviewDebounced() {
            this.$messageBus.publish('table2map', 'update-layerlist', this.project);
        }

        private selectGroup() {
            _.each(this.project.groups, (group) => {
                group.layers = group.layers.filter((layer) => {
                    return layer.id;
                });
            });
            this.selectedGroup.layers.push(this.layer);
            this.updateLayerListPreview();
        }

        private addGroup(newGroup: string) {
            let cleanId = this.cleanRegExp(newGroup).toLowerCase();
            let g: ProjectGroup = < ProjectGroup > {
                id: cleanId,
                title: newGroup,
                layers: []
            };
            if (!this.project.groups) this.project.groups = [];
            this.project.groups.push(g);
            this.$timeout(() => {
                this.selectedGroup = g;
                this.selectGroup();
            }, 0);
        }

        private checkGroups(newTitle ? : string) {
            if (!this.project) return;
            let title = newTitle || this.selectedGroup.title;
            if (!title) return;
            let cleanId = this.cleanRegExp(title).toLowerCase(); //The id will be the title cleaned from non-word characters
            let existingGroup = _.find(this.project.groups, (g) => {
                return g.id === cleanId;
            });
            if (existingGroup) {
                return;
            } else {
                this.addGroup(title);
            }
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
            this.sections = [{
                name: 'Default',
                val: null
            }];
        }

        public updateMarker = _.throttle(this.updateMarkerDebounced, 500, {
            leading: false,
            trailing: true
        });

        private updateMarkerDebounced() {
            if (!this.feature || !this.feature.geometry || !this.featureType || !this.featureType.style || !this.featureType.style.drawingMode) return;
            let drawingMode = this.featureType.style.drawingMode;
            if (this.marker) this.previewMap.removeLayer(this.marker);
            this.feature.geometry.type = drawingMode;
            this.feature.properties = this.rowCollection[this.selectedRowIndex || 0] || {};
            this.feature['fType'] = this.featureType;
            if (!this.feature._gui) this.feature._gui = < csComp.Services.IGuiObject > {};
            this.layerService.calculateFeatureStyle(this.feature);
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
            this.marker.on({
                mouseover: (a) => this.showFeatureTooltip(a, < IFeature > this.feature),
                mouseout: (s) => this.hideFeatureTooltip(s),
                mousemove: (d) => this.updateFeatureTooltip(d),
                click: (e) => {
                    this.$timeout(() => {
                        this.selectFeature( < IFeature > this.feature);
                    }, 0);
                }
            });
            this.marker.addTo(this.previewMap);
        }

        private selectFeature(f: IFeature) {
            f.isSelected = !f.isSelected;
            if (!f._gui) f._gui = < csComp.Services.IGuiObject > {};
            f._gui['title'] = Helpers.getFeatureTitle(f);
            this.layerService.calculateFeatureStyle(f);
            if (f.geometry.type === 'Point') {
                ( < L.Marker > this.marker).setIcon(this.getPointIcon(f));
            } else {
                ( < L.GeoJSON > this.marker).setStyle(this.getLeafletStyle(f.effectiveStyle));
            }
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
                var iconHtml = Helpers.createIconHtml(feature);
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

        private generateTooltipContent(e: L.LeafletMouseEvent, feature: IFeature) {
            // add title
            var title = Helpers.getFeatureTooltipTitle(feature);
            var rowLength = (title) ? title.length : 1;
            var content = '<td colspan=\'3\'>' + title + '</td></tr>';
            // add values for properties with a "visibleInTooltip = true" propertyType, only in case they haven't been added already as filter or style
            let fType = this.featureType;
            if (fType) {
                let pTypes = fType._propertyTypeData.forEach((mi: IPropertyType) => {
                    if (mi.visibleInTooltip) {
                        if (feature.properties.hasOwnProperty(mi.label)) {
                            let entry = this.addEntryToTooltip(content, feature, mi.label, null, mi.title, 'fa-info');
                            content = entry.content;
                            var tl = mi.title ? mi.title.length : 10;
                            rowLength = Math.max(rowLength, entry.length + tl);
                        }
                    }
                });
            }
            var widthInPixels = Math.max(Math.min(rowLength * 7 + 15, 250), 130);
            return {
                content: '<table style=\'width:' + widthInPixels + 'px;\'>' + content + '</table>',
                widthInPixels: widthInPixels
            };
        }

        private addEntryToTooltip(content: string, feature: IFeature, property: string, meta: IPropertyType, title: string, faLabel: string = 'fa-paint-brush') {
            if (!title || title.length === 0) return {
                length: 0,
                content: content
            };
            var value = feature.properties[property];
            if (typeof value === 'undefined' || value === null) return {
                length: 0,
                content: content
            };
            var valueLength = value.toString().length;
            if (meta) {
                value = Helpers.convertPropertyInfo(meta, value);
                if (meta.type !== 'bbcode') valueLength = value.toString().length;
            } else {
                let pt = this.layerService.getPropertyType(feature, property);
                if (pt) {
                    meta = pt;
                    value = Helpers.convertPropertyInfo(pt, value);
                }
            }
            return {
                length: valueLength + title.length,
                content: content + `<tr><td><div class="fa ${faLabel}"></td><td>${title}</td><td>${value}</td></tr>`
            };
        }

        /**
         * Show tooltip with name, styles & filters.
         */
        private showFeatureTooltip(e: L.LeafletMouseEvent, feature: IFeature) {
            var tooltip = this.generateTooltipContent(e, feature);

            this.popup = L.popup({
                offset: new L.Point(-tooltip.widthInPixels / 2 - 40, -5),
                closeOnClick: true,
                autoPan: false,
                className: 'featureTooltip'
            }).setLatLng(e.latlng).setContent(tooltip.content).openOn(this.previewMap);
        }

        hideFeatureTooltip(e: L.LeafletMouseEvent) {
            if (this.popup && this.previewMap) {
                ( < any > this.previewMap).closePopup(this.popup);
                this.popup = null;
            }
        }

        private updateFeatureTooltip(e: L.LeafletMouseEvent) {
            if (this.popup != null && e.latlng != null) this.popup.setLatLng(e.latlng);
        }
    }


    /**
     * Register service
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

    myModule.service('tableToMapSvc', Table2Map.Table2MapSvc);

    myModule.directive('selectGroupOnBlur', () => {
        return {
            require: 'uiSelect',
            link: ($scope, $element, attrs, $select) => {
                var searchInput = $element.querySelectorAll('input.ui-select-search');
                if (searchInput.length !== 1) throw Error('Multiple input detected');
                searchInput.on('blur', () => {
                    $scope.$apply(() => {
                        if ($select.items.length > $select.activeIndex) {
                            // var item = $select.items[$select.activeIndex];
                            // $select.select(item);
                            // $scope.$parent.vm.t2mSvc.checkGroups(item.title);
                        } else {
                            $scope.$parent.vm.t2mSvc.checkGroups(searchInput.val());
                        }
                    });
                });
            }
        };
    });

    myModule.directive('selectSectionOnBlur', () => {
        return {
            require: 'uiSelect',
            link: ($scope, $element, attrs, $select) => {
                var searchInput = $element.querySelectorAll('input.ui-select-search');
                if (searchInput.length !== 1) throw Error('Multiple input detected');
                searchInput.on('blur', () => {
                    $scope.$apply(() => {
                        if ($select.items.length <= $select.activeIndex) {
                            $scope.$parent.vm.t2mSvc.checkSections(searchInput.val());
                        }
                    });
                });
            }
        };
    });

    /** Converts opacity percentage [0, 100] to transparency percentage [100, 0]*/
    myModule.directive('transparencyToOpacity', () => {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: (scope, element, attrs, ngModel) => {
                if (ngModel) {
                    ngModel.$parsers.push((value) => {
                        return (100 - value);
                    });
                    ngModel.$formatters.push((value) => {
                        return (100 - value);
                    });
                }
            }
        };
    });
}