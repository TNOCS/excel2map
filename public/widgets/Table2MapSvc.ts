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

    /** Track which properties have changed (e.g. resourceType, or project-title)  */
    export enum ChangedFiles {
        ResourceType = 1,
            LayerDefinition = 2,
            GroupDefinition = 4,
            ProjectDefinition = 8,
            LayerData = 16
    }

    export enum ConversionStep {
        ProjectSettings = 1,
            LayerSettings = 2,
            UploadData = 3,
            StyleSettings = 4,
            FeatureProps = 5
    }

    export interface INotificationMsg {
        title: string;
        description: string;
        isOk: boolean;
    }

    export var DEFAULT_SECTION = 'Gegevens';
    export var CONVERSION_STEPS = ['Project titel en logo invoeren', 'Kaartlaag groep, titel en beschrijving invoeren', 'Data uploaden', 'Stijlinstellingen aanpassen', 'Data weergave'];

    /** Assumption of the number of columns before table is parsed. */
    export var MAX_NR_COLUMNS = 128;
    /** Number of columns to show in the widget. */
    export var SHOW_NR_COLUMNS = 20;
    export var NUMBER_OF_STEPS = Object.keys(ConversionStep).length / 2;
    export var MAX_ICON_SIZE = 20 * 1024; // 20kB
    export var DEFAULT_MARKER_ICON = Table2Map.getDefaultIconUri();
    export var NAME_LABELS = ['naam', 'name'];
    export var POSTCODE_LABELS = ['postcode', 'postal', 'zip'];
    export var H_NR_LABELS = ['huisnummer', 'huisnr', 'nr'];
    export var H_LTR_LABELS = ['huisletter', 'huisltr', 'letter'];
    export var H_TOEV_LABELS = ['huisnummertoevoeging', 'huisnrtoev', 'toevoeging'];
    export var LAT_LABELS = ['latitude', 'lat'];
    export var LNG_LABELS = ['longitude', 'long', 'lng'];
    export var RDX_LABELS = ['rdx', 'rd-x', 'x'];
    export var RDY_LABELS = ['rdy', 'rd-y', 'y'];
    export var BUURT_LABELS = ['bu', 'bucode', 'buurtcode'];
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
        private changedFiles: ChangedFiles = 255; //Set everything to changed
        public restApi: Table2MapApiManager;
        private dataProperties: {
            [key: string]: any
        };
        private msgBusHandle: csComp.Services.MessageBusHandle;
        private isSecurityTokenSet: boolean;
        private securityTokenSubscription: Function;
        private textContent: string;
        private parsedContent: any;
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
        private geometryInfoComplete: boolean = false;
        private additionalInfo: string;
        public geometryColumns: Dictionary < IHeaderObject > = {};
        public project: Project = < Project > {};
        private clusterOptions: ITable2MapClusterOptions = {
            clustering: true,
            clusterLevel: 14
        };
        public layer: ProjectLayer = < ProjectLayer > {};
        public defaultLegendProperty: string;
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
        public notFoundLocations: Record < string, any > ;
        private uploadNotificationMessage: INotificationMsg;

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
            this.restApi = new Table2MapApiManager($http, $messageBus, this);

            this.$dashboardService.widgetTypes['tableToMap'] = < csComp.Services.IWidget > {
                id: 'tableToMap',
                icon: 'bower_components/csweb/dist-bower/images/widgets/table.png',
                description: 'Show Table2Map widget'
            };

            this.currentStep = ConversionStep.ProjectSettings;
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
                    case 'createproject':
                        this.createProject(data, (project) => {
                            this.project = project;
                            this.startWizard();
                        });
                        break;
                };
            });

            this.$messageBus.subscribe('profileservice', (title, data) => {
                switch (title) {
                    case 'setToken':
                        this.isSecurityTokenSet = true;
                        if (_.isFunction(this.securityTokenSubscription)) {
                            this.securityTokenSubscription();
                            this.securityTokenSubscription = null;
                        }
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
            } else {
                this.resetVariables();
            }
        }

        private loadLogo(imgUrl: string) {
            this.restApi.loadLogo(imgUrl, (file) => {
                if (!file) {
                    return console.warn('Could not get img ' + imgUrl);
                }
                this.readFile(file, 'logo');
            });
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
            if (!this.isSecurityTokenSet) {
                console.log('Security token not set yet');
                this.securityTokenSubscription = () => {
                    this.editProjectWithToken(projectId);
                };
                return;
            }
            this.editProjectWithToken(projectId);
        }

        private editProjectWithToken(projectId: string) {
            this.getProject(projectId, (project) => {
                if (project && !project.featurePropsDirective) {
                    project.featurePropsDirective = 'zodkrightpanel';
                }
                if (project && !project.widgets) {
                    project.widgets = [];
                }
                if (project && !project.widgets.some((w) => {
                    return w.id === "zodklayer";
                })) {
                    project.widgets.push({
                        "id": "zodklayer",
                        "directive": "zodklayer",
                        "elementId": "widget-zodklayer",
                        "enabled": true,
                        "style": "vws2",
                        "width": "300px",
                        "bottom": "50px",
                        "left": "500px",
                        "position": "custom",
                        "data": {}
                    });
                }
                this.selectLayerForEditing(project);
            });
        }

        private startWizard(): boolean {
            let dash = this.layerService.findDashboardById('table2map');
            if (!dash) return false;
            this.$messageBus.publish('zodk', 'open-wizard');
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

            modalInstance.result.then((result: {
                groupId: string,
                layerId: string,
                clone: boolean
            }) => {
                if (this.layerService.project.activeDashboard.id !== 'table2map') {
                    let success = this.startWizard();
                    if (!success) location.href = `/?dashboard=table2map&editproject=${this.layerService.project.id}`;
                }
                if (!result.layerId) {
                    this.resetVariables();
                    this.project = project;
                    this.selectedGroup = _.find(this.project.groups, (group) => {
                        return group.id === result.groupId;
                    });
                } else {
                    this.loadLayerForWizard(project, result.layerId, result.clone);
                }
            }, () => {
                console.log('Modal dismissed at: ' + new Date());
            });
        }

        private loadLayerForWizard(project: Project, layerId: string, clone: boolean) {
            this.project = project;
            this.selectedGroup = this.findGroupForLayer(layerId);
            this.clusterOptions.clustering = this.selectedGroup.clustering;
            this.clusterOptions.clusterLevel = this.selectedGroup.clusterLevel;
            this.restApi.getLayer(project.id, layerId, (layer) => {
                if (!layer) {
                    this.$messageBus.notify('ERROR_GETTING_LAYER', 'ERROR_GETTING_LAYER');
                    return;
                }
                this.layer = layer;
                this.defaultLegendProperty = this.getDefaultLegendProperty(layer);
                this.changedFiles = (this.changedFiles & ~ChangedFiles.LayerData); // Layer data does not need to be updated
                this.restApi.getResourceType(this.layer, (typeResource: csComp.Services.ITypesResource) => {
                    if (!typeResource) {
                        this.$messageBus.notify('ERROR_GETTING_LAYER', 'ERROR_GETTING_FEATURE_TYPE');
                        return;
                    }
                    this.featureType = this.getFeatureTypeFromResourceType(typeResource, layer.typeUrl);
                    this.textContent = this.convertFeatureTypeToCsv(this.featureType);
                    this.textContent = this.textContent.concat('\n', this.convertLayerToCsv(this.layer));
                    this.feature = this.layer.data.features[0] || Table2Map.getDefaultFeature();
                    this.getIconData(this.featureType.style.iconUri);
                    this.updatedContent(false);
                    this.parseLayerDefinition(this.layer.data);
                    if (clone) {
                        let newLayerGuid = csComp.Helpers.getGuid();
                        this.replacePropertyContent(this.layer, 'url', this.layer.id, newLayerGuid);
                        this.layer.id = newLayerGuid;
                        this.layer.title += ' (kopie)';
                        let newTypeGuid = csComp.Helpers.getGuid();
                        this.replacePropertyContent(this.layer, 'defaultLegendProperty', this.featureType.id, newTypeGuid);
                        this.replacePropertyContent(this.layer, 'defaultFeatureType', this.featureType.id, newTypeGuid);
                        this.replacePropertyContent(this.layer, 'typeUrl', this.featureType.id, newTypeGuid);
                        this.featureType.id = newTypeGuid;
                    }
                    this.startWizard();
                });
            });
        }

        private replacePropertyContent(obj: Object, prop: string, oldVal: string, newVal: string) {
            if (!obj || !_.isObject(obj) || !obj.hasOwnProperty(prop) || typeof obj[prop] !== 'string') return;
            obj[prop] = obj[prop].replace(oldVal, newVal);
        }

        private getDefaultLegendProperty(layer: ProjectLayer): string {
            if (!layer || !layer.defaultLegendProperty) return null;
            if (layer.defaultLegendProperty.indexOf('#') >= 0) {
                return layer.defaultLegendProperty.split('#').pop();
            }
        }

        private getFeatureTypeFromResourceType(typeResource: csComp.Services.ITypesResource, typeUrl: string): csComp.Services.IFeatureType {
            var id = typeUrl.split('/').pop();
            var fType = typeResource.featureTypes[id];
            fType.id = id;
            fType._propertyTypeData = _.values(typeResource.propertyTypeData);
            fType.style = fType.style || {};
            if (fType.style.opacity > 1) fType.style.opacity /= 100;
            if (fType.style.fillOpacity > 1) fType.style.fillOpacity /= 100;
            return fType;
        }

        private convertFeatureTypeToCsv(fType: IFeatureType) {
            if (!fType || !fType.hasOwnProperty('_propertyTypeData')) return;
            let result: string[] = [];
            _.each(fType['_propertyTypeData'], (prop: IPropertyType) => {
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
            this.restApi.loadLogo(url, (file) => {
                if (!file) {
                    return console.warn('Could not get img icon ' + url);
                }
                this.readFile(file, 'icon');
            });
        }

        private parseLayerDefinition(layerData: any) {
            if (layerData && layerData.hasOwnProperty('layerDefinition')) {
                if (layerData.layerDefinition.geometryType) {
                    this.geometryTypeId = Table2Map.getBrowserGeometryType(layerData.layerDefinition.geometryType);
                    this.selectGeoType();
                }
                if (layerData.layerDefinition.parameter1) {
                    this.geometryColumns[layerData.layerDefinition.parameter1] = {
                        title: this.getColumnTitle(layerData.layerDefinition.parameter1),
                        code: layerData.layerDefinition.parameter1,
                        index: this.getColumnIndex(layerData.layerDefinition.parameter1)
                    };
                }
                if (layerData.layerDefinition.parameter2) {
                    this.geometryColumns[layerData.layerDefinition.parameter2] = {
                        title: this.getColumnTitle(layerData.layerDefinition.parameter2),
                        code: layerData.layerDefinition.parameter2,
                        index: this.getColumnIndex(layerData.layerDefinition.parameter2)
                    };
                }
                if (layerData.layerDefinition.parameter3) {
                    this.geometryColumns[layerData.layerDefinition.parameter3] = {
                        title: this.getColumnTitle(layerData.layerDefinition.parameter3),
                        code: layerData.layerDefinition.parameter3,
                        index: this.getColumnIndex(layerData.layerDefinition.parameter3)
                    };
                }
                if (layerData.layerDefinition.parameter4) {
                    this.geometryColumns[layerData.layerDefinition.parameter4] = {
                        title: this.getColumnTitle(layerData.layerDefinition.parameter4),
                        code: layerData.layerDefinition.parameter4,
                        index: this.getColumnIndex(layerData.layerDefinition.parameter4)
                    };
                }
                if (this.geometryType && this.geometryType.cols.length === Object.keys(this.geometryColumns).length) {
                    this.geometryInfoComplete = true;
                } else {
                    this.geometryInfoComplete = false;
                }
            }
        }

        /**
         * Creates the project.
         */
        public createProject(projectTitle ? : string, cb ? : Function) {
            let projectRequest = < Project > {};
            if (projectTitle) {
                projectRequest.title = projectTitle;
            }
            this.restApi.createProject(projectRequest, (project) => {
                if (!project) {
                    cb(null);
                    return console.warn('Could not create project');
                }
                if (project.logo) {
                    this.loadLogo(project.logo);
                }
                cb(project);
            });
        }

        /**
         * Creates the project.
         */
        public getProject(projectId: string, cb: Function) {
            this.restApi.getProject(projectId, (project) => {
                if (!project) {
                    cb(null);
                    return console.warn('Could not get project');
                }
                if (project.logo) {
                    this.loadLogo(project.logo);
                }
                cb(project);
            });
        }

        private parseXlsx(data: any) {
            if (!( < any > window).XLSX) return;
            var XLSX = ( < any > window).XLSX;
            let workbook: any;
            try {
                workbook = XLSX.read(data, {
                    type: 'binary'
                });
            } catch (error) {
                return;
            }
            if (!workbook) return;
            let sheetNames = workbook.SheetNames;
            console.log(`Found ${sheetNames.length} sheets`);
            if (sheetNames.length <= 0) return;
            console.log(`Processing sheet ${sheetNames[0]}...`);
            let sheet: any = workbook.Sheets[sheetNames[0]];
            let csvContent = XLSX.utils.sheet_to_csv(sheet, {
                FS: ';',
                RS: '\n'
            });
            return csvContent;
        }

        /** Reads a file */
        public readFile(file: any, fileType: 'data' | 'icon' | 'logo') {
            if (!this.uploadAvailable) {
                this.$messageBus.notifyError('Cannot upload files', 'Try using a modern browser (Chrome, FireFox, Edge) to be able to upload files, or use the copy/paste option.');
                return;
            }
            var parseXlsx = false;
            if (!file || !file.name || file.name.indexOf('.') < 0) {
                this.$messageBus.notifyError('Cannot upload this file', 'The file should have one of these extensions: ' + this.printExtensions(this.fileExtensions[fileType]));
                return;
            } else {
                var ext = file.name.split('.').pop();
                if (ext === 'xls' || ext === 'xlsx') {
                    parseXlsx = true;
                }
                if (!_.contains(this.fileExtensions[fileType], ext.toLowerCase())) {
                    this.$messageBus.notifyError('Cannot upload this file', 'The file should have one of these extensions: ' + this.printExtensions(this.fileExtensions[fileType]));
                    return;
                }
            }
            var reader = new FileReader();

            reader.onload = (e) => {
                if (fileType === 'data') {
                    this.layerDataChanged(); // Layer data needs to be updated
                    if (parseXlsx) {
                        let csvContent = this.parseXlsx(reader.result);
                        if (!csvContent) {
                            this.$messageBus.notifyError('Error parsing xlsx', '');
                            return;
                        } else {
                            this.textContent = csvContent;
                            console.log('Correctly parsed xlsx to csv');
                        }
                    } else {
                        this.textContent = reader.result;
                    }
                    this.updatedContent();
                } else if (fileType === 'icon') {
                    this.$timeout(() => {
                        if (file.name && file.name.indexOf(this.layer.id) !== 0) {
                            this.featureType.style.iconUri = ['', 'zelfkaartenmaken', 'private', 'data', 'images', `${this.layer.id}__${file.name}`].join('/');
                        }
                        this.iconData = reader.result;
                        this.updateMarker();
                    }, 0);
                } else {
                    this.$timeout(() => {
                        if (this.project) {
                            this.project.logo = ['', 'zelfkaartenmaken', 'private', 'data', 'images', `${this.project.id}__${file.name}`].join('/');
                            this.logoData = reader.result;
                        }
                    }, 0);
                }
            };

            if (fileType === 'data') {
                if (parseXlsx) {
                    reader.readAsBinaryString(file);
                } else {
                    reader.readAsText(file);
                }
            } else {
                reader.readAsDataURL(file);
            }
        }

        private resetVariables() {
            this.iconData = Table2Map.getDefaultIconData();
            this.featureType = {};
            this.featureType.id = csComp.Helpers.getGuid();
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
                fillColor: '#3f3',
                opacity: 1,
                fillOpacity: 1,
                nameLabel: ''
            };
            this.feature = Table2Map.getDefaultFeature();
            if (!this.layer || _.isEmpty(this.layer)) {
                this.layer = < ProjectLayer > {};
                this.layer.enabled = true;
                this.layer.fitToMap = true;
                this.layer.opacity = 95;
            }
            if (!this.layer.id) this.layer.id = csComp.Helpers.getGuid();
            $('#iconImage').attr('src', DEFAULT_MARKER_ICON);
        }

        /** Parse the uploaded csv data to JSON format, for displaying it in a html table. */
        public updatedContent(resetVariables: boolean = true) {
            if (resetVariables) this.resetVariables();
            this.headerCollection.length = 0;
            this.headerCollection = _.map(Table2Map.defaultHeaders(MAX_NR_COLUMNS, this.layer.id), (code: string, index: number) => {
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
                        this.layerDataChanged();
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
                            // automatically go to step 2
                            // if (this.project && this.project.title && this.selectedGroup && this.selectedGroup.id) {
                            //     this.currentStep = ConversionStep.StyleSettings;
                            // }
                            let msg = `Scheidingsteken: ${this.csvParseSettings.delimiter}, Headers: ${(this.csvParseSettings.hasHeader ? 'ja' : 'nee')}\nResultaat: ${_.size(this.headerCollection)} kolommen & ${this.rowCollection.length} rijen.`;
                            //this.$messageBus.notifyWithTranslation('DATA_PARSED_CORRECTLY', msg);
                            this.uploadNotificationMessage = {
                                title: 'DATA_PARSED_CORRECTLY', 
                                description: msg,
                                isOk: true
                            };
                        }, 0);
                    })
                    .on('error', (err) => {
                        console.warn(`Error parsing csv: ${err}`);
                        this.uploadNotificationMessage = {
                            title: 'DATA_NOT_CONVERTED_CORRECTLY', 
                            description: err,
                            isOk: false
                        };
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
            var featuresUpdated: boolean = true; // TODO: check whether feature geometries have changed
            this.convert(featuresUpdated, () => {
                this.openProject();
            });
        }

        private openProject() {
            // window.location.href = `/?project=${this.project.id}`; // open in same tab/window
            window.open(`${Table2Map.DEPLOY_URL}?project=${this.project.id}`, '_blank'); // open in new tab/window
        }

        private sendIcon(base64Data: string, fileName: string) {
            let b64 = (base64Data ? base64Data.replace(/^data:image\/\w+;base64,/, '') : base64Data);
            let baseName = fileName.split('/').pop();
            let folderName = 'images';
            this.restApi.sendIcon(b64, folderName, baseName, (err) => {
                if (err) console.warn(err);
            });
        }

        private sendResourceType(fType: IFeatureType) {
            let resourceType = {
                id: fType.id,
                url: `${Table2Map.DEPLOY_PATH}/api/resources/${fType.id}`,
                featureTypes: {},
                propertyTypeData: _.object(_.pluck(fType._propertyTypeData, 'label'), fType._propertyTypeData)
            };
            resourceType.featureTypes[fType.id] = fType;
            this.restApi.sendResourceType( < any > resourceType, (err) => {
                if (err) console.warn(err);
            });
        }

        private sendGroup(group: csComp.Services.ProjectGroup, projectId: string, cb: Function) {
            let groupDef = {
                id: group.id,
                title: group.title,
                clusterLevel: this.clusterOptions.clusterLevel,
                clustering: this.clusterOptions.clustering
            };
            this.restApi.sendGroup(projectId, < csComp.Services.ProjectGroup > groupDef, (err) => {
                cb(err);
            });
        }

        private sendLayer(layer: csComp.Services.ProjectLayer, projectId: string, groupId: string, featuresUpdated: boolean, cb: Function) {
            let layerDef = {
                id: layer.id,
                title: layer.title,
                description: layer.description,
                enabled: layer.enabled,
                fitToMap: layer.fitToMap,
                typeUrl: `${Table2Map.DEPLOY_PATH}/api/resources/${this.featureType.id}`,
                defaultFeatureType: `${this.featureType.id}`,
                defaultLegendProperty: `${Table2Map.DEPLOY_PATH}/api/resources/${this.featureType.id}#${this.defaultLegendProperty}`,
                opacity: layer.opacity || 95,
                url: `${Table2Map.DEPLOY_PATH}/api/layers/${layer.id}`,
                data: layer.data || {}
            };
            var geometryParams = _.values(this.geometryColumns);
            layerDef.data['layerDefinition'] = {};
            layerDef.data['layerDefinition']['parameter1'] = geometryParams.getKeyAt(0, 'code');
            layerDef.data['layerDefinition']['parameter2'] = geometryParams.getKeyAt(1, 'code');
            layerDef.data['layerDefinition']['parameter3'] = geometryParams.getKeyAt(2, 'code');
            layerDef.data['layerDefinition']['parameter4'] = geometryParams.getKeyAt(3, 'code');
            layerDef.data['layerDefinition']['geometryType'] = Table2Map.getServerGeometryType(this.geometryTypeId, this.additionalInfo);
            layerDef.data['layerDefinition']['geometryKey'] = null; //Will be determined from data in MapLayerFactory
            layerDef.data['layerDefinition']['featureTypeId'] = this.featureType.id;
            layerDef.data['layerDefinition']['nameLabel'] = this.featureType.style.nameLabel;
            layerDef.data['layerDefinition']['includeOriginalProperties'] = (this.additionalInfo && this.additionalInfo.length > 0);
            layerDef.data['properties'] = this.rowCollection;
            layerDef.data['propertyTypes'] = this.featureType.properties;
            var featuresAreUpdated = ((this.changedFiles & ChangedFiles.LayerData) > 0);
            layerDef['features'] = (featuresAreUpdated ? [] : layer.data.features);
            this.restApi.sendLayer(projectId, groupId, < any > layerDef, featuresAreUpdated, (err) => {
                cb(err);
            });
        }

        /** Send the data and configuration to the server for conversion */
        private convert(featuresUpdated: boolean, cb: Function) {
            this.sendIcon(this.iconData, this.featureType.style.iconUri);
            this.sendIcon(this.logoData, this.project.logo);
            this.sendResourceType(this.featureType);
            this.restApi.sendProject(this.project, (err) => {
                if (err) console.warn(err);
                this.sendGroup(this.selectedGroup, this.project.id, (err) => {
                    if (err) console.warn(err);
                    this.sendLayer(this.layer, this.project.id, this.selectedGroup.id, featuresUpdated, (err) => {
                        if (err) console.warn(err);
                    });
                });
            });
            cb();
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
        private hasNameLabel(): boolean {
            if (this.layer.data && this.layer.data.layerDefinition && this.layer.data.layerDefinition.nameLabel) {
                let title = this.layer.data.layerDefinition.nameLabel;
                return _.some(this.headerCollection, (val: IHeaderObject) => {
                    return val.title === title;
                });
            } else {
                return false;
            }
        }

        /** Try to interpret the data, in order to select the geometry type and name label */
        private interpretDataColumns() {
            let titles = _.pluck(this.headerCollection, 'title');
            let rows = this.rowCollection;
            let hObj;
            // Find namelabel
            if (!this.featureType.style.nameLabel) {
                if (!this.hasNameLabel()) {
                    hObj = this.findHeader(NAME_LABELS);
                    if (hObj) {
                        this.featureType.style.nameLabel = hObj.code;
                    } else {
                        this.featureType.style.nameLabel = this.headerCollection[0].code;
                    }
                }
            }
            if (this.layer.data && this.layer.data.layerDefinition && this.layer.data.layerDefinition.geometryType) { //Already selected 
                this.selectGeoType();
                return;
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
            hObj = this.findHeader(BUURT_LABELS, false);
            if (hObj) {
                this.geometryTypeId = 'Buurt(2016)';
                this.selectGeoType();
                this.geometryColumns = < Dictionary < IHeaderObject >> _.object(this.geometryType.cols, [hObj]);
                return;
            }
            // Find geometry type
            hObj = this.findHeader(LAT_LABELS);
            if (hObj) {
                let hObj2 = this.findHeader(LNG_LABELS);
                if (hObj2) {
                    this.geometryTypeId = 'Latitude_and_longitude';
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
                    this.geometryTypeId = 'RD_X_en_Y';
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
                        this.selectGeoType();
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
                itemsToSelect = [this.$translate.instant('SELECT_NAMELABEL_COLUMN')];
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
                        if (this.geometryType && this.geometryType.cols.length === Object.keys(this.geometryColumns).length) {
                            this.geometryInfoComplete = true;
                        } else {
                            this.geometryInfoComplete = false;
                        }
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

        private layerDataChanged() {
            this.changedFiles = (this.changedFiles | ChangedFiles.LayerData);
        }

        /** When the geometry type is changed manually by the user, clear
         * the selected geometry columns. Otherwise, keep them.
         */
        private selectGeoType(clearSelectedColumns: boolean = false) {
            if (clearSelectedColumns) {
                this.geometryColumns = {};
                this.geometryInfoComplete = false;
                this.layerDataChanged(); // Layer data needs to be updated
            }
            this.geometryType = GEOMETRY_TYPES[this.geometryTypeId];
            this.featureType.style.drawingMode = this.geometryType.drawingMode;
            if (this.geometryType && this.geometryType.cols.length === Object.keys(this.geometryColumns).length) {
                this.geometryInfoComplete = true;
            } else {
                this.geometryInfoComplete = false;
            }
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

        private getColumnHeader(col: string): string {
            if (!this.layer) return;
            let hash = this.layer.id.hashCode();
            return col.replace(hash, '');
        }

        private getColumnIndex(col: string): number {
            let hObj = _.findWhere(this.headerCollection, {
                code: col
            });
            if (hObj) {
                return hObj.index;
            } else {
                return 0;
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
            this.assertDefaultSection();
            if (_.pluck(this.sections, 'val').indexOf(section) >= 0) {
                this.updatePropertyPreview();
            } else {
                this.pType.section = section;
                this.addSection(section);
            }
        }

        private assertDefaultSection() {
            if (!this.sections || _.isEmpty(this.sections)) {
                this.sections = [{
                    name: DEFAULT_SECTION,
                    val: null
                }];
            } else if (!(_.pluck(this.sections, 'val').some((val) => { return val == null; }))) {
                this.sections.push({
                    name: DEFAULT_SECTION,
                    val: null
                });
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

        private generateFeatureType(force: boolean = false) {
            if (this.featureType.hasOwnProperty('_propertyTypeData') && !force) return; // Skip when fType already filled
            this.featureType._propertyTypeData = [];
            let properties = _.pluck(this.headerCollection, 'code');
            this.featureType.propertyTypeKeys = properties.join(';');
            this.headerCollection.forEach((hObj: IHeaderObject) => {
                let pType = < IPropertyType > {
                    label: hObj.code,
                    title: hObj.title,
                    type: 'text',
                    description: '',
                    visibleInCallOut: true
                };
                pType = this.determineDataType(pType);
                this.featureType._propertyTypeData.push(pType);
            });
            // Set default style
            let firstNumberType = _.findWhere(this.featureType._propertyTypeData, {
                type: 'number'
            });
            if (firstNumberType) this.defaultLegendProperty = firstNumberType.label;
            this.assertDefaultSection();
        }

        private determineDataType(pt: IPropertyType) {
            let key = pt.label;
            let values = [];
            for (let i = 0; i < 20; i++) {
                if (this.rowCollection.length > i) {
                    let row = this.rowCollection[i];
                    if (row.hasOwnProperty(key)) {
                        values.push(row[key]);
                    }
                }
            }
            let types: _.Dictionary < number > = {
                currency: 0,
                url: 0,
                number: 0,
                date: 0,
                longtext: 0,
                text: 0
            };
            values.forEach((val) => {
                if (val.toString().match(/^€\d*(.|,)\d*$/g)) {
                    types.currency += 1;
                } else if (moment(val.toString(), 'DD-MM-YYYY', true).isValid()) {
                    types.date += 1;
                } else if (val.toString().match(/^\d*(.|,)\d*$/g)) {
                    types.number += 1;
                } else if (val.toString().match(/(\b((https?|ftp|file)+:\/\/){1}|www)[-A-Za-z0-9+&@#\/%?=~_|!:,.;]+[-A-Za-z0-9+&@#\/%=~_|]/g)) {
                    types.url += 1;
                } else if (val.toString().length > 30) {
                    types.longText += 1;
                } else {
                    types.text += 1;
                }
            });
            let max = 0;
            let maxKey = 'text';
            Object.keys(types).forEach((k) => {
                if (types[k] > max) {
                    max = types[k];
                    maxKey = k;
                }
            });
            switch (maxKey) {
                case 'text':
                    return pt;
                case 'longtext':
                    pt.type = 'textarea';
                    return pt;
                case 'number':
                    pt.type = 'number';
                    return pt;
                case 'currency':
                    this.convertCurrencyToNumbers(key);
                    pt.type = 'number';
                    pt.stringFormat = _.findWhere(Table2Map.STRING_FORMATS, {
                        name: 'Euro_two_decimals'
                    }).val;
                    return pt;
                case 'date':
                    this.convertDatesToJS(key);
                    pt.type = 'date';
                    return pt;
                case 'url':
                    pt.type = 'bbcode';
                    return pt;
                default:
                    return pt;
            }
        }

        private convertCurrencyToNumbers(key: string) {
            this.rowCollection.forEach((row) => {
                if (row.hasOwnProperty(key)) {
                    row[key] = +(row[key].toString().replace('€', ''));
                }
            });
        }

        private convertDatesToJS(key: string) {
            this.rowCollection.forEach((row) => {
                if (row.hasOwnProperty(key)) {
                    let m = moment(row[key], 'DD-MM-YYYY');
                    if (m.isValid()) {
                        row[key] = m.toDate().getTime();
                    }
                }
            });
        }

        public updateMarker = _.throttle(this.updateMarkerDebounced, 500, {
            leading: false,
            trailing: true
        });

        private updateMarkerDebounced() {
            if (!this.feature.geometry) this.feature.geometry = < csComp.Services.IGeoJsonGeometry > {};
            if (!this.feature || !this.featureType || !this.featureType.style || !this.featureType.style.drawingMode) return;
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
                if (this.iconData) {
                    iconHtml.html = iconHtml.html.replace(/(src=\"\S+\")/g, `src="${this.iconData}"`);
                }
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
            if (fType && fType._propertyTypeData) {
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

        public handleConversionResultMessage(result: any) {
            if (result && result.data && result.data['notFound']) {
                if (_.isEmpty(result.data['notFound'])) {
                    this.notFoundLocations = null;
                } else {
                    this.notFoundLocations = result.data['notFound'];
                    this.$messageBus.notify('Niet gevonden locaties:', Object.keys(this.notFoundLocations).join('\n'), csComp.Services.NotifyLocation.TopBar, csComp.Services.NotifyType.Normal, 10000);
                }
            }
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
                        return (100 - value) / 100;
                    });
                    ngModel.$formatters.push((value) => {
                        return (100 - (value * 100));
                    });
                }
            }
        };
    });
}