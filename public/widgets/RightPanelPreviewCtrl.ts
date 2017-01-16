module Table2Map {
    /**
     * Config
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

    /**
     * Directive to display a feature's properties in a panel.
     *
     * @seealso          : http://www.youtube.com/watch?v=gjJ5vLRK8R8&list=UUGD_0i6L48hucTiiyhb5QzQ
     * @seealso          : http://plnkr.co/edit/HyBP9d?p=preview
     */
    myModule.directive('rightpanelpreview', ['$compile',
        function ($compile): ng.IDirective {
            return {
                terminal: true, // do not compile any other internal directives
                restrict: 'E', // E = elements, other options are A=attributes and C=classes
                scope: {}, // isolated scope, separated from parent. Is however empty, as this directive is self contained by using the messagebus.
                templateUrl: 'widgets/RightPanelPreview.tpl.html',

                replace: true, // Remove the directive from the DOM
                transclude: true, // Add elements and attributes to the template
                controller: RightPanelPreviewCtrl
            }
        }
    ]);

    import IFeature = csComp.Services.IFeature;
    import IFeatureType = csComp.Services.IFeatureType;
    import IPropertyType = csComp.Services.IPropertyType;
    import IPropertyTypeData = csComp.Services.IPropertyTypeData;

    class RightPanelPreviewOptions implements L.SidebarOptions {
        public position: string;
        public closeButton: boolean;
        public autoPan: boolean;

        constructor(position: string) {
            this.position = position;
            this.closeButton = false;
            this.autoPan = true;
        }
    }

    export interface IRightPanelPreviewScope extends ng.IScope {
        vm: RightPanelPreviewCtrl;
        showMenu: boolean;
        feature: IFeature;
        tabs: JQuery;
        tabScrollDelta: number;
        featureTabActivated(sectionTitle: string, section: CallOutSection);
        autocollapse(init: boolean): void;
    }

    export interface ICorrelationResult {
        property: string;
        value: Object;
    }

    export interface ICallOutProperty {
        _id: string;
        key: string;
        value: string;
        property: string;
        canFilter: boolean;
        canStyle: boolean;
        canShowStats: boolean;
        feature: IFeature;
        description ? : string;
        propertyType ? : IPropertyType;
        isFilter: boolean;
        showMore: boolean;
        showChart: boolean;
        stats: any;
        bins: any;
        cors: {
            [prop: string]: ICorrelationResult
        };
    }

    export class CallOutProperty implements ICallOutProperty {
        public stats: any;
        public bins: any;
        public _id: string;
        public showMore: boolean;
        public showChart: boolean;
        public cors: {
            [prop: string]: ICorrelationResult
        };
        constructor(
            public key: string,
            public value: string,
            public property: string,
            public canFilter: boolean,
            public canStyle: boolean,
            public canShowStats: boolean,
            public feature: IFeature,
            public isFilter: boolean,
            public isSensor: boolean,

            public description ? : string,
            public propertyType ? : IPropertyType,
            public timestamps ? : number[],
            public sensor ? : number[],
            public isDraft ? : boolean) {
            this.cors = {};
            this._id = csComp.Helpers.getGuid();
        }

    }

    export interface ICallOutSection {
        propertyTypes: {
            [label: string]: IPropertyType
        }; // Probably not needed
        properties: Array < ICallOutProperty > ;
        sectionIcon: string;
        addProperty(key: string, value: string, property: string, canFilter: boolean, canStyle: boolean, canShowStats: boolean, feature: IFeature,
            isFilter: boolean, description ? : string, propertyType ? : IPropertyType, isDraft ? : boolean): void;
        hasProperties(): boolean;
    }

    export class CallOutSection implements ICallOutSection {
        propertyTypes: {
            [label: string]: IPropertyType
        };
        properties: Array < ICallOutProperty > ;
        sectionIcon: string;

        constructor(sectionIcon ? : string) {
            this.propertyTypes = {};
            this.properties = [];
            this.sectionIcon = sectionIcon;
        }

        showSectionIcon(): boolean {
            return !csComp.StringExt.isNullOrEmpty(this.sectionIcon);
        }

            addProperty(key: string, value: string, property: string, canFilter: boolean, canStyle: boolean, canShowStats: boolean, feature: IFeature,
            isFilter: boolean, description ? : string, propertyType ? : IPropertyType, isDraft ? : boolean): void {
            var isSensor = feature.sensors && feature.sensors.hasOwnProperty(property);
            if (isSensor) {
                this.properties.push(new CallOutProperty(key, value, property, canFilter, canStyle, canShowStats, feature, isFilter, isSensor, description ?
                    description :
                    null, propertyType, feature.timestamps, feature.sensors[property], isDraft));
            } else {
                this.properties.push(new CallOutProperty(key, value, property, canFilter, canStyle, canShowStats, feature, isFilter, isSensor, description ?
                    description :
                    null, propertyType, null, null, isDraft));
            }
        }

            hasProperties(): boolean {
            return this.properties != null && this.properties.length > 0;
        }
    }

    export class CallOut {
        public title: string;
        public icon: string;
        public sections: {
            [title: string]: ICallOutSection;
        };
        public sectionKeys: string[];
        public hasInfoSection: boolean;

        constructor(
            private type: IFeatureType,
            private feature: IFeature,
            private propertyTypeData: IPropertyTypeData,
            private layerservice: csComp.Services.LayerService,
            private mapservice: csComp.Services.MapService) {
            this.sections = {};
            this.sectionKeys = [];
            this.hasInfoSection = false;
            //if (type == null) this.createDefaultType();
            this.setTitle();
            this.setIcon(feature);

            var infoCallOutSection = new CallOutSection('fa-info');
            var linkCallOutSection = new CallOutSection('fa-link');

            var displayValue: string;
            if (type != null) {

                // if feature type has propertyTypeKeys defined use these to show the order of the properties
                if (feature.fType.propertyTypeKeys) {
                    feature.fType._propertyTypeData.forEach((mi: IPropertyType) => {
                        if (feature.properties.hasOwnProperty(mi.label) || mi.type === 'relation') {
                            if (mi.visibleInCallOut) this.addProperty(mi, feature, infoCallOutSection, linkCallOutSection);
                        }
                    });
                } else { // if not go through all properties and find a propertyType
                    for (var key in feature.properties) {
                        var mi = layerservice.getPropertyType(feature, key);

                        if (mi) {
                            this.addProperty(mi, feature, infoCallOutSection, linkCallOutSection);
                        } else if (feature.fType.showAllProperties || this.mapservice.isAdminExpert) {
                            var prop = csComp.Helpers.getPropertyType(feature, key);
                            this.addProperty(prop, feature, infoCallOutSection, linkCallOutSection, true);
                        }
                    }
                }
            }
            if (infoCallOutSection.properties.length > 0) {
                this.hasInfoSection = true;
                this.sections['Aaa Info'] = infoCallOutSection; // The AAA is added as the sections are sorted alphabetically (not anymore in angular 1.4!!!)
                this.sectionKeys.push('Aaa Info');
            } else {
                this.hasInfoSection = false;
            }
            this.sectionKeys = this.sectionKeys.sort();
        }

        private addProperty(mi: IPropertyType, feature: IFeature, infoCallOutSection: CallOutSection, linkCallOutSection: CallOutSection, isDraft = false) {
            var callOutSection = this.getOrCreateCallOutSection(mi.section) || infoCallOutSection;
            if (callOutSection.propertyTypes.hasOwnProperty(mi.label)) return; // Prevent duplicate properties in the same  section
            callOutSection.propertyTypes[mi.label] = mi;
            var text = feature.properties[mi.label];
            var displayValue = csComp.Helpers.convertPropertyInfo(mi, text);
            // Skip empty, non-editable values
            if (!mi.canEdit && csComp.StringExt.isNullOrEmpty(displayValue)) return;

            var canFilter = (mi.type === 'number' || mi.type === 'text' || mi.type === 'options' || mi.type === 'date' || mi.type === 'boolean');
            if (mi.filterType) canFilter = mi.filterType.toLowerCase() !== 'none';
            var canStyle = (mi.type === 'number' || mi.type === 'options' || mi.type === 'color');
            if (mi.styleType) canStyle = mi.styleType.toLowerCase() !== 'none';
            var canShowStats = (typeof mi.canShowStats === 'undefined') || mi.canShowStats;
            if (mi.visibleInCallOut) {
                callOutSection.addProperty(mi.title, displayValue, mi.label, canFilter, canStyle, canShowStats, feature, false, mi.description, mi, isDraft);
            }
        }

        public sectionCount(): number {
            return this.sectionKeys.length;
        }

        public firstSection(): ICallOutSection {
            var first = this.sections[this.sectionKeys[0]];
            return first;
        }

        public lastSection(): ICallOutSection {
            var last = this.sections[this.sectionKeys[this.sectionKeys.length - 1]];
            return last;
        }

        private getOrCreateCallOutSection(sectionTitle: string): ICallOutSection {
            if (!sectionTitle) {
                return null;
            }
            if (sectionTitle in this.sections)
                return this.sections[sectionTitle];
            this.sections[sectionTitle] = new CallOutSection();
            this.sectionKeys.push(sectionTitle);
            return this.sections[sectionTitle];
        }

        /**
         * Set the title of the callout to the title of the feature.
         */
        private setTitle() {
            this.title = csComp.Helpers.featureTitle(this.type, this.feature);
        }

        private setIcon(feature: csComp.Services.IFeature) {
            this.icon = (this.type == null || this.type.style == null || !this.type.style.hasOwnProperty('iconUri') || this.type.style.iconUri.toLowerCase().indexOf('_media') >= 0) ?
                '' :
                this.type.style.iconUri.indexOf('{') >= 0 ?
                csComp.Helpers.convertStringFormat(feature, this.type.style.iconUri) :
                this.type.style.iconUri;
        }
    }

    export class RightPanelPreviewCtrl {
        private scope: IRightPanelPreviewScope;
        public lastSelectedProperty: IPropertyType;
        private defaultDropdownTitle: string;

        // list of active stats/charts properties, used when switching between features to keep active stats open
        private showMore = [];
        private showChart = [];
        private featureType;
        private callOut: CallOut;

        // $inject annotation.
        // It provides $injector with information about dependencies to be injected into constructor
        // it is better to have it close to the constructor, because the parameters must match in count and type.
        // See http://docs.angularjs.org/guide/di
        public static $inject = [
            '$scope',
            '$location',
            '$sce',
            'mapService',
            'layerService',
            'messageBusService',
            '$translate',
            '$compile'
        ];

        // dependencies are injected via AngularJS $injector
        // controller's name is registered in Application.ts and specified from ng-controller attribute in index.html
        constructor(
            private $scope: IRightPanelPreviewScope,
            private $location: ng.ILocationService,
            private $sce: ng.ISCEService,
            private $mapService: csComp.Services.MapService,
            private $layerService: csComp.Services.LayerService,
            private $messageBusService: csComp.Services.MessageBusService,
            private $translate: ng.translate.ITranslateService,
            private $compile: ng.ICompileService
        ) {
            this.setDropdownTitle();
            //this.$layerService.addLayer();
            this.scope = $scope;
            $scope.vm = this;

            this.$messageBusService.subscribe('table2map', (title, data) => {
                switch (title) {
                    case 'update-rightpanel':
                        this.displayFeature( < IFeature > data);
                        break;
                }
            })
        }

        public addSparkline(item: ICallOutProperty) {
            var ch = $('#featurepropchart_' + item._id);
            ch.empty();
            if (this.showChart.indexOf(item.property) < 0) this.showChart.push(item.property);
            var ns = < any > this.$scope;
            ns.item = item;

            // create sparkline
            try {
                var chartElement = this.$compile('<sparkline-chart timestamps="item.timestamps" smooth="false" closed="false" sensor="item.sensor" width="320" height="100" showaxis="true"></sparkline-chart>')(ns);
                ch.append(chartElement);
            } catch (e) {
                console.log('Error adding sparkline');
            }
        }

        public createSparkLineChart(item: ICallOutProperty) {
            item.showChart = !item.showChart;

            if (item.showChart) {
                this.addSparkline(item);
            } else {
                var ch = $('#featurepropchart_' + item._id);
                ch.empty();
            }
        }

        public displayFeature(feature: IFeature): void {
            if (!feature) return;
            this.featureType = feature.fType;
            //this.featureType.id
            // If we are dealing with a sensor, make sure that the feature's timestamps are valid so we can add it to a chart
            if (typeof feature.sensors !== 'undefined' && typeof feature.timestamps === 'undefined')
                feature.timestamps = this.$layerService.findLayer(feature.layerId).timestamps;

            this.callOut = new CallOut(this.featureType, feature, this.$layerService.propertyTypeData, this.$layerService, this.$mapService);
            if (this.showMore.length > 0 || this.showChart.length > 0) {
                for (var s in this.callOut.sections) {
                    var sec = this.callOut.sections[s];
                    sec.properties.forEach((p: ICallOutProperty) => {
                        p.showMore = this.showMore.indexOf(p.property) >= 0;
                        p.showChart = this.showChart.indexOf(p.property) >= 0;
                        if (p.showChart) this.addSparkline(p);
                    });
                }
            }
        }

        private editPropertyType(item: CallOutProperty) {
            this.$messageBusService.publish('table2map', 'editPropertyType', item.propertyType);
        }

        public toTrusted(html: string): string {
            try {
                if (html === undefined || html === null)
                    return this.$sce.trustAsHtml(html);
                if (typeof html === 'string' && (html.indexOf('http') === 0 || html.indexOf('www') === 0) )
                    return this.$sce.trustAsHtml(`<a href=${html} target="_blank">${html.substring(0,32)}</a>`);
                return this.$sce.trustAsHtml(html.toString());
            } catch (e) {
                console.log(e + ': ' + html);
                return '';
            }
        }

        getFormattedDate(fp, pt: IPropertyType): string {
            if (!fp) return;
            var format: string;
            if (pt && pt.hasOwnProperty('stringFormat')) {
                format = pt.stringFormat;
            } else {
                return moment(fp).calendar();
                //format = 'DD MMMM YYYY ';
            }
            if (moment(fp).format(format) === 'Invalid date') {
                return moment(fp, 'YYYYMMDD').format(format);
            } else {
                return moment(fp).format(format);
            }
        }

        //When a feature has multiple sections, a dropdown list is created with the title defined in the language entry 'CHOOSE_DROPDOWN' (e.g. 'Choose...' or 'Data...')
        private setDropdownTitle() {
            this.$translate('CHOOSE_DROPDOWN').then(translation => {
                if (typeof translation === 'string' && translation.length > 0) {
                    this.defaultDropdownTitle = translation;
                } else {
                    this.defaultDropdownTitle = '...';
                }
            });
        }
    }
}