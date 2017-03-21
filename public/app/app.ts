module App {
    import IFeature = csComp.Services.IFeature;

    export interface IAppLocationService extends ng.ILocationService {
        $$search: { layers: string };
    }

    export interface IAppScope extends ng.IScope {
        vm: AppCtrl;
        title: string;
        showMenuRight: boolean;
        featureSelected: boolean;
        layersLoading: number;
        showTabDropdown: boolean;
        sv: boolean;
    }

    // TODO For setting the current culture for string formatting (note you need to include public/js/cs/stringformat.YOUR-CULTURE.js. See sffjs.1.09.zip for your culture.)
    declare var sffjs;
    declare var String;
    declare var omnivore;
    declare var L;

    export class AppCtrl {
        // It provides $injector with information about dependencies to be injected into constructor
        // it is better to have it close to the constructor, because the parameters must match in count and type.
        // See http://docs.angularjs.org/guide/di
        static $inject = [
            '$scope',
            '$timeout',
            '$location',
            '$http',
            'mapService',
            'layerService',
            'messageBusService',
            'dashboardService',
            'geoService',
            'tableToMapSvc',
            'profileService'
        ];

        public areaFilter: AreaFilter.AreaFilterModel;
        public contourAction: ContourAction.ContourActionModel;
        activeLayer: csComp.Services.ProjectLayer;
        nrOfActiveTabs: number;

        // dependencies are injected via AngularJS $injector
        // controller's name is registered in Application.ts and specified from ng-controller attribute in index.html
        constructor(
            private $scope: IAppScope,
            private $timeout: ng.ITimeoutService,
            private $location: IAppLocationService,
            private $http: ng.IHttpService,
            private $mapService: csComp.Services.MapService,
            private $layerService: csComp.Services.LayerService,
            private $messageBusService: csComp.Services.MessageBusService,
            private $dashboardService: csComp.Services.DashboardService,
            private geoService: csComp.Services.GeoService,
            private tableToMapSvc: Table2Map.Table2MapSvc,
            private profileService: csComp.Services.ProfileService
        ) {
            sffjs.setCulture('nl-NL');

            $scope.vm = this;
            $scope.sv = false;
            $scope.showMenuRight = false;
            $scope.featureSelected = false;
            $scope.layersLoading = 0;
            $scope.showTabDropdown = false;

            $scope.$watch('vm.showNavigation', () => {
                $timeout(() => {
                    this.autocollapse();
                }, 20);
            });
            $scope.$watch('vm.$layerService.noFilters', () => {
                $timeout(() => {
                    this.autocollapse();
                }, 20);
            });
            $scope.$watch('vm.$layerService.project.mcas', () => {
                $timeout(() => {
                    this.autocollapse();
                }, 20);
            });

            $messageBusService.subscribe('project', (action: string) => {
                if (action === 'loaded') {
                    this.$dashboardService.widgetTypes['e2muploadwidget'] = <csComp.Services.IWidget>{
                        id: 'e2muploadwidget',
                        icon: 'bower_components/csweb/dist-bower/images/widgets/filter.png',
                        description: 'A widget for uploading files/clipboard content to the web app.'
                    };

                    this.areaFilter = new AreaFilter.AreaFilterModel();
                    this.$layerService.addActionService(this.areaFilter);
                    this.contourAction = new ContourAction.ContourActionModel();
                    this.$layerService.addActionService(this.contourAction);

                    this.autocollapse();

                    // NOTE EV: You may run into problems here when calling this inside an angular apply cycle.
                    // Alternatively, check for it or use (dependency injected) $timeout.
                    if ($scope.$root.$$phase !== '$apply' && $scope.$root.$$phase !== '$digest') { $scope.$apply(); }
                    //$scope.$apply();
                }
            });

            //$messageBusService.subscribe('sidebar', this.sidebarMessageReceived);
            $messageBusService.subscribe('feature', this.featureMessageReceived);
            $messageBusService.subscribe('layer', this.layerMessageReceived);

            var rpt = csComp.Helpers.createRightPanelTab('featureprops', 'featureprops', null, 'Selected feature', '{{\'FEATURE_INFO\' | translate}}', 'info');
            this.$messageBusService.publish('rightpanel', 'activate', rpt);
            this.$layerService.visual.rightPanelVisible = false; // otherwise, the rightpanel briefly flashes open before closing.
            this.profileService.startLogin();
            this.profileService.validate = (username: string, password: string, cb: (success: boolean, profile?: csComp.Services.IProfile) => void) => {
                this.$http
                    .post('/api/login', { email: username, password: password })
                    .then((result: { data: { success: boolean, token: string, user: csComp.Services.IProfile} }) => {
                        if (result.data.success) {
                            this.profileService.token = result.data.token;
                        }
                        cb(result.data.success, result.data.user);
                    })
                    .catch(err => {
                        console.log(err);
                        cb(false);
                    });
            };
            this.profileService.logout = function () {
                // var l = this.$layerService.findLayer('barges');
                // this.profileLayers.forEach(function (pl) {
                //     this.$layerService.removeLayer(pl, true);
                // });
                // var widgets = this.dashboard.widgets.filter(function (w) { return w.id === '27a466a5-f87d-4d55-0bc8-7a9e51f353f1'; });
                // if (widgets) {
                //     var w = widgets[0];
                //     w.data['buttons'] = [];
                // };
            };
            // this.profileService.validate = function (userName, passWord, cb) {
            //     this.profileLayers = [];
            //     // var authReq = <ng.IRequestConfig>{
            //     //     method: 'POST',
            //     //     url: ,
            //     //     headers: {
            //     //         'Accept': 'application/json'
            //     //     },
            //     //     data: {  }
            //     // }
            //     var url = 'http://134.221.210.155:9763/SDL_Amsterdam-1.0.0/services/poc/authenticate?userName=' + userName + '&password=' + passWord;
            //     var auth = $http.get(url, {}).success(function (authResult) {
            //         if (authResult.hasOwnProperty('success') && authResult['success'] === true) {
            //             var res = $http.get('http://134.221.210.155:9763/SDL_Amsterdam-1.0.0/services/poc/users?userName=' + userName).success(function (d) {
            //                 if (d.hasOwnProperty('layers') && _.isArray(d['layers'])) {
            //                     d['layers'].forEach(function (l) {
            //                         this.AddLayer(l.url, l.layerName, l.groupName, 'data/api/projects/sdl/resources/Terminals.json', l.featureType);
            //                     });
            //                 }
            //                 return cb(true, {});
            //             }).error(function (d) {
            //                 return cb(false, {});
            //             });
            //         } else {
            //             return cb(false, {});
            //         }
            //     });
            // };
            this.$layerService.openSolution('data/projects/projects.json', $location.$$search.layers);
        }

        get showNavigation() { return this.$dashboardService._search && this.$dashboardService._search.isActive; }

        /**
         * Publish a toggle request.
         */
        toggleMenuRight() {
            this.$messageBusService.publish('sidebar', 'toggle');
        }

        private layerMessageReceived = (title: string, layer: csComp.Services.ProjectLayer): void => {
            switch (title) {
                case 'loading':
                    this.$scope.layersLoading += 1;
                    console.log('Loading');
                    break;
                case 'activated':
                    if (this.$scope.layersLoading >= 1) this.$scope.layersLoading -= 1;

                    break;
                case 'error':
                    this.$scope.layersLoading = 0;
                    console.log('Error loading');
                    break;
                case 'deactivate':
                    break;
            }

            this.$timeout(() => {
                this.autocollapse();
            }, 20);

            var $contextMenu = $('#contextMenu');

            $('body').on('contextmenu', 'table tr', function (e) {
                $contextMenu.css({
                    display: 'block',
                    left: e.pageX,
                    top: e.pageY
                });
                return false;
            });

            $contextMenu.on('click', 'a', function () {
                $contextMenu.hide();
            });

            // NOTE EV: You need to call apply only when an event is received outside the angular scope.
            // However, make sure you are not calling this inside an angular apply cycle, as it will generate an error.
            if (this.$scope.$root.$$phase !== '$apply' && this.$scope.$root.$$phase !== '$digest') {
                this.$scope.$apply();
            }
        }

        private featureMessageReceived = (title: string): void => {
            switch (title) {
                case 'onFeatureSelect':
                    this.$scope.featureSelected = true;
                    break;
                case 'onFeatureDeselect':
                    this.$scope.featureSelected = false;
                    break;
            }

            // NOTE EV: You need to call apply only when an event is received outside the angular scope.
            // However, make sure you are not calling this inside an angular apply cycle, as it will generate an error.
            // if (this.$scope.$root.$$phase != '$apply' && this.$scope.$root.$$phase != '$digest') {
            //     this.$scope.$apply();
            // }
        }

        /**
         * Callback function
         * @see {http://stackoverflow.com/questions/12756423/is-there-an-alias-for-this-in-typescript}
         * @see {http://stackoverflow.com/questions/20627138/typescript-this-scoping-issue-when-called-in-jquery-callback}
         * @todo {notice the strange syntax, which is to preserve the this reference!}
         */
        private sidebarMessageReceived = (title: string): void => {
            switch (title) {
                case 'toggle':
                    this.$scope.showMenuRight = !this.$scope.showMenuRight;
                    break;
                case 'show':
                    this.$scope.showMenuRight = true;
                    break;
                case 'hide':
                    this.$scope.showMenuRight = false;
                    break;
                default:
            }
        }

        toggleMenu(): void {
            this.$mapService.invalidate();
        }

        toggleSidebar(): void {
            this.$messageBusService.publish('sidebar', 'toggle');
            window.console.log('Publish toggle sidebar');
        }

        //public showTable(tableVisible: boolean) {
        //    this.$mapService.mapVisible = !tableVisible;
        //}

        isActive(viewLocation: string) {
            return viewLocation === this.$location.path();
        }

        autocollapse(): void {
            var maxTabs = 7;
            var tabs = $('#left_menu_headers');
            $('#nav-collapsed-items').children('li').detach().insertBefore(tabs.children('li:last-child'));
            var allTabs = tabs.children('li:not(:last-child)');
            var allVisibleTabs = tabs.children('li:not(:last-child):not(.ng-hide)');
            var nrVisibleTabs = allVisibleTabs.length;
            if (nrVisibleTabs > maxTabs) {
                while (nrVisibleTabs >= maxTabs) {
                    $(allVisibleTabs[nrVisibleTabs - 1]).detach().prependTo('#nav-collapsed-items');
                    nrVisibleTabs = nrVisibleTabs - 1;
                }
                this.$scope.showTabDropdown = true;
            } else {
                this.$scope.showTabDropdown = false;
            }
        };
    }

    // http://jsfiddle.net/mrajcok/pEq6X/
    //declare var google;

    // Start the application
    angular.module('csWebApp', [
        'csComp',
        'ngSanitize',
        'ui.bootstrap',
        'ui.select',
        'LocalStorageModule',
        'angularUtils.directives.dirPagination',
        'pascalprecht.translate',
        'ngCookies',
        'angularSpectrumColorpicker',
        'wiz.markdown',
        'ngAnimate',
        'smart-table'
    ])
        .config(localStorageServiceProvider => {
            localStorageServiceProvider.prefix = 't2m';
        })
        .config(TimelineServiceProvider => {
            TimelineServiceProvider.setTimelineOptions({
                'width': '100%',
                'height': 'auto',
                'cluster': true,
                // The minimal margin in pixels between events.
                'eventMargin': 5,
                // The minimal margin in pixels between events and the horizontal axis.
                'eventMarginAxis': 0,
                // Also load timeline-locales.js
                'locale': 'nl',
                'editable': false,
                // If true, the events on the timeline are selectable. When an event is selected, the select event is fired.
                'selectable': true,
                // If true, the timeline shows a red, vertical line displaying the current time. This time can be synchronized with a server via the method setCurrentTime.
                'showCurrentTime': true,
                'showCustomTime': true,
                'layout': 'box'
            });
        })
        .config(($locationProvider) => {
            $locationProvider.html5Mode({
                enabled: true,
                requireBase: false
            })
        })
        .config($translateProvider => {
            // TODO ADD YOUR LOCAL TRANSLATIONS HERE, OR ALTERNATIVELY, CHECK OUT
            // http://angular-translate.github.io/docs/#/guide/12_asynchronous-loading
            // Translations.English.locale['MAP_LABEL'] = 'MY AWESOME MAP';.
            // Append local translations if present
            if (Translations.DutchAdditional && Translations.DutchAdditional.locale) {
                $translateProvider.translations('nl', $.extend(Translations.Dutch.locale, Translations.DutchAdditional.locale));
            } else {
                $translateProvider.translations('nl', Translations.Dutch.locale);
            }
            if (Translations.EnglishAdditional && Translations.EnglishAdditional.locale) {
                $translateProvider.translations('en', $.extend(Translations.English.locale, Translations.EnglishAdditional.locale));
            } else {
                $translateProvider.translations('en', Translations.English.locale);
            }
            $translateProvider.preferredLanguage('nl');
            // Enable escaping of HTML
            $translateProvider.useSanitizeValueStrategy('escape');
        })
        .config($languagesProvider => {
            // Defines the GUI languages that you wish to use in your project.
            // They will be available through a popup menu.
            var languages = [];
            languages.push({ key: 'en', name: 'English', img: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAALCAIAAAD5gJpuAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAflJREFUeNpinDRzn5qN3uFDt16+YWBg+Pv339+KGN0rbVP+//2rW5tf0Hfy/2+mr99+yKpyOl3Ydt8njEWIn8f9zj639NC7j78eP//8739GVUUhNUNuhl8//ysKeZrJ/v7z10Zb2PTQTIY1XZO2Xmfad+f7XgkXxuUrVB6cjPVXef78JyMjA8PFuwyX7gAZj97+T2e9o3d4BWNp84K1NzubTjAB3fH0+fv6N3qP/ir9bW6ozNQCijB8/8zw/TuQ7r4/ndvN5mZgkpPXiis3Pv34+ZPh5t23//79Rwehof/9/NDEgMrOXHvJcrllgpoRN8PFOwy/fzP8+gUlgZI/f/5xcPj/69e/37//AUX+/mXRkN555gsOG2xt/5hZQMwF4r9///75++f3nz8nr75gSms82jfvQnT6zqvXPjC8e/srJQHo9P9fvwNtAHmG4f8zZ6dDc3bIyM2LTNlsbtfM9OPHH3FhtqUz3eXX9H+cOy9ZMB2o6t/Pn0DHMPz/b+2wXGTvPlPGFxdcD+mZyjP8+8MUE6sa7a/xo6Pykn1s4zdzIZ6///8zMGpKM2pKAB0jqy4UE7/msKat6Jw5mafrsxNtWZ6/fjvNLW29qv25pQd///n+5+/fxDDVbcc//P/zx/36m5Ub9zL8+7t66yEROcHK7q5bldMBAgwADcRBCuVLfoEAAAAASUVORK5CYII=' });
            languages.push({ key: 'nl', name: 'Nederlands', img: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAALCAIAAAD5gJpuAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAFXSURBVHjaYvzPgAD/UNlYEUAAkuTgCAAIBgJggq5VoAs1qM0vdzmMz362vezjokxPGimkEQ5WoAQEKuK71zwCCKyB4c//J8+BShn+/vv/+w/D399AEox+//8FJH/9/wUU+cUoKw20ASCAWBhEDf/LyDOw84BU//kDtgGI/oARmAHRDJQSFwVqAAggxo8fP/Ly8oKc9P8/AxjiAoyMjA8ePAAIIJZ///5BVIM0MOBWDpRlZPzz5w9AALH8gyvCbz7QBrCJAAHEyKDYX15r/+j1199//v35++/Xn7+///77DST/wMl/f4Dk378K4jx7O2cABBALw7NP77/+ev3xB0gOpOHfr99AdX9/gTVASKCGP//+8XCyMjC8AwggFoZfIHWSwpwQk4CW/AYjsKlA8u+ff////v33998/YPgBnQQQQIzAaGNg+AVGf5AYf5BE/oCjGEIyAQQYAGvKZ4C6+xXRAAAAAElFTkSuQmCC' });
            //languages.push({ key: 'de', name: 'Deutsch', img: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAALCAIAAAD5gJpuAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAGzSURBVHjaYvTxcWb4+53h3z8GZpZff/79+v3n/7/fDAz/GHAAgABi+f37e3FxOZD1Dwz+/v3z9y+E/AMFv3//+Qumfv9et241QACxMDExAVWfOHkJJAEW/gUEP0EQDn78+AHE/gFOQJUAAcQiy8Ag8O+fLFj1n1+/QDp+/gQioK7fP378+vkDqOH39x9A/RJ/gE5lAAhAYhzcAACCQBDkgRXRjP034R0IaDTZTFZn0DItot37S94KLOINerEcI7aKHAHE8v/3r/9//zIA1f36/R+o4tevf1ANYNVA9P07RD9IJQMDQACxADHD3z8Ig4GMHz+AqqHagKp//fwLVA0U//v7LwMDQACx/LZiYFD7/5/53/+///79BqK/EMZ/UPACSYa/v/8DyX9A0oTxx2EGgABi+a/H8F/m339BoCoQ+g8kgRaCQvgPJJiBYmAuw39hxn+uDAABxMLwi+E/0PusRkwMvxhBGoDkH4b/v/+D2EDyz///QB1/QLb8+sP0lQEggFh+vGXYM2/SP6A2Zoaf30Ex/J+PgekHwz9gQDAz/P0FYrAyMfz7wcDAzPDtFwNAgAEAd3SIyRitX1gAAAAASUVORK5CYII=' });
            $languagesProvider.setLanguages(languages);
        })
        .config($uibTooltipProvider => {
            $uibTooltipProvider.options({
                appendToBody: true
            });
        })
        .filter('titleCase', () => {
            return (input) => {
                input = input || '';
                return input.replace(/\w\S*/g, (txt) => {
                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                });
            };
        })
        .controller('appCtrl', AppCtrl)
        .controller('CsvSettingsModalCtrl', ModalCtrls.CsvSettingsModalCtrl)
        .controller('TableViewModalCtrl', ModalCtrls.TableViewModalCtrl)
        .controller('CreateProjectModalCtrl', ModalCtrls.CreateProjectModalCtrl)
        .controller('ChooseLayerModalCtrl', ModalCtrls.ChooseLayerModalCtrl);
}
