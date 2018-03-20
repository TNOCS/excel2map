module zodk {
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

    myModule.directive('zodkbarFilter', [
        '$compile',
        function($compile): ng.IDirective {
            return {
                terminal: true,    // do not compile any other internal directives
                restrict: 'E',     // E = elements, other options are A=attributes and C=classes
                scope: {
                    filter: '&',
                    inline: '&'
                },                 // isolated scope, separated from parent. Is however empty, as this directive is self contained by using the messagebus.
                templateUrl: 'zodk/ZodkBarFilter.tpl.html',
                replace: true,    // Remove the directive from the DOM
                transclude: true,    // Add elements and attributes to the template
                controller: ZodkBarFilterCtrl,
                link: function($scope, element, attrs) {
                    $scope.$on('onFilterRefresh', function(e){
                        $scope.vm.updateRange();
                    });
                }
            }
        }
    ])

    export interface IBarFilterScope extends ng.IScope {
        vm: ZodkBarFilterCtrl;
        filter: csComp.Services.GroupFilter;
    }

    export class ZodkBarFilterCtrl {
        private scope: IBarFilterScope;
        private widget: csComp.Services.IWidget;

        // $inject annotation.
        // It provides $injector with information about dependencies to be injected into constructor
        // it is better to have it close to the constructor, because the parameters must match in count and type.
        // See http://docs.angularjs.org/guide/di
        public static $inject = [
            '$scope',
            'layerService',
            '$timeout',
            '$translate'
        ];

        private dcChart: any;
        public inline: boolean;

        // dependencies are injected via AngularJS $injector
        // controller's name is registered in Application.ts and specified from ng-controller attribute in index.html
        constructor(
            public $scope: IBarFilterScope,
            private $layerService: csComp.Services.LayerService,
            private $timeout: ng.ITimeoutService,
            private $translate: ng.translate.ITranslateService) {

            $scope.vm = this;
            this.inline = $scope.inline();

            if (this.inline) {
                $scope.filter = (<any>$scope).filter();
            }
            else {
                var par = <any>$scope.$parent;
                if (par.hasOwnProperty('filter')) {
                    $scope.filter = par['filter'];
                }
            }

            if ($scope && $scope.filter) {
                setTimeout(() => this.initBarFilter());
            }
        }

        private destroy() {
            this.$scope.filter.group.filterResult = this.$scope.filter.dimension.filterAll().top(Infinity);
            this.$scope.filter.dimension.dispose();
            this.$scope.filter.group.filters = this.$scope.filter.group.filters.filter(f => { return f !== this.$scope.filter; });
        }

        private displayFilterRange(min, max) {
            min = parseFloat(min);
            max = parseFloat(max);
            if ((+min) > (+max)) {
                min = max;
            }
            var filter = this.$scope.filter;
            filter.from = filter.rangex[0] < min
                ? min
                : filter.rangex[0];
            filter.to = filter.rangex[1] > max
                ? max
                : filter.rangex[1];
            this.$scope.$apply();
        }

        public initBarFilter() {
            var filter = this.$scope.filter;
            var group = filter.group;

            if (this.inline)
                var divid = 'filter_inline_' + filter.id;
            else
                var divid = 'filter_' + filter.id;

            this.dcChart = <any>dc.barChart('#' + divid);

            this.$scope.$apply();

            var info = (filter.meta['propertyInfo']) ? filter.meta['propertyInfo'] :this.$layerService.calculatePropertyInfo(group, filter.property);
            var nBins = (filter.meta['numberOfBins']) ? filter.meta['numberOfBins'] : Math.ceil(Math.sqrt(Object.keys(group.markers).length));
            var min = info.min;
            var max = info.max;
            var binWidth = Math.ceil(Math.abs(max - min) / nBins);
            max  = min + nBins * binWidth;
            var dx = Math.round(binWidth / 2);

           if (!filter.from)
                filter.from = filter.rangex[0] = min;

            if (!filter.to)
                filter.to = filter.rangex[1] = max;

            this.dcChart
                .width(348)
                .height(110)
                .dimension(filter.dimension)
                .group(filter.dimension.group())
                .transitionDuration(10)
                .margins({top: 10, right: 20, bottom: 20, left: 30})
                .centerBar(true)
                .gap(0) //d3.scale.quantize().domain([0, 10]).range(d3.range(1, 4));
                .elasticY(true)
                .x(d3.scale.linear().domain([min, max]).range([-1, nBins + 1]))
                .filterPrinter(filters => {
                    var s = '';
                    if (filters.length > 0) {
                        var localFilter = filters[0];
                        this.displayFilterRange(parseFloat(localFilter[0]).toFixed(2), parseFloat(localFilter[1]).toFixed(2));
                        s += localFilter[0];
                    }
                    return s;
                }).on('renderlet', (e) => {
                    dc.events.trigger(() => {
                        group.filterResult = filter.dimension.top(Infinity);
                        this.$layerService.updateMapFilter(group);
                    }, 100);
                });

            this.dcChart.xUnits(() => { return 100 / nBins; });
            this.dcChart.yAxis().ticks(5);
            this.dcChart.xAxis().ticks(5);

            dc.renderAll();
            this.updateRange();
        }

        public updateRange() {
            setTimeout(() => {
                var filter = this.$scope.filter;

                this.displayFilterRange(filter.from, filter.to);
                var range = (<any>dc).filters.RangedFilter(filter.from, filter.to);

                this.dcChart.filterAll();
                this.dcChart.filter(range);
                this.dcChart.render();

                this.$scope.$apply();
            }, 0);
        }

        public remove() {
                // this.destroy();
                this.$layerService.removeFilter(this.$scope.filter);
        }
    }
}
