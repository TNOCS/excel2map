module Table2Map {
    /**
     * Config
     */
    var moduleName = 'csComp';

    export interface ILegendItem {
        title:       string;
        uri:         string;
        html:        string;
        showicon:    boolean;
        color:       string;
        count?:      number;
        expressions?:  IPropertyType[];
        features?:   IFeature[];
    }
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
     * Directive to display the available map layers.
     */
    myModule.directive('zodklegend', [function (): ng.IDirective {
        return {
            restrict: 'E', // E = elements, other options are A=attributes and C=classes
            scope: {}, // isolated scope, separated from parent. Is however empty, as this directive is self contained by using the messagebus.
            templateUrl: 'zodk/ZodkLegend.tpl.html',
            replace: true, // Remove the directive from the DOM
            transclude: false, // Add elements and attributes to the template
            controller: ZodkLegendCtrl
        }
    }]);

    export class ZodkLegendData {
        title: string;
        rankingProperties: Dictionary < string > ;
        bins: number;
        layerId: string;
        hint: string;
    }

    export interface IZodkLegendScope extends ng.IScope {
        vm: ZodkLegendCtrl;
        data: ZodkLegendData;
        style: csComp.Services.GroupStyle;
        filter: csComp.Services.GroupFilter;
        minimized: boolean;
        selectedFeature: csComp.Services.IFeature;
        activeLegend: csComp.Services.Legend;
        activeStyleGroup: csComp.Services.ProjectGroup;
        activeStyleProperty: string;
    }

    export class ZodkLegendCtrl {
        private scope: IZodkLegendScope;
        private widget: csComp.Services.IWidget;
        private parentWidget: JQuery;
        private mBusHandles: csComp.Services.MessageBusHandle[] = [];
        private exporterAvailable: boolean;
        private selectedProp: csComp.Services.IPropertyType;
        private selectedBins: string;
        private selectableProps: csComp.Services.IPropertyType[] = [];
        private layer: csComp.Services.ProjectLayer;
        private filterValue: number = 0;
        private filterDim: any;
        private activeStyle;
        private leg: csComp.Services.Legend;

        private bbox: L.LatLngBounds;

        public static $inject = [
            '$scope',
            '$timeout',
            '$translate',
            'layerService',
            'messageBusService',
            'mapService'
        ];

        constructor(
            private $scope: IZodkLegendScope,
            private $timeout: ng.ITimeoutService,
            private $translate: ng.translate.ITranslateService,
            private $layerService: csComp.Services.LayerService,
            private $messageBus: csComp.Services.MessageBusService,
            private $mapService: csComp.Services.MapService
        ) {
            $scope.vm = this;
            var par = < any > $scope.$parent;
            this.widget = par.widget;
            this.parentWidget = $(`#${this.widget.elementId}-parent`);

            $scope.data = < ZodkLegendData > this.widget.data;
            $scope.minimized = false;

            this.mBusHandles.push(this.$messageBus.subscribe('updatelegend', (title: string, data: any) => {
                // this.handleLegendUpdate(title, data);
                this.handleLegendStyleUpdate();
            }));

            this.mBusHandles.push(this.$messageBus.subscribe('zodk', (title, data: any) => {
                // this.handleZodkUpdate(title, data);
            }));

            this.mBusHandles.push(this.$messageBus.subscribe('layer', (title) => {
               this.$timeout(() => {
                   this.updateLegendItemsUsingFeatures();
                }, 300);
            }));

            this.init();

            if (this.$layerService.$rootScope.$$phase !== '$apply' && this.$layerService.$rootScope.$$phase !== '$digest') {
                this.$layerService.$rootScope.$apply();
            }
        }

        private init() {
            let dummyProp = {
                title: '- Geen kleuren -'
            };
            this.selectableProps.push(dummyProp);
            if (this.$scope.data && this.$scope.data.rankingProperties) {
                _.each(this.$scope.data.rankingProperties, (p) => {
                    let property = this.$layerService.propertyTypeData[p];
                    if (property) {
                        this.selectableProps.push(property);
                    }
                });
            }
            this.getActiveStyle();
            // this.$scope.activeStyleProperty = null;
            this.handleLegendStyleUpdate();

            this.updateLegendItemsUsingFeatures();
        }

        private updateLegendItemsUsingFeatures() {
            var sort = true;
            var processedFeatureTypes = {};
            var legendItems: Array<ILegendItem> = [];
            var existingItems: Array<string> = [];
            if (!this.$layerService.project || this.$layerService.project.features.length === 0) {
                this.$scope.legendItems = legendItems;
                return;
            }
            // Loop over all features on the map
            this.$layerService.project.features.forEach((f) => {
                if (!f._gui.included) return;
                var bounds = csComp.Helpers.GeoExtensions.getFeatureBounds(f);
                if (this.bbox && bounds && !(<any>this.bbox).overlaps(bounds)) return;
                var ft: csComp.Services.IFeatureType = f.fType;
                if (!ft) ft = this.$layerService.getFeatureType(f);
                if (!ft || processedFeatureTypes.hasOwnProperty(ft.name)) return;
                let uri = ft.style && ft.style.hasOwnProperty('iconUri')
                    ? csComp.Helpers.convertStringFormat(f, ft.style.iconUri)
                    : csComp.Helpers.getImageUri(ft);
                let title = ft.name || f.layer.title || (ft.id ? ft.id.split('#').pop() : 'undefined');
                let existingItem = title + uri;

                let color = "";
                if (ft.style.hasOwnProperty('fillColor'))
                    color = ft.style.fillColor;

                let showicon = false;
                if (ft.style.drawingMode == "Point")
                    showicon = true;

                var i = existingItems.indexOf(existingItem);
                if (i < 0) {
                    // If a (static) legend is defined in the featureType, use it
                    if (ft.hasOwnProperty('legendItems')) {
                        ft['legendItems'].forEach((i) => {
                            legendItems.push({ title: i.title, uri: i.uri || '', showicon: showicon, color: color, html: i.html || '' });
                        });
                        sort = false;
                        processedFeatureTypes[ft.name] = true;
                        return;
                    }
                    // Else get the legend entry from the feature style
                    if (uri.indexOf('_Media') >= 0) f.effectiveStyle.iconUri = 'cs/images/polygon.png';
                    let html = csComp.Helpers.createIconHtml(f)['html'];
                    existingItems.push(existingItem);

                    legendItems.push({ title: title, uri: uri, showicon: showicon, color: color, html: html, count: 1, expressions: ft.legendExpr, features: [f] });
                } else {
                    legendItems[i].features.push(f);
                }
            });
            if (sort) {
                legendItems.sort((a: ILegendItem, b: ILegendItem) => {
                    if (a.title > b.title) return 1;
                    if (a.title < b.title) return -1;
                    return 0;
                });
            }
            // legendItems.forEach(li => {
            //     li.count = li.features.length;
            //     if (li.expressions && li.expressions.length > 0) {
            //         for (let i = 0, _length = li.expressions.length; i < _length; i++) {
            //             let pt = li.expressions[i];
            //             //pt.calculation = this.expressionService.evalPropertyType(pt, li.features, null);
            //         }
            //         delete li.features;
            //     }
            // });
            this.$timeout(() => {
                this.$scope.legendItems = legendItems;
            }, 0);
        }

        private getActiveStyle() {
            let p = this.$layerService.project;
            var gs: csComp.Services.GroupStyle;
            if (!p || !p.groups) return;
            p.groups.forEach((group) => {
                if (_.isArray(group.styles) && group.styles.length > 0) {
                    gs = group.styles[0];
                }
            });
            if (!gs) return;
            this.$timeout(() => {
                this.$scope.activeLegend = gs.activeLegend;
                this.$scope.activeStyleGroup = gs.group;
                this.$scope.activeStyleProperty = gs.property;
            }, 0);
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
            this.hide();
        }

        public stop() {
            if (this.mBusHandles && this.mBusHandles.length > 0) {
                this.mBusHandles.forEach((mbh) => {
                    this.$messageBus.unsubscribe(mbh);
                });
            }
        }

        private hide() {
            if (this.parentWidget.hasClass('collapse')) {
                this.parentWidget.collapse('hide');
            } else {
                this.parentWidget.hide();
            }
        }

        private show() {
            if (this.parentWidget.hasClass('collapse')) {
                this.parentWidget.collapse('show');
            } else {
                this.parentWidget.show();
            }
        }

        private openStylePanel() {
            this.$messageBus.publish('zodk', 'openstylepanel', this.$scope.activeStyleGroup.layers[0] || new csComp.Services.ProjectLayer());
        }

        private selectFilter = _.debounce(this.selectFilterDebounced, 750);

        private selectFilterDebounced() {
            this.$messageBus.publish('zodk', 'filter', +this.filterValue);
        }

        private selectProp() {
            let l = this.$scope.activeStyleGroup.layers[0] || new csComp.Services.ProjectLayer();
            this.$layerService.setStyleForProperty(l, this.$scope.activeStyleProperty);
        }

        private createChart() {
            var layer = this.$layerService.findLoadedLayer('bagbuurten');
            if (!layer) return;
            this.$scope.style = layer.group.styles[0];
            console.log(`Create chart ${this.widget.id}`);
            var gf = new csComp.Services.GroupFilter();
            gf.property = this.$scope.style.property;
            gf.id = this.widget.id;
            gf.group = this.$scope.style.group;
            if (gf.group.ndx) {
                gf.group.ndx.remove();
            }
            gf.group.ndx = crossfilter([]);
            gf.group.ndx.add(_.map(gf.group.markers, (item: any, key) => {
                return item.feature;
            }));
            gf.title = this.$scope.style.title;
            gf.filterLabel = null;
            gf.filterType = 'row';
            this.$layerService.removeAllFilters(gf.group);
            gf.group.filters.push(gf);
            this.$timeout(() => {
                this.$scope.filter = gf;
                this.$scope.filter.showInWidget = true;
            });
            this.$timeout(() => {
                this.updateRowFilterScope(gf);
            });
            this.parentWidget.show();
            if (gf.group.id === 'buurten') {
                (this.filterDim ? this.filterDim.dispose() : null);
                this.filterDim = null;
                this.addBuurtFilter(this.filterValue);
            }
            // var propType = this.$layerService.findPropertyTypeById(this.$scope.layer.typeUrl + '#' + gf.property);
            // this.$layerService.setGroupStyle(this.$scope.style.group, propType);
        }

        private addBuurtFilter(minSize: number) {
            var layer = this.$layerService.findLoadedLayer('bagbuurten');
            if (!layer) {
                return;
            }
            if (layer.group.ndx) {
                layer.group.ndx.remove();
            }
            layer.group.ndx = crossfilter([]);
            layer.group.ndx.add(_.map(layer.group.markers, (item: any, key) => {
                return item.feature;
            }));
            // dc.filterAll();
            this.filterValue = minSize;
            var propId = 'data/resourceTypes/Buurt.json#ster_totaal';
            var p = this.$layerService.findPropertyTypeById(propId);
            var propLabel = propId.split('#').pop();
            if (layer.group && layer.group.ndx && !this.filterDim) {
                this.filterDim = layer.group.ndx.dimension(d => {
                    if (!d.properties.hasOwnProperty(propLabel)) return null;
                    let prop = d.properties[propLabel];
                    if (prop === null || prop === undefined || isNaN(prop)) return null;
                    return prop;
                });
            }
            this.applyFilter(this.filterValue, layer.group);
        }

        private applyFilter(filterValue, group) {
            console.log('Apply buurtfilter');
            if (filterValue === null || filterValue === undefined || isNaN(filterValue)) return;
            if (!this.filterDim) return;
            if (filterValue > 0) {
                this.filterDim.filter([filterValue, Infinity]);
            } else {
                this.filterDim.filterAll();
            }
            group.filterResult = this.filterDim.top(Infinity);
            this.$timeout(() => {
                //     this.updateRowVisualizerScope(this.$scope.filter);
                this.updateRowFilterScope(this.$scope.filter);
            });
            // this.$messageBus.publish('filters', 'updateGroup', group.id);
        }

        private updateRowFilterScope(gf: csComp.Services.GroupFilter) {
            if (!gf || !gf.group) {
                console.log('No filter provided.');
                return;
            }
            var rowFilterElm = angular.element($("#filter_" + this.widget.id));
            if (!rowFilterElm) {
                console.log('rowFilterElm not found.');
                return;
            }
            var rowFilterScope = < Filters.IRowFilterScope > rowFilterElm.scope();
            if (!rowFilterScope) {
                console.log('rowFilterScope not found.');
                return;
            } else {
                rowFilterScope.filter = gf;
                rowFilterScope.vm.initRowFilter();
                return;
            }
        }

        public toggleFilter(legend: csComp.Services.Legend, le: csComp.Services.LegendEntry) {
            if (!legend || !le) return;
            var projGroup = this.$scope.activeStyleGroup;
            var property = this.$layerService.propertyTypeData[this.$scope.activeStyleProperty];
            if (!projGroup || !property) return;
            //Check if filter already exists. If so, remove it.
            var exists: boolean = projGroup.filters.some((f: csComp.Services.GroupFilter) => {
                if (f.property === property.label) {
                    this.$layerService.removeFilter(f);
                    return true;
                }
            });
            if (!exists) {
                var gf = new csComp.Services.GroupFilter();
                gf.property = property.label; //prop.split('#').pop();
                gf.id = 'buttonwidget_filter';
                gf.group = projGroup;
                gf.filterType = 'row';
                gf.title = property.title;
                gf.rangex = [le.interval.min, le.interval.max];
                gf.filterLabel = le.label;
                console.log('Setting filter');
                this.$layerService.rebuildFilters(projGroup);
                projGroup.filters = projGroup.filters.filter((f) => {
                    return f.id !== gf.id;
                });
                this.$layerService.setFilter(gf, projGroup);
            }
        }


        private handleLegendStyleUpdate() {
            this.leg = new csComp.Services.Legend();

            this.activeStyle = null;
            this.$layerService.project.groups.forEach((g) => {
                g.styles.forEach((gs) => {
                    if (gs.enabled) {
                        this.activeStyle = gs;
                    }
                });
            });

            if (!this.activeStyle) {
                return;
            }

            var ptd: csComp.Services.IPropertyType = this.$layerService.propertyTypeData[this.activeStyle.property];

            this.leg.description = ptd.title;
            if (!this.leg.legendEntries) this.leg.legendEntries = [];
            if (this.leg.legendEntries.length == 0 && this.activeStyle.info.min !== this.activeStyle.info.max) {
                this.leg.legendEntries.push(this.createLegendEntry(this.activeStyle, ptd, this.activeStyle.info.userMin));
                this.leg.legendEntries.push(this.createLegendEntry(this.activeStyle, ptd, (this.activeStyle.info.userMin + this.activeStyle.info.userMax) / 4));
                this.leg.legendEntries.push(this.createLegendEntry(this.activeStyle, ptd, 2 * (this.activeStyle.info.userMin + this.activeStyle.info.userMax) / 4));
                this.leg.legendEntries.push(this.createLegendEntry(this.activeStyle, ptd, 3 * (this.activeStyle.info.userMin + this.activeStyle.info.userMax) / 4));
                this.leg.legendEntries.push(this.createLegendEntry(this.activeStyle, ptd, this.activeStyle.info.userMax));
                this.leg.legendEntries = this.leg.legendEntries.sort((a, b) => { return (a.value - b.value) });
            }
        }

        public getStyle(legend: csComp.Services.Legend, le: csComp.Services.LegendEntry, key: number) {
            var style = {
                'background': `linear-gradient(to bottom, ${le.color}, ${legend.legendEntries[legend.legendEntries.length - key - 2].color})`,
            }
            return style;
        }


        private createLegendEntry(activeStyle: csComp.Services.GroupStyle, ptd: csComp.Services.IPropertyType, value: number) {
            var le = new csComp.Services.LegendEntry();
            le.label = csComp.Helpers.convertPropertyInfo(ptd, value);
            if (le.label === value.toString()) {
                //if no stringformatting was applied, define one based on maximum values
                if (activeStyle.info.max > 100) {
                    le.label = (<any>String).format("{0:#,#}", value);
                } else {
                    le.label = (<any>String).format("{0:#,#.#}", value);
                }
            }
            le.value = value;
            le.color = csComp.Helpers.getColor(value, activeStyle);
            return le;
        }


        private handleLegendUpdate(title: string, data ? : any) {
            switch (title) {
                case 'removelegend':
                    break;
                case 'hidelegend':
                    this.hide();
                    break;
                default:
                    if (data && data.activeLegend) {
                        this.$timeout(() => {
                            this.$scope.activeLegend = data.activeLegend;
                            this.$scope.activeStyleGroup = data.group;
                            this.$scope.activeStyleProperty = data.property;
                            this.show();
                        }, 0);
                    }
                    // if (data && !(data.activeLegend && data.activeLegend.id.indexOf('_rank') === 0)) {
                    //     delete this.$scope.filter;
                    //     this.$scope.style = data;
                    // }
                    if (this.$scope.$root.$$phase !== '$apply' && this.$scope.$root.$$phase !== '$digest') {
                        this.$scope.$apply();
                    }
            }
        }

        private handleZodkUpdate(title: string, data ? : any) {
            switch (title) {
                case 'filter':
                    if (!data && data !== 0) return;
                    (this.filterDim ? this.filterDim.dispose() : null);
                    this.filterDim = null;
                    if (this.$scope.filter) {
                        this.addBuurtFilter(data);
                    } else {
                        this.createChart();
                    }
                    break;
                default:
                    break;
            }
        }

        private getColor(v: string) {
            let result = csComp.Helpers.getColorAndOpacityFromRgbaString(v);
            if (!result) return v;
            return result.color;
        }

        private getOpacity(v: string) {
            let result = csComp.Helpers.getColorAndOpacityFromRgbaString(v);
            if (!result) return 1;
            return result.opacity;
        }

        /** Hide groups whose title or id start with an underscore */
        private filterHiddenGroups(group: csComp.Services.ProjectGroup) {
            return group.title[0] !== '_' && group.id[0] !== '_';
        }
    }
}
