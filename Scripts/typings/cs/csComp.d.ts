/// <reference path="../crossfilter/crossfilter.d.ts" />
/// <reference path="../leaflet/leaflet.d.ts" />
declare module csComp.Services {
    class Widget {
        content: Function;
        constructor();
    }
    class WidgetStyle {
        background: string;
        borderWidth: string;
        borderColor: string;
        borderRadius: string;
        opacity: number;
        disableIfLeftPanel: boolean;
        shadow: boolean;
    }
    interface IWidgetCtrl {
        startEdit: Function;
        getOptions?: Function;
        goFullscreen?: Function;
    }
    interface IWidget {
        /**
         * name of the directive that should be used as widget
         */
        directive?: string;
        /**
         * json object that can hold parameters for the directive
         */
        data?: Object;
        /**
         * if defined it will find a widget with this id and copy it data (usefull if you want to reuse the data on multiple dashboards)
         * @type {string}
         */
        datasource?: string;
        /**
         * url of the html page that should be used as widget
         */
        url?: string;
        /**
         * name of the template that should be shown as widget
         */
        template?: string;
        /** default on dashboard, other options: rightpanel */
        position?: string;
        /**
         * title of the widget
         */
        title?: string;
        elementId?: string;
        enabled?: boolean;
        style?: string;
        customStyle?: WidgetStyle;
        effectiveStyle?: WidgetStyle;
        description?: string;
        parentDashboard?: csComp.Services.Dashboard;
        renderer?: Function;
        resize?: Function;
        init?: Function;
        start?: Function;
        stop?: Function;
        left?: string;
        right?: string;
        top?: string;
        bottom?: string;
        padding?: string;
        icon?: string;
        /** When true, hide the widget. */
        hideIfLeftPanel?: boolean;
        name?: string;
        id: string;
        timeDependent?: boolean;
        properties?: {};
        dataSets?: DataSet[];
        range?: csComp.Services.DateRange;
        updateDateRange?: Function;
        collapse?: boolean;
        canCollapse?: boolean;
        width?: string;
        height?: string;
        minWidth?: string;
        minHeight?: string;
        allowFullscreen?: boolean;
        hover?: boolean;
        messageBusService?: csComp.Services.MessageBusService;
        layerService?: csComp.Services.LayerService;
        _options?: any;
        _ctrl?: IWidgetCtrl;
        _ijs?: any;
        _initialized?: boolean;
        _interaction?: boolean;
        _isMoving?: boolean;
        _width?: string;
        _height?: string;
        _left?: string;
        _top?: string;
        _bottom?: string;
        _right?: string;
        _zindex?: string;
        _isFullscreen?: boolean;
    }
    class BaseWidget implements IWidget {
        directive: string;
        title: string;
        data: {};
        url: string;
        elementId: string;
        parentDashboard: csComp.Services.Dashboard;
        enabled: boolean;
        style: string;
        customStyle: WidgetStyle;
        description: string;
        opacity: number;
        hideIfLeftPanel: boolean;
        icon: string;
        background: string;
        left: string;
        right: string;
        top: string;
        bottom: string;
        name: string;
        id: string;
        timeDependent: boolean;
        properties: {};
        dataSets: DataSet[];
        range: csComp.Services.DateRange;
        collapse: boolean;
        canCollapse: boolean;
        width: string;
        height: string;
        minWidth: string;
        minHeight: string;
        allowFullscreen: boolean;
        messageBusService: csComp.Services.MessageBusService;
        layerService: csComp.Services.LayerService;
        hover: boolean;
        effectiveStyle: WidgetStyle;
        /** default on dashboard, other options: rightpanel */
        position: string;
        _isFullscreen: boolean;
        _ctrl: IWidgetCtrl;
        _initialized: boolean;
        _interaction: boolean;
        _isMoving: boolean;
        _width: string;
        _height: string;
        _left: string;
        _top: string;
        _bottom: string;
        _right: string;
        _zindex: string;
        constructor(title?: string, type?: string);
        static serializeableData(w: IWidget): IWidget;
        static cloneWithout0(v: any): any;
        start(): void;
        init(): void;
        renderer: ($compile: any, $scope: any) => void;
        updateDateRange(r: csComp.Services.DateRange): void;
        resize: (status: string, width: number, height: number) => void;
    }
    class Dashboard {
        widgets: IWidget[];
        editMode: boolean;
        showMap: boolean;
        mapWidth: string;
        description: string;
        alignMapRight: boolean;
        mobile: boolean;
        showTimeline: boolean;
        draggable: boolean;
        resizable: boolean;
        showLeftmenu: boolean;
        showRightmenu: boolean;
        showLegend: boolean;
        showBackgroundImage: boolean;
        /** don't show hamburger menu for this dashboard */
        hideleftPanelToggle: boolean;
        background: string;
        backgroundimage: string;
        disabledFeatures: string[];
        showDateSelector: boolean;
        visiblelayers: string[];
        visibleLeftMenuItems: string[];
        baselayer: string;
        viewBounds: IBoundingBox;
        timeline: DateRange;
        /** this dashboards shows live data, needed for sensor apis */
        isLive: boolean;
        id: string;
        name: string;
        disabled: boolean;
        parents: string[];
        _initialized: boolean;
        /** set if a a fullscreen widget is active */
        _fullScreenWidget: IWidget;
        /** complete refresh page on activation */
        refreshPage: boolean;
        constructor();
        /**
         * Returns an object which contains all the data that must be serialized.
         */
        static serializeableData(d: Dashboard): Object;
        static deserialize(input: Dashboard, solution: Solution): Dashboard;
        static addNewWidget(widget: IWidget, dashboard: Dashboard, solution: Solution): IWidget;
    }
    class Timeline {
        id: string;
        timestamps: number[];
    }
    class TimedDataSet {
        timeline: Timeline;
        timedata: number[];
    }
    class DataSet {
        id: string;
        title: string;
        color: string;
        data: {
            [key: number]: number;
        };
        constructor(id?: string, title?: string);
    }
}

declare module csComp.Services {
    interface ISensorLinkResult {
        features: string[];
        timestamps: number[];
        kpis: {
            [sensor: string]: number[];
        };
        data: {
            [sensor: string]: number[][];
        };
        properties: string[];
        timeAggregation: string;
    }
    class SensorSet {
        id: string;
        title: string;
        type: string;
        propertyTypeKey: string;
        propertyType: IPropertyType;
        timestamps: number[];
        values: any[];
        activeValue: any;
        max: number;
        min: number;
        activeValueText(): string;
        addValue(date: number, value: any): void;
        /**
         * Serialize the project to a JSON string.
         */
        serialize(): string;
        /**
         * Returns an object which contains all the data that must be serialized.
         */
        static serializeableData(d: SensorSet): Object;
    }
    class DataSource {
        id: string;
        url: string;
        /** static, dynamic */
        type: string;
        title: string;
        sensors: {
            [key: string]: SensorSet;
        };
        static merge_sensor(s1: SensorSet, s2: SensorSet): SensorSet;
        /**
         * Returns an object which contains all the data that must be serialized.
         */
        static serializeableData(d: DataSource): Object;
        /**
         * Load JSON data.
         * @type {DataSource}
         *
         * @param $http {ng.IHttpService}
         * @param ds {DataSource}
         * @param callback {Function}
         */
        static LoadData($http: ng.IHttpService, ds: DataSource, callback: Function): void;
    }
}

declare module csComp.Services {
    class Section {
        properties: {
            [key: string]: csComp.Services.IPropertyType;
        };
    }
    class Log {
        /**
         * Timestamp, epoch ms
         */
        ts: number;
        /**
         * property
         */
        prop: string;
        value: any;
        user: string;
    }
    interface IGuiObject {
        /** When true, the feature is included on the map, as opposed to being removed by a filter. */
        included: boolean;
        /** when true, visible in bounding box (only calculated for layers that use partial bounding box updates) */
        insideBBOX: boolean;
        [key: string]: any;
    }
    interface IFeature {
        id?: string;
        index: number;
        layerId: string;
        layer: csComp.Services.ProjectLayer;
        type?: string;
        fType?: IFeatureType;
        geometry: IGeoJsonGeometry;
        properties?: IProperty;
        propertiesOld?: IProperty;
        isSelected?: boolean;
        htmlStyle?: string;
        featureTypeName?: string;
        effectiveStyle: IFeatureTypeStyle;
        _isInitialized?: boolean;
        lastUpdated: number;
        _gui: IGuiObject;
        sensors?: {
            [id: string]: any[];
        };
        logs?: {
            [id: string]: Log[];
        };
        timestamps: number[];
        /**
         * Temperal list of geometries used e.g. to move a point over time (bound to timestamps, same as sensors)
         */
        coordinates?: IGeoJsonGeometry[];
        languages?: {
            [key: string]: ILocalisedData;
        };
    }
    /**
     * A feature is a single object that is show on a map (e.g. point, polyline, etc)
     * Features are part of a layer and filtered and styled using group filters and styles
     *
     */
    class Feature implements IFeature {
        id: string;
        index: number;
        layerId: string;
        layer: ProjectLayer;
        type: string;
        geometry: IGeoJsonGeometry;
        properties: IProperty;
        propertiesOld: IProperty;
        isSelected: boolean;
        htmlStyle: string;
        featureTypeName: string;
        lastUpdated: number;
        _gui: IGuiObject;
        /** resolved feature type */
        fType: IFeatureType;
        /** calculated style, used for final rendering */
        effectiveStyle: IFeatureTypeStyle;
        _isInitialized: boolean;
        sensors: {
            [id: string]: any[];
        };
        timestamps: number[];
        coordinates: IGeoJsonGeometry[];
        logs: {
            [id: string]: Log[];
        };
        static serialize(f: IFeature): IFeature;
    }
    interface IProperty {
        [key: string]: any;
    }
    interface IGeoJsonGeometry {
        type: string;
        coordinates: any;
    }
    enum DrawingModeType {
        None = 0,
        Image = 1,
        Point = 2,
        Square = 3,
        Rectangle = 4,
        Line = 5,
        Circle = 6,
        Freehand = 7,
        Polyline = 8,
        Polygon = 9,
        MultiPolygon = 10,
    }
    enum featureFilterType {
        /** Turn filtering off */
        none = 0,
        /** Default for numbers: histogram */
        bar = 1,
        /** Default for text */
        text = 2,
    }
    interface ILocalisedData {
        name?: string;
        title?: string;
        description?: string;
        section?: string;
        options?: string[];
    }
    interface ILanguageData {
        [key: string]: ILocalisedData;
    }
    enum LayerActivationTypes {
        manual = 0,
        automatic = 1,
    }
    interface ILayerPropertyDetails {
        activation?: string;
        groupId?: string;
        defaultFeatureType?: string;
        defaultLegendProperty?: string;
        typeUrl?: string;
        dashboard?: string;
    }
    interface IPropertyType {
        id?: string;
        label?: string;
        title?: string;
        description?: string;
        type?: string;
        section?: string;
        stringFormat?: string;
        visibleInCallOut?: boolean;
        canEdit?: boolean;
        /** If set to false, don't show the statistical information (for numbers) */
        canShowStats?: boolean;
        /** Type of filter: none if you don't want to allow filtering */
        filterType?: string;
        /** Type of style: none if you don't want to allow styling */
        styleType?: string;
        isSearchable?: boolean;
        minValue?: number;
        maxValue?: number;
        /** always show in edit mode */
        alwaysEditable?: boolean;
        /** show image inline in featureprops callout */
        inlineImage?: boolean;
        defaultValue?: number;
        count?: number;
        calculation?: string;
        /** For a type 'relation', subject defines which property key to use for the search value (e.g, search for the feature's name
         * when the subject is 'Name'. When undefined, search for the feature id.
         */
        subject?: string;
        /** For a type 'relation', target defines in which property key the subject should be searched for. When undefined, search the feature id. */
        target?: string;
        /** For a type 'relation', targetlayers is an array of layer ID's that should be included in the search.
         * When undefined : search through the current layer.
         * When ['*']     : search through all (enabled) layers of the project
         */
        targetlayers?: string[];
        targetproperty?: string;
        options?: Object;
        categories?: string[];
        languages?: ILanguageData;
        legend?: Legend;
        legendType?: string;
        /** if defined, this sensor value will be removed. this can be usefull for sensor data that uses -1 or -999999 as empty sensor data */
        sensorNull?: Object;
        hideValue?: boolean;
        layerProps?: ILayerPropertyDetails;
        /** User defined minimum value */
        min?: number;
        /** User defined maximum value */
        max?: number;
        targetid?: string;
        /** Angular expression */
        expression?: string;
        isSensor?: boolean;
    }
    interface IPropertyTypeData {
        [key: string]: IPropertyType;
    }
    interface IFeatureTypeStyle {
        /** Default value is Name, i.e. the feature.properties.Name contains the title/name of the feature. */
        nameLabel?: string;
        /** Default marker type, e.g. default is a circle, other types include pin and bubble */
        marker?: string;
        /** The background fill color */
        fillColor?: string;
        /** The stroke/outline color */
        strokeColor?: string;
        /** The stroke/outline width */
        strokeWidth?: number;
        /** The background fill color when selected */
        selectedFillColor?: string;
        /** The stroke/outline color when selected */
        selectedStrokeColor?: string;
        /** The stroke/outline width when selected */
        selectedStrokeWidth?: number;
        /** Height of the property, e.g. when styling a property in Cesium */
        height?: number;
        opacity?: number;
        strokeOpacity?: number;
        fillOpacity?: number;
        /** Default true, draw an outline around the feature (sometimes, you wish to turn it off when dealing with a grid) */
        stroke?: boolean;
        drawingMode?: "Point" | "Line" | "Polygon" | "Image";
        /** The width of the icon on the map in pixels */
        iconWidth?: number;
        /** The height of the icon on the map in pixels */
        iconHeight?: number;
        /** The URL of the icon on the map */
        iconUri?: string;
        /** The property that specifies the height above the sea (in Cesium) */
        heightAboveSeaProperty?: string;
        /** The URL of the model on the map (for Cesium) */
        modelUri?: string;
        /** The name of the property that contains the model URI on the map (for Cesium) */
        modelUriProperty?: string;
        /** The scale of the model on the map (for Cesium) */
        modelScale?: number;
        /** The name of the property that contains the scale of the model (for Cesium, default 1) */
        modelScaleProperty?: string;
        /** The minimum pixel size of the model on the map (for Cesium, default 32) */
        modelMinimumPixelSize?: number;
        /** The name of the property that contains the minimum size of the model (for Cesium) */
        modelMinimumPixelSizeProperty?: string;
        /** The rounding of the icon's background */
        cornerRadius?: number;
        /** At what map resolution should we stop displaying the title. */
        maxTitleResolution?: string;
        /** When true, set the rotation of the icon, e.g. when simulating moving objects */
        rotate?: number;
        /** The property that specifies the rotation angle */
        rotateProperty?: string;
        /** The property that specifies the height (in Cesium) */
        heightProperty?: string;
        /** The property's text that should be displayed on top of the icon */
        innerTextProperty?: string;
        /** The size of the property's text on top of the icon */
        innerTextSize?: number;
        analysispropertyType?: any;
        /** Internal (private) property, indicating that the feature has been initialized (initFeatureType has been called) */
        _isInitialized?: boolean;
    }
    /**
     * Interface to specify the event properties, i.e. the begin and end time of an event,
     * the title and its description, and its location.
     */
    interface IEventStyleProperties {
        /** Name of the relation that contains the event data. */
        relationName: string;
        startTime: string;
        endTime: string;
        title: string;
        description: string;
        locationText: string;
    }
    interface IFeatureType {
        id?: string;
        name?: string;
        style?: IFeatureTypeStyle;
        legendItems?: LegendList.ILegendItem[];
        /** default property/properties used for legends */
        defaultLegendProperty?: string | string[];
        /** Optional expressions that are shown in the legend list. */
        legendExpr?: IPropertyType[];
        properties?: {};
        showAllProperties?: boolean;
        /** name of the property that contains a stringified L.GeoJSON object, which is shown when hovering above a feature */
        contourProperty?: string;
        /**
         * Optional list of propertyType keys, separated by semi-colons.
         * The keys can be resolved in the project's propertyTypeData dictionary, or in the local propertyTypeData.
         */
        propertyTypeKeys?: string;
        languages?: ILanguageData;
        eventStyle?: IEventStyleProperties;
        /** Action after selection, not set: open Feature Properties */
        selectActions?: string[];
        /** If true, specifies the properties to publish items on the timeline. */
        timelineConfig?: Timeline.ITimelineConfig;
        _propertyTypeData?: IPropertyType[];
        _expressions?: IPropertyType[];
        _isInitialized?: boolean;
        _resource?: ITypesResource;
    }
    interface IGeoJsonFile {
        featureTypes?: {
            [key: string]: IFeatureType;
        };
        type: string;
        features: Array<IFeature>;
    }
    interface IGeoJsonCollection {
        [key: string]: IGeoJsonFile;
    }
    interface PropertyInfo {
        max: number;
        min: number;
        count: number;
        mean: number;
        varience: number;
        sd: number;
        userMin?: number;
        userMax?: number;
    }
}

declare module csComp.Services {
    class Feed extends Feature {
        id: string;
    }
}

declare module csComp.Services {
    enum LayerType {
        GeoJson = 0,
        Kml = 1,
    }
    /** a project group contains a list of layers that can be grouped together.
     * Filters, styles can clustering is always defined on the group level.
     * If a filter is selected (e.g. show only the features within a certain property range)
     * this filter is applied to all layers within this group.
     * If clustering is enabled all features in all layers are grouped together
     */
    class ProjectGroup {
        id: string;
        title: string;
        description: string;
        layers: Array<ProjectLayer>;
        filters: Array<GroupFilter>;
        styles: Array<GroupStyle>;
        showTitle: boolean;
        _cluster: L.MarkerClusterGroup;
        _vectors: L.LayerGroup<L.ILayer>;
        /** Turn on the leaflet markercluster */
        clustering: boolean;
        /** If set, at this zoom level and below markers will not be clustered. This defaults to disabled */
        clusterLevel: number;
        /**
         * The maximum radius that a cluster will cover from the central marker (in pixels). Default 80.
         * Decreasing will make more smaller clusters. You can also use a function that accepts the current map
         * zoom and returns the maximum cluster radius in pixels. */
        maxClusterRadius: number;
        clusterFunction: Function;
        /** Creates radio buttons instead of checkboxes in the level */
        oneLayerActive: boolean;
        ndx: any;
        filterResult: IFeature[];
        markers: any;
        styleProperty: string;
        languages: ILanguageData;
        owsurl: string;
        owsgeojson: boolean;
        /**
         * gui is used for setting temp. properties for rendering
         */
        _gui: any;
        /**
         * Returns an object which contains all the data that must be serialized.
         */
        static serializeableData(projectGroup: ProjectGroup): Object;
        static deserialize(input: Object): ProjectGroup;
        loadLayersFromOWS($injector?: ng.auto.IInjectorService): void;
        private parseXML(xml);
        private buildLayer(baseurl, title, layerName);
    }
    /**
     * Filters are used to select a subset of features within a group.
     */
    class GroupFilter {
        id: string;
        title: string;
        enabled: boolean;
        filterType: string;
        property: string;
        property2: string;
        criteria: string;
        group: ProjectGroup;
        dimension: any;
        value: any;
        stringValue: string;
        rangex: number[];
        meta: IPropertyType;
        to: number;
        from: number;
        filterLabel: string;
        showInWidget: boolean;
    }
    /**
     * Styles determine how features are shown on the map.
     */
    class GroupStyle {
        id: string;
        title: string;
        enabled: boolean;
        layers: string[];
        visualAspect: string;
        property: string;
        colors: string[];
        group: ProjectGroup;
        availableAspects: string[];
        canSelectColor: boolean;
        colorScales: any;
        info: PropertyInfo;
        meta: IPropertyType;
        legends: {
            [key: string]: Legend;
        };
        activeLegend: Legend;
        fixedColorRange: boolean;
        constructor($translate: ng.translate.ITranslateService);
    }
    /**
     * the Legend class provides a data structure that is used to map a value to a color
     * (see also the function getColor())
    */
    class Legend {
        id: string;
        description: string;
        legendKind: string;
        visualAspect: string;
        legendEntries: LegendEntry[];
    }
    class LegendEntry {
        label: string;
        interval: {
            min: number;
            max: number;
        };
        value: number;
        stringValue: string;
        color: string;
    }
}

declare module csComp.Services {
    /** object describing a link to a dynamic sensor set from the server */
    interface ISensorLink {
        /** name of the property that will used to lookup the feature */
        linkid?: string;
        /** url to fetch the sensor data */
        url?: string;
        /** url to fetch layer kpi data */
        kpiUrl?: string;
        /** interval for live link (15m, 1h, 24h, etc) */
        liveInterval?: string;
        /** specify different interval for live KPI data (15m, 1h, 24h, etc) */
        liveIntervalKPI?: string;
        /** maximum timeline zoom level */
        zoomMaxTimeline?: number;
        /** minimum timeline zoom level */
        zoomMinTimeline?: number;
        /** actual interval in ms */
        actualInterval?: number;
        _outOfRange?: boolean;
        _requestReference?: any;
    }
    /** Interface of a project layer
     *  Note that this is a copy of the similarly named class, but the advantage is that I can use the
     *  interface definition also on the server side.
     *  TODO Check whether we need to keep the class definition.
     */
    interface IProjectLayer {
        /** Key of the propertyTypeData entry that provides a legend for this layer **/
        defaultLegendProperty?: string;
        /** Title as displayed in the menu */
        title: string;
        /** Number of features in the layer */
        count?: number;
        /** Description as displayed in the menu */
        description?: string;
        /** link to one or more meta description files containing  */
        typeUrl?: string | string[];
        /** link to url for dynamic sensor data */
        sensorLink?: ISensorLink;
        /** Type of layer, e.g. GeoJSON, TopoJSON, or WMS */
        type: string;
        /** render type */
        renderType?: string;
        /** Data source */
        url: string;
        /** Contains extended heatmap information (e.g. list of references to required sources, or weights) */
        heatmapSettings?: Heatmap.IHeatmapSettings;
        heatmapItems?: Heatmap.IHeatmapItem[];
        /** WMS sublayers that must be loaded */
        wmsLayers?: string;
        /** If enabled, load the layer */
        enabled?: boolean;
        /** Layer opacity */
        opacity?: number;
        /** When loading the data, the isLoading variable is true (e.g. used for the spinner control) */
        isLoading?: boolean;
        /** Indent the layer, so it seems to be a sublayer. */
        isSublayer?: boolean;
        mapLayer?: L.LayerGroup<L.ILayer>;
        /** Group of layers */
        group: ProjectGroup;
        /** proxy url, using own server, not implemented */
        useProxy?: boolean;
        /** force refresh on chaning bounding box */
        refreshBBOX?: boolean;
        /** indicates that this is a dynamic layer (dynamicgeojson) */
        isDynamic?: boolean;
        /** indicates that the contents layer of this layer can be changed */
        isEditable?: boolean;
        /** this layer contains sensor data, updated when focusTime changes */
        hasSensorData?: boolean;
        /**
         * indicates if a dynamic layer is connected
         */
        isConnected?: boolean;
        /**
         * When a log is used all property & geometry changes when saved are recorded in a log, this allows you to go back in time,
         * otherwise the complete feature with all its properties and geometry is overwritten
         */
        useLog?: boolean;
        /** indicates if features should be shown on timeline */
        showOnTimeline?: boolean;
        /** if the resourceType of the layer might change while the project is loaded, set dynamicResource to true to reload the
         * resourceType on every load */
        dynamicResource?: boolean;
        /** If true (default false), do not move the selected feature to the front of the SVG stack */
        disableMoveSelectionToFront: boolean;
        /** Default true, but if set to false, do not notify the timeline of changes. */
        timeAware: boolean;
        /** if true, use the current focustime to retrieve data from the server */
        timeDependent?: boolean;
        layerSource: ILayerSource;
        /**
         * Number of seconds between automatic layer refresh.
         * @type {number}
         */
        refreshTimer?: number;
        /**
         * When enabling the refresh timer, store the returned timer token so we can stop the timer later.
         * @type {number}
         */
        timerToken?: number;
        /**
        * A list of UNIX timestamp, or the UTC time in milliseconds since 1/1/1970, which define the time a sensor value
        * was taken. So in case we have 10 timestamps, each feature's sensor (key) in the feature's sensors dictionary should
        * also have a lnegth of 10.
        * Note that this value is optional, and can be omitted if the sensor already contains a timestamp too. This is mainly intended
        * when all 'sensor measurements' are taken on the same moment. For example, the CENSUS date.
        * In Excel, you can use the formula =24*(A4-$B$1)*3600*1000 to convert a date to a UNIX time stamp.
        */
        timestamps?: number[];
        /** Internal ID, e.g. for the Excel service */
        id?: string;
        /** Reference for URL params: if the URL contains layers=REFERENCE1;REFERENCE2, the two layers will be turned on.  */
        reference?: string;
        events?: Event[];
        /** Language information that can be used to localize the title and description */
        languages?: ILanguageData;
        /** layer original source */
        data?: any;
        cesiumDatasource?: any;
        items?: any;
        /** use a timestamp with each url request to make them unique (only tile layer for now, timestamp created after each refresh )*/
        disableCache?: boolean;
        /** key attached for identifying to */
        cacheKey?: string;
        /** handle for receiving server events */
        serverHandle?: MessageBusHandle;
        parentFeature: IFeature;
        /** list of tags describing this layer */
        tags?: string;
        /** key name of default feature type */
        defaultFeatureType?: string;
        /** image for this layer */
        image?: string;
        /** last updated time */
        updated?: number;
        /** zoom to layer if it gets activated */
        fitToMap?: boolean;
        /** If true, specifies the properties to publish items on the timeline. */
        timelineConfig?: Timeline.ITimelineConfig;
        /** if true, use local storage to save/retrieve layer data */
        localStorage?: boolean;
        /** if true, only update features within bounding box */
        partialBoundingBoxUpdates: boolean;
    }
    /** Layer information. a layer is described in a project file and is always part of a group */
    class ProjectLayer implements IProjectLayer {
        /** Key of the propertyTypeData entry that provides a legend for this layer **/
        defaultLegendProperty: string;
        /** Key of the legend entry (from resource -> legends) **/
        defaultLegend: string;
        /** Title as displayed in the menu */
        title: string;
        /** Number of features in the layer */
        count: number;
        /** Description as displayed in the menu */
        description: string;
        /** Source type of layer, e.g. GeoJSON (default), TopoJSON, or WMS TODO Refactor to sourceType */
        type: string;
        /** Specificies how the content should be rendered. Default same as 'type', but allows you to transform the source to e.g. geojson for easier rendering */
        renderType: string;
        /** Data source */
        url: string;
        /** Contains extended heatmap information (e.g. list of references to required sources, or weights) */
        heatmapSettings: Heatmap.IHeatmapSettings;
        heatmapItems: Heatmap.IHeatmapItem[];
        /** Contains hierarchy settings */
        hierarchySettings: FeatureRelations.IHierarchySettings;
        /** Links to the the (feature & property) type definitions in a separate file */
        typeUrl: string;
        /** link to url for dynamic sensor data */
        sensorLink: ISensorLink;
        /** WMS sublayers that must be loaded */
        wmsLayers: string;
        /** If enabled, load the layer */
        enabled: boolean;
        /** Layer opacity */
        opacity: number;
        /** When loading the data, the isLoading variable is true (e.g. used for the spinner control) */
        isLoading: boolean;
        /** Indent the layer, so it seems to be a sublayer. */
        isSublayer: boolean;
        mapLayer: L.LayerGroup<L.ILayer>;
        /** id of the group */
        groupId: string;
        /** Group of layers */
        group: ProjectGroup;
        /** proxy url, using own server, not implemented */
        useProxy: boolean;
        /** indicates if features should be shown on timeline */
        showOnTimeline: boolean;
        /** If true (default false), do not move the selected feature to the front of the SVG stack */
        disableMoveSelectionToFront: boolean;
        /** Default true, but if set to false, do not notify the timeline of changes. */
        timeAware: boolean;
        /** if true, use the current focustime to retrieve data from the server */
        timeDependent: boolean;
        /** time interval for unique time requests, in milliseconds */
        timeResolution: number;
        /** format timerequest e.g. YYYYmmDDHH */
        timeFormatString: string;
        /** if true, use the current bounding box to retreive data from the server */
        refreshBBOX: boolean;
        /** if the resourceType of the layer might change while the project is loaded, set dynamicResource to true to reload the resourceType on every load */
        dynamicResource: boolean;
        /** The current bounding box to retreive data from the server */
        BBOX: string;
        layerSource: ILayerSource;
        /**
         * Number of seconds between automatic layer refresh.
         * @type {number}
         */
        refreshTimeInterval: number;
        /**
         * When enabling the refresh timer, store the returned timer token so we can stop the timer later.
         * @type {number}
         */
        timerToken: any;
        /**
        * A list of UNIX timestamp, or the UTC time in milliseconds since 1/1/1970, which define the time a sensor value
        * was taken. So in case we have 10 timestamps, each feature's sensor (key) in the feature's sensors dictionary should
        * also have a lnegth of 10.
        * Note that this value is optional, and can be omitted if the sensor already contains a timestamp too. This is mainly intended
        * when all 'sensor measurements' are taken on the same moment. For example, the CENSUS date.
        * In Excel, you can use the formula =24*(A4-$B$1)*3600*1000 to convert a date to a UNIX time stamp.
        */
        timestamps: number[];
        kpiTimestamps: number[];
        /** Internal ID, e.g. for the Excel service */
        id: string;
        /** Reference for URL params: if the URL contains layers=REFERENCE1;REFERENCE2, the two layers will be turned on.  */
        reference: string;
        events: Event[];
        /** Language information that can be used to localize the title and description */
        languages: ILanguageData;
        /** layer specific sensors, can be used for kpis */
        sensors: {
            [id: string]: number[];
        };
        /** layer original source */
        data: any;
        /**
         * Object to hold any specific parameters for a certain type of data source.
         */
        dataSourceParameters: IProperty;
        cesiumDatasource: any;
        items: any;
        /** use a timestamp with each url request to make them unique (only tile layer for now, timestamp created after each refresh )*/
        disableCache: boolean;
        /** key attached for identifying to */
        cacheKey: string;
        /** handle for receiving server events */
        serverHandle: MessageBusHandle;
        /** Whether layer can be quickly updated instead of completely rerendered */
        quickRefresh: boolean;
        _lastSelectedFeature: IFeature;
        /** link to a parent feature, e.g. city layer references to a parent provence */
        parentFeature: IFeature;
        /** key name of default feature type */
        defaultFeatureType: string;
        /**  dynamic projects have a realtime connection with the server. This connection allows you to make changes to the feature & property types and
        feature geometry and property values. changes are distributed to all active clients in realtime */
        isDynamic: boolean;
        /** indicates that the contents layer of this layer can be changed */
        isEditable: boolean;
        /**
         * Logging mechanism allows you to specify specific property values and geometries in time,
         * it works the same way as sensor data but is optimized for smaller amounts of data and allows not only numbers
         * but also text, geometries, etc., where sensors are optimized for many different values, but only numbers
        */
        useLog: boolean;
        isConnected: boolean;
        /** this layer contains sensor data, updated when focusTime changes */
        hasSensorData: boolean;
        /**
         * gui is used for setting temp. values for rendering
         */
        _gui: any;
        /** image for this layer */
        image: string;
        /** list of tags describing this layer */
        tags: string;
        /** last updated time */
        updated: number;
        /** show notification on new feature */
        showFeatureNotifications: boolean;
        /** Change the map extent to fit the contents of the layer
         *  when it is activated
         */
        fitToMap: boolean;
        /**
         * Select a min and max zoom for the layer to be shown.
         * When the zoomlevel is out of range, hide all features using the opacity.
         */
        minZoom: number;
        maxZoom: number;
        /** handle for receiving zoom events */
        zoomHandle: MessageBusHandle;
        /** True when the layer features are transparent, e.g. when outside zoom range */
        isTransparent: boolean;
        /** if true, use local storage to save/retrieve layer data */
        localStorage: boolean;
        /** if true, only update features within bounding box */
        partialBoundingBoxUpdates: boolean;
        /** Get the features from the layer's original source, if present. */
        static getFeatures(layer: ProjectLayer): any;
        /**
         * Returns an object which contains all the data that must be serialized.
         */
        static serializeableData(pl: ProjectLayer): Object;
    }
    /**
     * Baselayers are background maps (e.g. openstreetmap, nokia here, etc).
     * They are described in the project file
     */
    interface IBaseLayer {
        id: string;
        title: string;
        isDefault: boolean;
        subtitle: string;
        preview: string;
        /** URL pointing to the basemap source. */
        url: string;
        /** Maximum zoom level */
        maxZoom: number;
        /** Minimum zoom level */
        minZoom: number;
        /**
         * Max native zoom level:
         * Maximum zoom number the tiles source has available.
         * If it is specified, the tiles on all zoom levels higher than maxNativeZoom will be loaded from maxZoom level and auto-scaled.
         */
        maxNativeZoom: number;
        /** URL pointing to an error-tile that should be shown when the actual tile cannot be loaded */
        errorTileUrl?: string;
        subdomains: string[];
        /** String that is shown on the map, attributing the source of the basemap */
        attribution: string;
        test: string;
        cesium_url?: string;
        cesium_tileUrl?: string;
        cesium_maptype?: string;
    }
    class BaseLayer implements IBaseLayer {
        id: string;
        title: string;
        isDefault: boolean;
        subtitle: string;
        preview: string;
        /** URL pointing to the basemap source. */
        url: string;
        /** Maximum zoom level */
        maxZoom: number;
        /** Minimum zoom level */
        minZoom: number;
        /**
         * Max native zoom level:
         * Maximum zoom number the tiles source has available.
         * If it is specified, the tiles on all zoom levels higher than maxNativeZoom will be loaded from maxZoom level and auto-scaled.
         */
        maxNativeZoom: number;
        /** URL pointing to an error-tile that should be shown when the actual tile cannot be loaded */
        errorTileUrl: string;
        subdomains: string[];
        /** String that is shown on the map, attributing the source of the basemap */
        attribution: string;
        test: string;
        /** Cesium specific URLs to retreive the tiles */
        cesium_url: string;
        cesium_maptype: string;
        /** Height tiles */
        cesium_tileUrl: string;
    }
}

declare module csComp.Services {
    var availableZoomLevels: {
        title: string;
        value: number;
    }[];
    interface IMapRenderer {
        title: string;
        init(service: LayerService): any;
        enable(baseLayer?: BaseLayer): any;
        disable(): any;
        addGroup(group: ProjectGroup): any;
        addLayer(layer: ProjectLayer): any;
        removeGroup(group: ProjectGroup): any;
        createFeature(feature: IFeature): any;
        removeFeature(feature: IFeature): any;
        updateFeature(feature: IFeature): any;
        selectFeature(feature: IFeature): any;
        addFeature(feature: IFeature): any;
        removeLayer(layer: ProjectLayer): any;
        updateMapFilter(group: ProjectGroup): any;
        changeBaseLayer(layer: BaseLayer): any;
        getZoom(): any;
        fitBounds(bounds: IBoundingBox): any;
        getExtent(): IBoundingBox;
        getLatLon(x: number, y: number): {
            lat: number;
            lon: number;
        };
        refreshLayer(): any;
    }
}

declare module csComp.Services {
    /**
    * Expert level for determining what options to show to the user.
    */
    enum Expertise {
        Beginner = 1,
        Intermediate = 2,
        Expert = 3,
        Admin = 4,
    }
    /**
    * Implement this interface to make your object serializable
    * @see http://stackoverflow.com/a/22886730/319711
    */
    interface ISerializable<T> {
        deserialize(input: Object, solution?: Solution): T;
    }
    class VisualState {
        leftPanelVisible: boolean;
        rightPanelVisible: boolean;
        dashboardVisible: boolean;
        mapVisible: boolean;
        mapWidth: string;
        alignMapRight: boolean;
        timelineVisible: boolean;
    }
    class DateRange {
        start: number;
        end: number;
        focus: number;
        fixedRange: string;
        range: number;
        zoomLevel: number;
        zoomLevelName: string;
        /** Set a maximum zoom interval for the visible range in milliseconds. It will not be possible to zoom out further than this maximum. Default value equals about 10000 years. */
        zoomMax: number;
        /** Set a minimum zoom interval for the visible range in milliseconds. It will not be possible to zoom in further than this minimum. */
        zoomMin: number;
        isLive: boolean;
        isExpanded: boolean;
        enableLive: boolean;
        enablePlay: boolean;
        enableEvents: boolean;
        enableFocus: boolean;
        expandHeight: number;
        updateDelay: number;
        ismoveable: boolean;
        static deserialize(input: DateRange): DateRange;
        /**
        * Set the focus time of the timeline, optionally including start and end time.
        */
        setFocus(d: Date, s?: Date, e?: Date): void;
        startDate: () => Date;
        focusDate: () => Date;
        endDate: () => Date;
    }
    /**
     * Represents to the overall solution class. A solution can contain multiple project.
     * This can be usefull when you want to have the same website, but with different content.
     * e.g. you could make it so that you can switch between different regions or different domains of interest.
     */
    class Solution {
        title: string;
        maxBounds: IBoundingBox;
        viewBounds: IBoundingBox;
        baselayers: IBaseLayer[];
        widgetStyles: {
            [key: string]: WidgetStyle;
        };
        projects: SolutionProject[];
    }
    /** Project within a solution file, refers to a project url*/
    class SolutionProject {
        id: string;
        title: string;
        url: string;
        dynamic: boolean;
    }
    /**
    * Simple class to hold the user privileges.
    */
    interface IPrivileges {
        mca: {
            expertMode: boolean;
        };
        heatmap: {
            expertMode: boolean;
        };
    }
    /** bouding box to specify a region. */
    interface IBoundingBox {
        /** Latitude = 0, Longitude = 1 */
        southWest: number[];
        /** Latitude = 0, Longitude = 1 */
        northEast: number[];
    }
    interface ITimelineOptions {
        width?: string;
        height?: string;
        eventMargin?: number;
        eventMarginAxis?: number;
        editable?: boolean;
        layout?: string;
        /** NOTE: For internal use only. Do not set it, as it will be overwritten by the $layerService.currentLocale. */
        locale?: string;
        timeLine?: DateRange;
    }
    enum authMethods {
        none = 0,
        local = 1,
        custom = 2,
    }
    interface Profile {
        authenticationMethod?: authMethods;
    }
    interface ISearchProvider {
        /** Name, is used to register the search provider, e.g. offline, bag, or bing */
        name: string;
        /** Optional address of the search end point */
        url?: string;
        /** Optional key */
        key?: string;
        /** Optional extra data */
        data?: any;
    }
    /** project configuration. */
    class Project implements ISerializable<Project> {
        id: string;
        title: string;
        description: string;
        logo: string;
        otpServer: string;
        storage: string;
        url: string;
        opacity: number;
        profile: Profile;
        /** true if a dynamic project and you want to subscribe to project changes using socket.io */
        isDynamic: boolean;
        activeDashboard: Dashboard;
        baselayers: IBaseLayer[];
        allFeatureTypes: {
            [id: string]: IFeatureType;
        };
        featureTypes: {
            [id: string]: IFeatureType;
        };
        propertyTypeData: {
            [id: string]: IPropertyType;
        };
        solution: Solution;
        groups: ProjectGroup[];
        mapFilterResult: L.Marker[];
        startposition: Coordinates;
        features: IFeature[];
        timeLine: DateRange;
        mcas: Mca.Models.Mca[];
        dashboards: Dashboard[];
        typeUrls: string[];
        datasources: DataSource[];
        dataSets: DataSet[];
        viewBounds: IBoundingBox;
        /** When true, show a scale at the bottom left */
        showScale: boolean;
        /** When true, show the latlng of the clicked location */
        showLocation: boolean;
        collapseAllLayers: boolean;
        /** if enabled a user can change mode (novice, intermediate, etc.), default = true */
        exportModeSelectionEnabled: boolean;
        userPrivileges: IPrivileges;
        languages: ILanguageData;
        /** link to layer directory, if empty do not use it */
        layerDirectory: string;
        expertMode: Expertise;
        markers: {};
        eventTab: boolean;
        /**
         * default interface language
         * @type {string}
         */
        preferedLanguage: string;
        /** List of search providers to use, e.g. bag, offline, bing */
        searchProviders: ISearchProvider[];
        /**
         * Serialize the project to a JSON string.
         */
        serialize(): string;
        static serializeFeatureType(ft: IFeatureType): Object;
        /**
         * Returns an object which contains all the data that must be serialized.
         */
        static serializeableData(project: Project): Object;
        deserialize(input: Project): Project;
    }
}

declare module csComp.Services {
    /** Class containing references to feature & property types */
    interface ITypesResource {
        id: string;
        url: string;
        title: string;
        featureTypes: {
            [id: string]: IFeatureType;
        };
        propertyTypeData: {
            [id: string]: IPropertyType;
        };
        legends: {
            [id: string]: Legend;
        };
        isDynamic: boolean;
    }
    /** Class containing references to feature & property types */
    class TypeResource implements ITypesResource {
        id: string;
        url: string;
        title: string;
        featureTypes: {
            [id: string]: IFeatureType;
        };
        propertyTypeData: {
            [id: string]: IPropertyType;
        };
        legends: {
            [id: string]: Legend;
        };
        isDynamic: boolean;
        /**
         * Serialize the project to a JSON string.
         */
        static serialize(resource: TypeResource): string;
    }
}

declare module ColorExt {
    /** Color utility class */
    class Utils {
        /**
         * HSV to RGB color conversion.
         *
         * HSV:
         * 		Hue (the actual color between 0 and 360 degrees),
         *   	Saturation between 0 (grey) and 100 (full color),
         *   	Value of Brightness between 0 (black) and 100 white.
         */
        static hsv2rgb(h: any, s: any, v: any): string;
        static toColor(val: number, min: number, max: number, primaryColorHue: number, secondaryColorHue: any): string;
        /**
         * Calculate the hue value from a hexadecimal RGB string. Return a value between 0 and 360 degrees
         * equation from: en.wikipedia.org/wiki/Hue#Computing_hue_from_RGB
         */
        static rgbToHue(rgb: string): number;
        /**
         * Convert an R, G and B combination to hexadecimal string (with preceding #)
         * @param  number[] rgb array
         * @return string  hex string
         */
        static rgbToHex(rgb: any): string;
        static colorNameToHex(color: any): any;
    }
}

declare module csComp.Helpers {
    interface IGenericPoint<T> {
        x: T;
        y: T;
    }
    /**
     * An (x,y) point
     */
    interface IPoint extends IGenericPoint<number> {
    }
    /**
     * A linked list of type T
     */
    interface ILinkedList<T> {
        head?: ILinkedList<T>;
        tail?: ILinkedList<T>;
        next?: ILinkedList<T>;
        prev?: ILinkedList<T>;
        p?: IGenericPoint<T>;
    }
    /**
     * A linked list of type T
     */
    interface ILinkedPointList extends ILinkedList<number> {
        closed?: boolean;
    }
    interface IDrawContour {
        (startX: number, startY: number, endX: number, endY: number, contourLevel: number, k: number): void;
    }
    /**
      * Implements CONREC.
      *
      * @param {function} drawContour function for drawing contour.  Defaults to a
      *                               custom "contour builder", which populates the
      *                               contourList property.
      */
    class Conrec {
        private h;
        private sh;
        private xh;
        private yh;
        private contours;
        /**
         * Create a new Conrec class, optionally specifying the function to use for drawing the contour line.
         * @param  {number} drawContour [description]
         * @return {[type]}             [description]
         */
        constructor(drawContour?: IDrawContour);
        /**
         * contour is a contouring subroutine for rectangularily spaced data
         *
         * It emits calls to a line drawing subroutine supplied by the user which
         * draws a contour map corresponding to real*4data on a randomly spaced
         * rectangular grid. The coordinates emitted are in the same units given in
         * the x() and y() arrays.
         *
         * Any number of contour levels may be specified but they must be in order of
         * increasing value.
         *
         *
         * @param {number[][]} d - matrix of data to contour
         * @param {number} ilb,iub,jlb,jub - index lower and upper bounds of data matrix,
         *                                 	 i in rows/latitude direction, j in columns/longitude direction
         *
         *             The following two, one dimensional arrays (x and y) contain
         *             the horizontal and vertical coordinates of each sample points.
         * @param {number[]} x  - data matrix column coordinates, e.g. latitude coordinates
         * @param {number[]} y  - data matrix row coordinates, e.g. longitude coordinates
         * @param {number} nc   - number of contour levels
         * @param {number[]} z  - contour levels in increasing order.
         * @param {number[]} noDataValue  - when one of the corners of the grid cell contains a noDataValue, that cell is skipped.
         */
        contour(d: number[][], ilb: number, iub: number, jlb: number, jub: number, x: number[], y: number[], nc: number, z: number[], noDataValue?: number): void;
        /**
         * drawContour - interface for implementing the user supplied method to
         * render the countours.
         *
         * Draws a line between the start and end coordinates.
         *
         * @param startX    - start coordinate for X
         * @param startY    - start coordinate for Y
         * @param endX      - end coordinate for X
         * @param endY      - end coordinate for Y
         * @param contourLevel - Contour level for line.
         */
        private drawContour(startX, startY, endX, endY, contourLevel, k);
        contourList: IContourList;
    }
    interface IContour extends Array<{
        x: number;
        y: number;
    }> {
        k: number;
        level: number;
    }
    interface IContourList extends Array<IContour> {
    }
}

interface Date {
    getJulian(): number;
    getGMST(): number;
    /**
     * Get date in YYYYMMDD format
     */
    yyyymmdd(): string;
}

declare module csComp.Helpers {
    interface IDictionary<T> {
        add(key: string, value: T): void;
        remove(key: string): void;
        containsKey(key: string): boolean;
        keys(): string[];
        clear(): void;
        count(): number;
        values(): Array<T>;
    }
    class Dictionary<T> implements IDictionary<T> {
        private theKeys;
        private theValues;
        constructor();
        initialize(init: {
            key: string;
            value: T;
        }[]): void;
        add(key: string, value: any): void;
        remove(key: string): void;
        clear(): void;
        count(): number;
        keys(): string[];
        values(): Array<T>;
        containsKey(key: string): boolean;
        toLookup(): IDictionary<T>;
    }
}

declare module esriJsonConverter {
    class esriJsonConverter {
        ringIsClockwise(ringToTest: any): boolean;
        esriCon: {};
        esriGeometryToGcGeometry(esriGeom: any): any;
        esriFeatureToGcFeature(esriFeature: any): any;
        toGeoJson(esriObject: any): any;
        /************************************************
         * GeoJSON to ESRI Rest Converter
         ************************************************/
        gCon: {};
        isCompatible(esriGeomType: any, gcGeomType: any): boolean;
        gcGeomTypeToEsriGeomInfo(gcType: any): {
            type: any;
            geomHolder: any;
        };
        gcPolygonCoordinatesToEsriPolygonCoordinates(gcCoords: any): any[];
        gcCoordinatesToEsriCoordinates(gcGeom: any): any;
        gcGeometryToEsriGeometry(gcGeom: any): any;
        gcFeatureToEsriFeature(gcFeature: any): any;
        toEsri(geoJsonObject: any): any;
    }
}

declare module csComp.Helpers {
    interface IGeoFeature {
        type: string;
        geometry: {
            type: string;
            coordinates: Array<number> | Array<Array<number>> | Array<Array<Array<number>>>;
        };
        properties: Object;
    }
    interface IGeoFeatureCollection {
        type: string;
        features: IGeoFeature[];
    }
    /**
    * A set of static geo tools
    * Source: http://www.csgnetwork.com/degreelenllavcalc.html
    */
    class GeoExtensions {
        static getFeatureBounds(feature: IFeature): L.LatLng[] | L.LatLngBounds;
        static getBoundingBox(data: any): any;
        /**
        * Convert topojson data to geojson data.
        */
        static convertTopoToGeoJson(data: any): any;
        static Rad2Deg: number;
        static deg2rad(degree: number): number;
        static rad2deg(rad: number): number;
        /** Get the approximate centroid of a polygon by averaging the coordinates of its vertices. */
        static getCentroid(arr: any): csComp.Services.IGeoJsonGeometry;
        /** Get the most northern coordinate of a polygon */
        static getNorthmostCoordinate(arr: any): csComp.Services.IGeoJsonGeometry;
        /** Get the most Eastern coordinate of a polygon */
        static getEastmostCoordinate(arr: any): csComp.Services.IGeoJsonGeometry;
        /**
         * Convert an array of RD (Rijksdriehoek) features to WGS84.
         * @param  {IFeature[]} rd [Array of features in RD]
         * @return {void} The function changes the passed parameter, returns nothing.  [void]
         * Source: http://home.solcon.nl/pvanmanen/Download/Transformatieformules.pdf, http://www.roelvanlisdonk.nl/?p=2950
         */
        static convertRDFeaturesToWGS84(rd: IFeature[]): void;
        static convertGeoJsonRDToWGS84(coord: number[]): void;
        /**
         * Convert RD (Rijksdriehoek) coordinates to WGS84.
         * @param  {number} x [RD X coordinate]
         * @param  {number} y [RD Y coordinate]
         * @return {[type]}   [object with latitude and longitude coordinate in WGS84]
         * Source: http://home.solcon.nl/pvanmanen/Download/Transformatieformules.pdf, http://www.roelvanlisdonk.nl/?p=2950
         */
        static convertRDToWGS84(x: number, y: number): {
            latitude: number;
            longitude: number;
        };
        /**
        * Calculate the log base 10 of val
        */
        static log10(val: any): number;
        static convertDegreesToMeters(latitudeDegrees: number): {
            latitudeLength: number;
            longitudeLength: number;
        };
        /**
         * Takes an array of LinearRings and optionally an {@link Object} with properties and returns a {@link Polygon} feature.
         *
         * @module turf/polygon
         * @category helper
         * @param {Array<Array<Number>>} rings an array of LinearRings
         * @param {Object=} properties a properties object
         * @returns {Feature<Polygon>} a Polygon feature
         * @throws {Error} throw an error if a LinearRing of the polygon has too few positions
         * or if a LinearRing of the Polygon does not have matching Positions at the
         * beginning & end.
         * @example
         * var polygon = createPolygon([[
         *  [-2.275543, 53.464547],
         *  [-2.275543, 53.489271],
         *  [-2.215118, 53.489271],
         *  [-2.215118, 53.464547],
         *  [-2.275543, 53.464547]
         * ]], { name: 'poly1', population: 400});
         *
         * @seealso https://github.com/Turfjs/turf-polygon/blob/master/index.js
         */
        static createPolygonFeature(coordinates: Array<Array<Array<number>>>, properties: Object): IGeoFeature;
        /**
         * Takes one or more {@link Feature|Features} and creates a {@link FeatureCollection}.
         *
         * @param {Feature[]} features input features
         * @returns {FeatureCollection} a FeatureCollection of input features
         * @example
         * var features = [
         *  turf.point([-75.343, 39.984], {name: 'Location A'}),
         *  turf.point([-75.833, 39.284], {name: 'Location B'}),
         *  turf.point([-75.534, 39.123], {name: 'Location C'})
         * ];
         *
         * var fc = turf.featurecollection(features);
         *
         * @seealso https://github.com/Turfjs/turf-featurecollection/blob/master/index.js
         */
        static createFeatureCollection(features: IGeoFeature[]): IGeoFeatureCollection;
        static createPointFeature(lon: number, lat: number, properties?: csComp.Services.IProperty, sensors?: csComp.Services.IProperty): IGeoFeature;
        static createLineFeature(coordinates: Array<Array<number>>, properties?: Object): IGeoFeature;
        static createPropertyType(name: string, section?: string): csComp.Services.IPropertyType;
        static convertMileToKm(miles: number): number;
        static convertKmToMile(km: number): number;
        static featureInsideBoundingBox(feature: IFeature, bboxarray: number[][]): boolean;
        /**
         * pointInsidePolygon returns true if a 2D point lies within a polygon of 2D points
         * @param  {number[]}   point   [lat, lng]
         * @param  {number[][]} polygon [[lat, lng], [lat,lng],...]
         * @return {boolean}            Inside == true
         */
        static pointInsidePolygon(point: number[], polygon: number[][][]): boolean;
        /**
         * pointInsideMultiPolygon returns true if a 2D point lies within a multipolygon
         * @param  {number[]}   point   [lat, lng]
         * @param  {number[][][]} polygon [[[lat, lng], [lat,lng]],...]]
         * @return {boolean}            Inside == true
         */
        static pointInsideMultiPolygon(point: number[], multipoly: number[][][][]): boolean;
        /** Convert a string representation of a bounding box to an LatLngBounds.  */
        static toBoundingBox(bb: string): L.LatLngBounds;
        /** Start slippy map computation */
        /** Convert longitude to tile coordinate. */
        private static lon2tile(lon, zoom);
        /** Convert latitude to tile coordinate. */
        private static lat2tile(lat, zoom);
        /**
         * Convert a bounding box to slippy tile coordinates.
         * Returns an object that specifies the top, bottom, left and right tiles, as well as its width and height.
         *
         * See http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#ECMAScript_.28JavaScript.2FActionScript.2C_etc..29
         */
        static slippyMapTiles(zoom: number, bbox: string | L.LatLngBounds): {
            top: number;
            bottom: number;
            left: number;
            right: number;
            width: number;
            height: number;
        };
    }
}

declare module csComp.Helpers {
    /**
     * Translate the object to the user's language.
     */
    function translateObject(obj: any, language: string, recursive?: boolean): any;
    /**
     * Serialize an array of type T to a JSON string, by calling the callback on each array element.
     */
    function serialize<T>(arr: Array<T>, callback: (T) => Object, skipTitlesOrIdStartingWithUnderscore?: boolean): Object[];
    function cloneWithoutUnderscore(v: any): any;
    /** get the name part of a featureid (strips resource uri part if needed) */
    function getFeatureTypeName(id: string): string;
    function getDefaultFeatureStyle(feature: csComp.Services.IFeature): csComp.Services.IFeatureTypeStyle;
    /**
     * Export data to the file system.
     */
    function saveData(data: string, filename: string, fileType: string): void;
    /**
     * Export image to the file system.
     */
    function saveImage(data: string, filename: string, fileType: string): void;
    /** Returns the next character. */
    function nextChar(c: any): any;
    function supportsDataUri(): boolean;
    function standardDeviation(values: number[]): {
        avg: number;
        stdDev: number;
    };
    function average(data: number[]): number;
    function getFeatureTitle(feature: IFeature): string;
    function featureTitle(type: csComp.Services.IFeatureType, feature: IFeature): string;
    /**
     * Collect all the property types that are referenced by a feature type.
     */
    function getPropertyTypes(type: csComp.Services.IFeatureType, propertyTypeData: csComp.Services.IPropertyTypeData, feature?: csComp.Services.IFeature): IPropertyType[];
    function getPropertyKey(keyString: string, property: string): string;
    function getPropertyType(feature: csComp.Services.IFeature, key: string): csComp.Services.IPropertyType;
    function getMissingPropertyTypes(feature: csComp.Services.IFeature): csComp.Services.IPropertyType[];
    /** find a unique key name in object */
    function findUniqueKey(o: Object, key: string): string;
    function addPropertyTypes(feature: csComp.Services.IFeature, featureType: csComp.Services.IFeatureType, resource: csComp.Services.TypeResource): csComp.Services.IFeatureType;
    function updateSection(layer: csComp.Services.ProjectLayer, prop: csComp.Services.IPropertyType): void;
    /**
     * In case we are dealing with a regular JSON file without type information, create a default type.
     */
    function createDefaultType(feature: csComp.Services.IFeature, resource: csComp.Services.TypeResource): csComp.Services.IFeatureType;
    /**
     * Convert a property value to a display value using the property info.
     */
    function convertPropertyInfo(pt: csComp.Services.IPropertyType, text: any): string;
    /**
    * Set the name of a feature.
    * @param {csComp.Services.IFeature} feature
    */
    function setFeatureName(feature: csComp.Services.IFeature, propertyTypeData?: csComp.Services.IPropertyTypeData): IFeature;
    /**
    * Convert a feature's stringFormat to a string.
    * @param {Services.IFeature} feature
    * @param {string} stringFormat
    */
    function convertStringFormat(feature: Services.IFeature, stringFormat: string): string;
    /**
    * Get all indexes of the 'find' substring in the 'source' string.
    * @param {string} source
    * @param {string} find
    */
    function indexes(source: string, find: string): number[];
    function getGuid(): string;
    function S4(): string;
    /**
     * Load the features as visible on the map, effectively creating a virtual
     * GeoJSON file that represents all visible items.
     * Also loads the keys into the featuretype's propertyTypeData collection.
     */
    function loadMapLayers(layerService: Services.LayerService): Services.IGeoJsonFile;
    /**
     * Helper function to create content for the RightPanelTab
     * @param  {string} container The container name
     * @param  {string} directive The directive of the container
     * @param  {any}    data      Panel data
     * @return {RightPanelTab}    Returns the RightPanelTab instance. Add it to the
     * rightpanel by publishing it on the MessageBus.
     */
    function createRightPanelTab(container: string, directive: string, data: any, title: string, popover?: string, icon?: string, replace?: boolean, canClose?: boolean): Services.RightPanelTab;
    /**
     * Helper function to parse a query of an url (e.g localhost:8080/api?a=1&b=2&c=3)
     */
    function parseUrlParameters(url: string, baseDelimiter: string, subDelimiter: string, valueDelimiter: string): {
        [key: string]: any;
    };
    /**
     * Helper function to parse a query of an url (e.g localhost:8080/api?a=1&b=2&c=3)
     */
    function joinUrlParameters(params: {
        [key: string]: any;
    }, baseDelimiter: string, subDelimiter: string, valueDelimiter: string): string;
    function createIconHtml(feature: IFeature, style?: csComp.Services.IFeatureTypeStyle): {
        html: string;
        iconPlusBorderWidth: number;
        iconPlusBorderHeight: number;
    };
}

declare module csComp.Helpers {
    class PieData {
        id: number;
        label: string;
        color: string;
        weight: number;
    }
    class AsterPieData extends PieData {
        score: number;
    }
    interface IHistogramOptions {
        id?: string;
        numberOfBins?: number;
        width?: number;
        height?: number;
        xLabel?: string;
        selectedValue?: number;
    }
    interface IMcaPlotOptions extends IHistogramOptions {
        /** Scoring function x,y points */
        xy?: {
            x: number[];
            y: number[];
        };
        /** Value of the feature, i.e. the point that we wish to highlight */
        featureValue?: number;
    }
    class Plot {
        static pieColors: string[];
        /**
         * Draw a histogram, and, if xy is specified, a line plot of x versus y (e.g. a scoring function).
         */
        static drawHistogram(values: number[], options?: IHistogramOptions): void;
        static getScale(stepSize: number, max: number): number;
        static drawMcaPlot(values: number[], options?: IMcaPlotOptions): void;
        /**
        * Draw a Pie chart.
        */
        static drawPie(pieRadius: number, data?: PieData[], parentId?: string, colorScale?: string, svgId?: string): void;
        /**
        * Draw an Aster Pie chart, i.e. a pie chart with varying radius depending on the score,
        * where the maximum score of 100 equals the pie radius.
        * See http://bl.ocks.org/bbest/2de0e25d4840c68f2db1
        */
        static drawAsterPlot(pieRadius: number, data?: AsterPieData[], parentId?: string, colorScale?: string, svgId?: string): void;
        private static clearSvg(svgId);
    }
}

declare module csComp.StringExt {
    function isNullOrEmpty(s: string): boolean;
    /**
     * String formatting
     * 'Added {0} by {1} to your collection'.f(title, artist)
     * 'Your balance is {0} USD'.f(77.7)
     */
    function format(s: string, ...args: string[]): string;
    function isDate(n: any): boolean;
    function isNumber(n: any): boolean;
    function isBoolean(s: any): boolean;
    function isArray(s: any): boolean;
    function isBbcode(s: any): boolean;
}

declare module StringFormat {
    /**
     * Module
     */
    var myModule: any;
}

interface String {
    score(text: string, fuzziness?: any): number;
}

declare module csComp.Helpers {
    /**
     * Either get the color from the string value by using the active legend, or else return
     * the current value (e.g. assuming that the current property contains a color).
     */
    function getColorFromStringValue(v: string, gs: csComp.Services.GroupStyle): string;
    function getImageUri(ft: csComp.Services.IFeatureType): string;
    function getColorFromStringLegend(v: string, l: csComp.Services.Legend, defaultcolor?: string): string;
    function getColorFromLegend(v: any, l: csComp.Services.Legend, defaultcolor?: string): any;
    function getColor(v: number, gs: csComp.Services.GroupStyle): any;
    /**
     * Extract a valid color string, without transparency.
     */
    function getColorString(color: string, defaultColor?: string): string;
}

declare module FSM {
    /**
     * Transition grouping to faciliate fluent api
     * @class Transitions<T>
     */
    class Transitions<T> {
        fsm: FiniteStateMachine<T>;
        constructor(fsm: FiniteStateMachine<T>);
        fromStates: T[];
        toStates: T[];
        /**
         * Specify the end state(s) of a transition function
         * @method to
         * @param ...states {T[]}
         */
        to(...states: T[]): TransitionFunctions<T>;
        toAny(states: any): void;
    }
    /**
     * Internal representation of a transition function
     * @class TransitionFunction<T>
     */
    class TransitionFunction<T> {
        fsm: FiniteStateMachine<T>;
        from: T;
        to: T;
        constructor(fsm: FiniteStateMachine<T>, from: T, to: T);
    }
    class TransitionFunctions<T> extends Array<TransitionFunction<T>> {
        private fsm;
        constructor(fsm: FiniteStateMachine<T>);
        on(trigger: number, callback?: (from: T, to: T) => any): void;
    }
    /***
     * A simple finite state machine implemented in TypeScript, the templated argument is meant to be used
     * with an enumeration.
     * @class FiniteStateMachine<T>
     */
    class FiniteStateMachine<T> {
        currentState: T;
        private _startState;
        private _transitionFunctions;
        private _onCallbacks;
        private _exitCallbacks;
        private _enterCallbacks;
        private _triggers;
        /**
         * @constructor
         * @param startState {T} Intial starting state
         */
        constructor(startState: T);
        addTransitions(fcn: Transitions<T>): TransitionFunctions<T>;
        addEvent(trigger: number, fromState: T, toState: T): void;
        trigger(trigger: number): void;
        /**
         * Listen for the transition to this state and fire the associated callback
         * @method on
         * @param state {T} State to listen to
         * @param callback {fcn} Callback to fire
         */
        on(state: T, callback: (from?: T, to?: T) => any): FiniteStateMachine<T>;
        /**
            * Listen for the transition to this state and fire the associated callback, returning
            * false in the callback will block the transition to this state.
            * @method on
            * @param state {T} State to listen to
            * @param callback {fcn} Callback to fire
            */
        onEnter(state: T, callback: (from?: T) => boolean): FiniteStateMachine<T>;
        /**
            * Listen for the transition to this state and fire the associated callback, returning
            * false in the callback will block the transition from this state.
            * @method on
            * @param state {T} State to listen to
            * @param callback {fcn} Callback to fire
            */
        onExit(state: T, callback: (to?: T) => boolean): FiniteStateMachine<T>;
        /**
            * Declares the start state(s) of a transition function, must be followed with a '.to(...endStates)'
            * @method from
            * @param ...states {T[]}
            */
        from(...states: T[]): Transitions<T>;
        fromAny(states: any): Transitions<T>;
        private _validTransition(from, to);
        /**
          * Check whether a transition to a new state is valide
          * @method canGo
          * @param state {T}
          */
        canGo(state: T): boolean;
        /**
          * Transition to another valid state
          * @method go
          * @param state {T}
          */
        go(state: T): void;
        /**
         * This method is availble for overridding for the sake of extensibility.
         * It is called in the event of a successful transition.
         * @method onTransition
         * @param from {T}
         * @param to {T}
         */
        onTransition(from: T, to: T): void;
        /**
         * Reset the finite state machine back to the start state, DO NOT USE THIS AS A SHORTCUT for a transition.
         * This is for starting the fsm from the beginning.
         * @method reset
         */
        reset(): void;
        private _transitionTo(state);
    }
}

declare module csComp {
    enum FileType {
        Js = 0,
        Css = 1,
    }
    class Utils {
        static loadedFiles: string[];
        static twoDigitStr(v: Number): string;
        /**
        * Load a JavaScript or CSS file dynamically by adding it to the end of the HEAD section in your document.
        * See also: http://www.javascriptkit.com/javatutors/loadjavascriptcss.shtml
        */
        static loadJsCssfile(filename: string, filetype: FileType, callback?: (evt: Event) => void): void;
    }
}

declare module LayersDirective {
    /**
      * Module
      */
    var myModule: any;
}

declare module Translations {
    class English {
        static locale: ng.translate.ITranslationTable;
    }
}

declare module Translations {
    class French {
        static locale: ng.translate.ITranslationTable;
    }
}

declare module Translations {
    class Dutch {
        static locale: ng.translate.ITranslationTable;
    }
}

declare module Accessibility {
    /**
      * Module
      */
    var myModule: any;
}

import IFeature = csComp.Services.IFeature;
import IPropertyType = csComp.Services.IPropertyType;
import IActionOption = csComp.Services.IActionOption;
declare module Accessibility {
    class AccessibilityModel implements csComp.Services.IActionService {
        private layerService;
        id: string;
        stop(): void;
        addFeature(feature: IFeature): void;
        removeFeature(feature: IFeature): void;
        selectFeature(feature: IFeature): void;
        getLayerActions(layer: csComp.Services.IProjectLayer): any;
        addLayer(layer: csComp.Services.IProjectLayer): void;
        removeLayer(layer: csComp.Services.IProjectLayer): void;
        getFeatureActions(feature: IFeature): IActionOption[];
        getFeatureHoverActions(feature: IFeature): IActionOption[];
        deselectFeature(feature: IFeature): void;
        updateFeature(feature: IFeature): void;
        showAccessibility(feature: IFeature, layerService: csComp.Services.LayerService): void;
        removeAccessibility(feature: IFeature, layerService: csComp.Services.LayerService): void;
        static planRoute(feature: IFeature, layerService: csComp.Services.LayerService, destinationKey: string): void;
        planRouteFrom(feature: IFeature, layerService: csComp.Services.LayerService): void;
        planRouteTo(feature: IFeature, layerService: csComp.Services.LayerService): void;
        init(layerService: csComp.Services.LayerService): void;
    }
    interface IAccessibilityScope extends ng.IScope {
        vm: AccessibilityCtrl;
    }
    interface IOtpUrlParameters {
        [key: string]: any;
    }
    class AccessibilityCtrl {
        private $scope;
        private $http;
        private $mapService;
        private $layerService;
        private $messageBusService;
        private $dashboardService;
        private scope;
        layer: csComp.Services.ProjectLayer;
        private urlAddress;
        private urlParameters;
        private transportModes;
        private transportMode;
        private walkSpeedKm;
        private bikeSpeedKm;
        private time;
        private cutoffTimes;
        urlKeys: string[];
        static $inject: string[];
        constructor($scope: IAccessibilityScope, $http: ng.IHttpService, $mapService: csComp.Services.MapService, $layerService: csComp.Services.LayerService, $messageBusService: csComp.Services.MessageBusService, $dashboardService: csComp.Services.DashboardService);
        refreshAccessibility(): void;
        parseUrl(): void;
        private addCutoffTime();
        private removeCutoffTime(index);
    }
}

declare module BaseMapList {
    /**
      * Module
      */
    var myModule: any;
}

declare module BaseMapList {
    interface IBaseMapScope extends ng.IScope {
        vm: BaseMapListCtrl;
    }
    class BaseMapListCtrl {
        private $scope;
        private $layerService;
        private $mapService;
        private $messageBusService;
        private scope;
        static $inject: string[];
        constructor($scope: IBaseMapScope, $layerService: csComp.Services.LayerService, $mapService: csComp.Services.MapService, $messageBusService: csComp.Services.MessageBusService);
        selectBaseLayer(key: any): void;
    }
}

declare module Charts {
    /**
      * Module
      */
    var myModule: any;
    interface IBarchartScope extends ng.IScope {
        data: number[];
        update: boolean;
    }
}

declare var bullet: any;
declare module Charts {
    /**
      * Module
      */
    var myModule: any;
    interface IBulletchartScope extends ng.IScope {
        data: any;
        update: boolean;
        width: number;
        height: number;
        margin: number;
    }
}

declare module Charts {
    class ChartHelpers {
        /**
        * Returns the index and value of the maximum.
        */
        static max(arr: number[]): {
            maxIndex: number;
            max: number;
        };
        /**
        * Returns the index and value of the minimum.
        */
        static min(arr: number[]): {
            minIndex: number;
            min: number;
        };
        /**
        * Convert a timestamp to string.
        */
        static timestampToString(ts: number): any;
        static timestampToTimeString(ts: number): any;
        static windowResize(fun: any): void;
        static initializeMargin(scope: any, attrs: any): void;
        static getD3Selector(attrs: any, element: any): string;
        static initializeLegendMargin(scope: any, attrs: any): void;
        static defaultColor(): (d: any, i: any) => any;
        static configureLegend(chart: any, scope: any, attrs: any): void;
        static checkElementID(scope: any, attrs: any, element: any, chart: any, data: any): void;
        static updateDimensions(scope: any, attrs: any, element: any, chart: any): void;
    }
}

declare module Charts {
    /**
      * Module
      */
    var myModule: any;
    interface ICircularchartScope extends ng.IScope {
        value: number;
        min: number;
        max: number;
        update: boolean;
        color?: string;
        titleClass: string;
        title: string;
        valueString: string;
        valueClass: string;
        animationDuration: number;
        width?: number;
        height?: number;
        margin?: {
            top: number;
            right: number;
            bottom: number;
            left: number;
        };
    }
}

declare module Charts {
    /**
      * Module
      */
    var myModule: any;
    interface ISingleValueScope extends ng.IScope {
        value: number[];
    }
}

declare module Charts {
    /**
      * Module
      */
    var myModule: any;
    interface ISparklineScope extends ng.IScope {
        timestamps: number[];
        update: boolean;
        sensor: number[];
        property: string;
        width?: number;
        height?: number;
        closed?: boolean;
        smooth?: boolean;
        margin?: {
            top: number;
            right: number;
            bottom: number;
            left: number;
        };
        showaxis?: boolean;
    }
}

declare module Directives.Clock {
    /**
      * Module
      */
    var myModule: any;
}

declare module Helpers.ContextMenu {
    /**
      * Module
      */
    var myModule: any;
}

declare module DataTable {
    /**
      * Module
      */
    var myModule: any;
}

declare module DataTable {
    import IGeoJsonFile = csComp.Services.IGeoJsonFile;
    import IPropertyType = csComp.Services.IPropertyType;
    interface IDataTableViewScope extends ng.IScope {
        vm: DataTableCtrl;
    }
    /**
     * Represents a field in the table.
     * The value is the actual displayValue shown, the type is the propertyType type (e.g. number or text, useful when aligning the data), and the header is used for sorting.
     */
    class TableField {
        displayValue: string;
        originalValue: any;
        type: string;
        header: string;
        constructor(displayValue: string, originalValue: any, type: string, header: string);
    }
    class DataTableCtrl {
        private $scope;
        private $http;
        private $sce;
        private $translate;
        private $timeout;
        private $layerService;
        private $localStorageService;
        private $messageBusService;
        mapLabel: string;
        dataset: IGeoJsonFile;
        selectedType: csComp.Services.IFeatureType;
        numberOfItems: number;
        selectedLayerId: string;
        layerOptions: Array<any>;
        propertyTypes: Array<IPropertyType>;
        headers: Array<string>;
        sortingColumn: number;
        rows: Array<Array<TableField>>;
        private mapFeatureTitle;
        private selectAllText;
        private selectAllBool;
        static $inject: string[];
        constructor($scope: IDataTableViewScope, $http: ng.IHttpService, $sce: ng.ISCEService, $translate: ng.translate.ITranslateService, $timeout: ng.ITimeoutService, $layerService: csComp.Services.LayerService, $localStorageService: ng.localStorage.ILocalStorageService, $messageBusService: csComp.Services.MessageBusService);
        /**
         * Add a label to local storage and bind it to the scope.
         */
        private bindToStorage(label, defaultValue);
        /**
         * Create a list of layer options and select the one used previously.
         */
        private updateLayerOptions();
        private loadLayer();
        private processData(selectedLayer, data, callback);
        /**
         * Load the features as visible on the map.
         */
        private loadMapLayers();
        private addPropertyType(mis, nameLabel, ptd);
        private updatePropertyType(data, layer?);
        toggleSelection(propertyTypeTitle: string): void;
        private findLayerById(id);
        /**
         * Returns the data rows that are relevant for the current selection.
         */
        getRows(): Array<Array<TableField>>;
        /**
         * Generate a font awesome class based on the order.
         */
        sortOrderClass(headerIndex: number, reverseOrder: boolean): string;
        /**
         * Order the rows based on the header index and the order.
         */
        orderBy(headerIndex: number, reverseOrder: boolean): void;
        downloadGeoJson(): void;
        downloadCsv(): void;
        private selectAll();
        /**
         * Convert to trusted html string.
         */
        toTrusted(html: string): any;
    }
}

declare module EventTab {
    /**
      * Module
      */
    var myModule: any;
}

declare module EventTab {
    interface IEventTabScope extends ng.IScope {
        vm: EventTabCtrl;
        showMenu: boolean;
        title: string;
        icon: string;
    }
    class EventTabCtrl {
        private $scope;
        private $location;
        private $sce;
        private $mapService;
        private $layerService;
        private $messageBusService;
        private $translate;
        private scope;
        kanban: KanbanColumn.KanbanConfig;
        layer: csComp.Services.ProjectLayer;
        private debounceSendItems;
        private tlItems;
        private newItems;
        private tlGroups;
        static $inject: string[];
        constructor($scope: IEventTabScope, $location: ng.ILocationService, $sce: ng.ISCEService, $mapService: csComp.Services.MapService, $layerService: csComp.Services.LayerService, $messageBusService: csComp.Services.MessageBusService, $translate: ng.translate.ITranslateService);
        /**
         * Initialize an eventTab. Create a layer that contains all messages (features)
         */
        private init();
        reset(): void;
        private addUpdateEvent(f);
        /**
         * Add a card-item to the event list. Provide a feature, and optionally some property-keys of data you want to display.
         */
        private addEvent(data);
        private addTimelineItem(f);
        private mergeItems();
        private sendTimelineItems();
        private sendTimelineGroups();
        private zoomTo(data);
        /**
         * Callback function
         * @see {http://stackoverflow.com/questions/12756423/is-there-an-alias-for-this-in-typescript}
         * @see {http://stackoverflow.com/questions/20627138/typescript-this-scoping-issue-when-called-in-jquery-callback}
         * @todo {notice the strange syntax using a fat arrow =>, which is to preserve the this reference in a callback!}
         */
        private sidebarMessageReceived;
    }
}

declare module ExpertMode {
    /**
      * Module
      */
    var myModule: any;
}

declare module ExpertMode {
    import Expertise = csComp.Services.Expertise;
    interface IExpertModeScope extends ng.IScope {
        vm: ExpertModeCtrl;
        expertMode: Expertise;
        enabled: boolean;
    }
    class ExpertModeCtrl {
        private $scope;
        private $localStorageService;
        private $layerService;
        private $mapService;
        private $messageBus;
        static $inject: string[];
        constructor($scope: IExpertModeScope, $localStorageService: ng.localStorage.ILocalStorageService, $layerService: csComp.Services.LayerService, $mapService: csComp.Services.MapService, $messageBus: csComp.Services.MessageBusService);
        /**
        * Get the CSS class to render the mode.
        */
        getCssClass(): string;
        /**
        * Set the expert mode: although we assume that each directive is responsible for managing it by listening
        * to the expertMode.newExpertise message, we already set some common options here.
        * This is to reduce the dependency on this directive.
        */
        private setExpertMode(expertMode);
    }
}

declare module FeatureList {
    /**
      * Module
      */
    var myModule: any;
}

declare module FeatureList {
    interface IFeatureListScope extends ng.IScope {
        vm: FeatureListCtrl;
        numberOfItems: number;
    }
    class FeatureListCtrl {
        private $scope;
        private $layerService;
        private $mapService;
        private scope;
        static $inject: string[];
        constructor($scope: IFeatureListScope, $layerService: csComp.Services.LayerService, $mapService: csComp.Services.MapService);
    }
}

declare module FeatureProps {
    /**
      * Module
      */
    var myModule: any;
}

declare module FeatureProps {
    import IFeature = csComp.Services.IFeature;
    import IFeatureType = csComp.Services.IFeatureType;
    import IPropertyType = csComp.Services.IPropertyType;
    import IPropertyTypeData = csComp.Services.IPropertyTypeData;
    interface IFeaturePropsScope extends ng.IScope {
        vm: FeaturePropsCtrl;
        showMenu: boolean;
        feature: IFeature;
        callOut: CallOut;
        tabs: JQuery;
        tabScrollDelta: number;
        featureTabActivated(sectionTitle: string, section: CallOutSection): any;
        autocollapse(init: boolean): void;
    }
    interface ICorrelationResult {
        property: string;
        value: Object;
    }
    interface ICallOutProperty {
        _id: string;
        key: string;
        value: string;
        property: string;
        canFilter: boolean;
        canStyle: boolean;
        canShowStats: boolean;
        feature: IFeature;
        description?: string;
        propertyType?: IPropertyType;
        isFilter: boolean;
        showMore: boolean;
        showChart: boolean;
        stats: any;
        bins: any;
        cors: {
            [prop: string]: ICorrelationResult;
        };
    }
    class CallOutProperty implements ICallOutProperty {
        key: string;
        value: string;
        property: string;
        canFilter: boolean;
        canStyle: boolean;
        canShowStats: boolean;
        feature: IFeature;
        isFilter: boolean;
        isSensor: boolean;
        description: string;
        propertyType: IPropertyType;
        timestamps: number[];
        sensor: number[];
        isDraft: boolean;
        stats: any;
        bins: any;
        _id: string;
        showMore: boolean;
        showChart: boolean;
        cors: {
            [prop: string]: ICorrelationResult;
        };
        constructor(key: string, value: string, property: string, canFilter: boolean, canStyle: boolean, canShowStats: boolean, feature: IFeature, isFilter: boolean, isSensor: boolean, description?: string, propertyType?: IPropertyType, timestamps?: number[], sensor?: number[], isDraft?: boolean);
    }
    interface ICallOutSection {
        propertyTypes: {
            [label: string]: IPropertyType;
        };
        properties: Array<ICallOutProperty>;
        sectionIcon: string;
        addProperty(key: string, value: string, property: string, canFilter: boolean, canStyle: boolean, canShowStats: boolean, feature: IFeature, isFilter: boolean, description?: string, propertyType?: IPropertyType, isDraft?: boolean): void;
        hasProperties(): boolean;
    }
    class CallOutSection implements ICallOutSection {
        propertyTypes: {
            [label: string]: IPropertyType;
        };
        properties: Array<ICallOutProperty>;
        sectionIcon: string;
        constructor(sectionIcon?: string);
        showSectionIcon(): boolean;
        addProperty(key: string, value: string, property: string, canFilter: boolean, canStyle: boolean, canShowStats: boolean, feature: IFeature, isFilter: boolean, description?: string, propertyType?: IPropertyType, isDraft?: boolean): void;
        hasProperties(): boolean;
    }
    class CallOut {
        private type;
        private feature;
        private propertyTypeData;
        private layerservice;
        private mapservice;
        title: string;
        icon: string;
        sections: {
            [title: string]: ICallOutSection;
        };
        sectionKeys: string[];
        hasInfoSection: boolean;
        constructor(type: IFeatureType, feature: IFeature, propertyTypeData: IPropertyTypeData, layerservice: csComp.Services.LayerService, mapservice: csComp.Services.MapService);
        private addProperty(mi, feature, infoCallOutSection, linkCallOutSection, isDraft?);
        sectionCount(): number;
        firstSection(): ICallOutSection;
        lastSection(): ICallOutSection;
        private getOrCreateCallOutSection(sectionTitle);
        /**
         * Set the title of the callout to the title of the feature.
         */
        private setTitle();
        private setIcon(feature);
    }
    class FeaturePropsCtrl {
        private $scope;
        private $location;
        private $sce;
        private $mapService;
        private $layerService;
        private $messageBusService;
        private $translate;
        private $compile;
        private scope;
        lastSelectedProperty: IPropertyType;
        private defaultDropdownTitle;
        private showMore;
        private showChart;
        static $inject: string[];
        constructor($scope: IFeaturePropsScope, $location: ng.ILocationService, $sce: ng.ISCEService, $mapService: csComp.Services.MapService, $layerService: csComp.Services.LayerService, $messageBusService: csComp.Services.MessageBusService, $translate: ng.translate.ITranslateService, $compile: ng.ICompileService);
        updateAllStatsDelay: () => void;
        updateStatsDelay: (prop: any) => void;
        private updateAllStats();
        saveFeatureType(): void;
        savePropertyType(item: CallOutProperty): void;
        selectProperty(prop: IPropertyType, $event: ng.IAngularEvent): void;
        openImage(img: string): void;
        saveFeature(): void;
        startEditFeature(): void;
        editFeature(): void;
        setFilter(item: CallOutProperty, $event: ng.IAngularEvent): void;
        toTrusted(html: string): string;
        openLayer(property: FeatureProps.CallOutProperty): void;
        /**
         * Callback function
         * @see {http://stackoverflow.com/questions/12756423/is-there-an-alias-for-this-in-typescript}
         * @see {http://stackoverflow.com/questions/20627138/typescript-this-scoping-issue-when-called-in-jquery-callback}
         * @todo {notice the strange syntax using a fat arrow =>, which is to preserve the this reference in a callback!}
         */
        private sidebarMessageReceived;
        private featureMessageReceived;
        setCorrelation(item: ICallOutProperty, $event: ng.IAngularEvent): void;
        addSparkline(item: ICallOutProperty): void;
        createSparkLineChart(item: ICallOutProperty): void;
        getPropStats(item: ICallOutProperty): void;
        featureType: IFeatureType;
        private displayFeature(feature);
        removeFeature(): void;
        private updateHierarchyLinks(feature);
        showSensorData(property: ICallOutProperty): void;
        timestamps: {
            title: string;
            timestamp: number;
        }[];
        showSimpleTimeline: boolean;
        focusTime: string;
        setShowSimpleTimeline(): void;
        setTimestamps(): {
            title: string;
            timestamp: number;
        }[];
        zoomToDate(date: Date): void;
        selectFeature(feature: IFeature): void;
        setTime(time: {
            title: string;
            timestamp: number;
        }): void;
        getFormattedDate(fp: any, pt: IPropertyType): string;
        private setDropdownTitle();
    }
}

declare module FeatureRelations {
    /**
      * Module
      */
    var myModule: any;
}

declare module FeatureRelations {
    import IFeature = csComp.Services.IFeature;
    interface IFeatureRelationsScope extends ng.IScope {
        vm: FeatureRelationsCtrl;
        showMenu: boolean;
        poi: IFeature;
        title: string;
        icon: string;
    }
    interface IHierarchySettings {
        referenceList: string[];
    }
    class RelationGroup {
        title: string;
        id: string;
        property: csComp.Services.IPropertyType;
        relations: Relation[];
    }
    class Relation {
        title: string;
        icon: string;
        subject: csComp.Services.IFeature;
        target: csComp.Services.IFeature;
    }
    class FeatureRelationsCtrl {
        private $scope;
        private $location;
        private $sce;
        private $mapService;
        private $layerService;
        private $messageBusService;
        private $translate;
        private scope;
        relations: RelationGroup[];
        showRelations: boolean;
        title: string;
        static $inject: string[];
        selectRelation(relation: Relation): void;
        private createNearbyRelation(f);
        initRelations(): void;
        getRelations(): RelationGroup[];
        constructor($scope: IFeatureRelationsScope, $location: ng.ILocationService, $sce: ng.ISCEService, $mapService: csComp.Services.MapService, $layerService: csComp.Services.LayerService, $messageBusService: csComp.Services.MessageBusService, $translate: ng.translate.ITranslateService);
        /**
         * Callback function
         * @see {http://stackoverflow.com/questions/12756423/is-there-an-alias-for-this-in-typescript}
         * @see {http://stackoverflow.com/questions/20627138/typescript-this-scoping-issue-when-called-in-jquery-callback}
         * @todo {notice the strange syntax using a fat arrow =>, which is to preserve the this reference in a callback!}
         */
        private sidebarMessageReceived;
        private featureMessageReceived;
    }
}

declare module FilterList {
    /**
      * Module
      */
    var myModule: any;
}

declare module FilterList {
    interface IFilterListScope extends ng.IScope {
        vm: FilterListCtrl;
    }
    class FilterListCtrl {
        private $scope;
        private $layerService;
        private $messageBus;
        private scope;
        noFilters: boolean;
        locationFilterActive: boolean;
        static $inject: string[];
        constructor($scope: IFilterListScope, $layerService: csComp.Services.LayerService, $messageBus: csComp.Services.MessageBusService);
        private setLocationFilter(group);
    }
}

declare module Heatmap {
    /**
     * Module
     */
    var myModule: ng.IModule;
}

declare module Heatmap {
    import IFeature = csComp.Services.IFeature;
    interface IHeatmapScope extends ng.IScope {
        vm: HeatmapCtrl;
        ratingStates: any;
        projLayer: csComp.Services.ProjectLayer;
    }
    class HeatmapCtrl {
        private $scope;
        private $modal;
        private $translate;
        private $timeout;
        private $localStorageService;
        private $layerService;
        private $mapService;
        private messageBusService;
        private static confirmationMsg1;
        private static confirmationMsg2;
        heatmap: L.GeoJSON;
        heatmapModel: HeatmapModel;
        heatmapModels: HeatmapModel[];
        heatmapSettings: IHeatmapSettings;
        expertMode: boolean;
        moveListenerInitialized: boolean;
        projLayer: csComp.Services.ProjectLayer;
        selectedFeature: IFeature;
        properties: FeatureProps.CallOutProperty[];
        showFeature: boolean;
        showChart: boolean;
        featureIcon: string;
        static $inject: string[];
        constructor($scope: IHeatmapScope, $modal: any, $translate: ng.translate.ITranslateService, $timeout: ng.ITimeoutService, $localStorageService: ng.localStorage.ILocalStorageService, $layerService: csComp.Services.LayerService, $mapService: csComp.Services.MapService, messageBusService: csComp.Services.MessageBusService);
        updateAvailableHeatmaps(): void;
        createHeatmap(): void;
        editHeatmap(heatmap: HeatmapModel): void;
        exportHeatmap(heatmap: HeatmapModel): void;
        removeHeatmap(heatmap: HeatmapModel): void;
        private deleteHeatmap(heatmap);
        /**
         * Show the heat map editor in a modal.
         */
        private showHeatmapEditor(heatmap);
        private scopeApply();
        getVotingClass(hi: IHeatmapItem): string;
        weightUpdated(): void;
        intensityScaleUpdated(): void;
        resolutionUpdated(): void;
        private updateHeatmapWithoutRerendering();
        /**
         * Update the available pre-set heatmaps.
         */
        private updateHeatmap();
        private initializeHeatmap();
    }
}

declare module Heatmap {
    import IGeoJsonFile = csComp.Services.IGeoJsonFile;
    interface IHeatmapEditorScope extends ng.IScope {
        vm: HeatmapEditorCtrl;
    }
    class HeatmapEditorCtrl {
        private $scope;
        private $modalInstance;
        private $layerService;
        private $translate;
        private messageBusService;
        heatmap: HeatmapModel;
        /**
         * A virtual geojson file that represents all useable data for creating a heatmap.
         * @type {IGeoJsonFile}
         */
        dataset: IGeoJsonFile;
        scoringFunctions: ScoringFunction[];
        showItem: number;
        idealDistance: number;
        distanceMaxValue: number;
        lostInterestDistance: number;
        static $inject: string[];
        constructor($scope: IHeatmapEditorScope, $modalInstance: any, $layerService: csComp.Services.LayerService, $translate: ng.translate.ITranslateService, messageBusService: csComp.Services.MessageBusService, heatmap?: HeatmapModel);
        save(): void;
        cancel(): void;
        toggleItemDetails(index: number): void;
    }
}

declare module Heatmap {
    /**
    * A simple interface to describe an item that can be used in a heatmap.
    * We either accept a FeatureType (e.g. Hospital or Shop), or a property that
    * is of type options (e.g. shop, magazine).
    */
    interface IHeatmapItem {
        title: string;
        featureType: csComp.Services.IFeatureType;
        /**
         * In case we are not interested in the feature type itself, but in a certain property,
         * e.g. the property that determines what it represents like buildingFunction.
         * @type {string}
         */
        propertyTitle?: string;
        propertyLabel: string;
        /**
         * When we are using an options property type, such as buildingFunction, we need
         * to indicate the particular option that we will evaluate.
         * @type {number}
         */
        optionIndex?: number;
        /**
         * The user weight specifies how much you like this item, e.g. the maximum value.
         * @type {number}, range [-5..5].
         */
        userWeight: number;
        /**
         * The weight specifies how much you like this item, relative to others.
         * @type {number}, range [-1..1].
         */
        weight: number;
        /**
         * The ideality measure specifies how much you like this item with respect to its
         * distance.
         * @type {IIdealityMeasure}
         */
        idealityMeasure: IIdealityMeasure;
        isSelected?: boolean;
        reset(): void;
        setScale(latitude: number, longitude: number): void;
        calculateHeatspots(feature: csComp.Services.IFeature, cellWidth: number, cellHeight: number, horizCells: number, vertCells: number, mapBounds: L.LatLngBounds, paddingRatio: number): IHeatspot[];
    }
    class HeatmapItem implements IHeatmapItem {
        title: string;
        featureType: csComp.Services.IFeatureType;
        weight: number;
        userWeight: number;
        isSelected: boolean;
        idealityMeasure: IIdealityMeasure;
        propertyTitle: string;
        propertyLabel: string;
        optionIndex: number;
        /**
        * 1 meter represents meterToLatDegree degrees in vertical direction.
        */
        private static meterToLatDegree;
        /**
        * 1 meter represents meterToLonDegree degrees in horizontal direction.
        */
        private static meterToLonDegree;
        heatspots: IHeatspot[];
        private static twoPi;
        constructor(title: string, featureType: csComp.Services.IFeatureType, weight?: number, userWeight?: number, isSelected?: boolean, idealityMeasure?: IIdealityMeasure, propertyTitle?: string, propertyLabel?: string, optionIndex?: number);
        /**
         * Returns an object which contains all the data that must be serialized.
         */
        static serializeableData(i: HeatmapItem): Object;
        calculateHeatspots(feature: csComp.Services.Feature, cellWidth: number, cellHeight: number, horizCells: number, vertCells: number, mapBounds: L.LatLngBounds, paddingRatio: number): IHeatspot[];
        /**
        * Calculate the intensity around the location.
        * NOTE We are performing a relative computation around location (0,0) in a rectangular grid.
        */
        private calculateHeatspot(cellWidth, cellHeight);
        /**
        * Translate the heatspot (at (0,0)) to the actual location.
        */
        private pinHeatspotToGrid(feature, horizCells, vertCells, mapBounds, paddingRatio);
        /**
        * Set the scale to convert a 1x1 meter grid cell to the appropriate number of degrees
        * in vertical and horizontal direction.
        */
        setScale(latitude: number): void;
        select(): void;
        reset(): void;
        toString(): string;
    }
}

declare module Heatmap {
    interface IHeatmapModel {
        title: string;
        id: string;
        heatmapItems: IHeatmapItem[];
        heatmapSettings: IHeatmapSettings;
    }
    class HeatmapModel implements IHeatmapModel {
        title: string;
        heatmapItems: IHeatmapItem[];
        heatmapSettings: IHeatmapSettings;
        id: string;
        intensityGrid: csComp.Services.IProperty[][];
        contributorGrid: csComp.Services.IProperty[][];
        horizCells: number;
        vertCells: number;
        cellWidth: number;
        cellHeight: number;
        dLat: number;
        dLng: number;
        SW: L.LatLng;
        constructor(title: string);
        /**
         * Calculate the heatmap.
         */
        calculate(layerService: csComp.Services.LayerService, mapService: csComp.Services.MapService, heatmap: L.GeoJSON): void;
        drawIntensityGrid(heatmap: L.GeoJSON): void;
        /**
         * Update the weights of all heatmap items.
         */
        updateWeights(): void;
        /**
        * Add a heatmap item to the list of items only in case we don't have it yet.
        */
        addHeatmapItem(heatmapItem: IHeatmapItem): void;
        deserialize(layer: csComp.Services.ProjectLayer): void;
        serialize(): string;
    }
}

declare module Heatmap {
    /**
    * A simple interface to describe heatmapsettings.
    */
    interface IHeatmapSettings {
        referenceList: string[];
        intensityScale: number;
        minZoom: number;
        maxZoom: number;
        resolution: number;
        addReference(reference: string): void;
    }
    class HeatmapSettings implements IHeatmapSettings {
        referenceList: string[];
        minZoom: number;
        maxZoom: number;
        intensityScale: number;
        resolution: number;
        constructor(referenceList?: string[], minZoom?: number, maxZoom?: number, intensityScale?: number, resolution?: number);
        addReference(reference: string): void;
    }
}

declare module Heatmap {
    /**
     * A heat spot represents an lat-lon-point on the map with a certain intensity.
     */
    interface IHeatspot {
        i: number;
        j: number;
        intensity: number;
        contributor: string;
        AddLocation(i: any, j: any, contributor: any): IHeatspot;
    }
    /**
     * A heat spot represents a point on the map with a certain intensity.
     */
    class Heatspot implements IHeatspot {
        i: number;
        j: number;
        intensity: number;
        contributor: string;
        constructor(i: number, j: number, intensity: number, contributor?: string);
        AddLocation(i: any, j: any, contributor: any): Heatspot;
    }
}

declare module Heatmap {
    /**
     * The ideality measure specifies how much you like this item with respect to its
     * distance. For example, if I like a shop to be ideally at 200m of my house, it
     * also means that there is a zone around the shop with a radius of 200m where
     * I would ideally live.
     */
    interface IIdealityMeasure {
        /**
        * The distance with respect to my location where I would like to find the item.
        * @type {number}, in meters
        */
        idealDistance: number;
        /**
        * How happy would I be if the item would be at my location.
        * @type {number}, range [0..1]
        */
        atLocation: number;
        /**
         * At what distance would the item no longer be of value to me.
         * @type {number}, range in meters
         */
        lostInterestDistance: number;
        computeIdealityAtDistance(distance: number): number;
    }
    enum ScoringFunctionType {
        LinearAscendingDescending = 0,
    }
    class ScoringFunction {
        title: string;
        type: ScoringFunctionType;
        scores: string;
        cssClass: string;
        constructor(scoringFunctionType?: ScoringFunctionType);
    }
    class ScoringFunctions {
        static scoringFunctions: ScoringFunctions[];
    }
    class IdealityMeasure implements IIdealityMeasure {
        idealDistance: number;
        atLocation: number;
        lostInterestDistance: number;
        constructor(idealDistance?: number, atLocation?: number, lostInterestDistance?: number);
        computeIdealityAtDistance(distance: number): number;
    }
}

declare module IdvEdit {
    interface IIdvEditScope extends ng.IScope {
        vm: IdvEditCtrl;
    }
    /**
      * Module
      */
    var myModule: any;
    class IdvEditCtrl {
        private $scope;
        private $mapService;
        private $layerService;
        private $messageBusService;
        private scope;
        DataLoaded: boolean;
        eta: any;
        incomming: any;
        _initialized: boolean;
        scan: Idv.Idv;
        static $inject: string[];
        constructor($scope: IIdvEditScope, $mapService: csComp.Services.MapService, $layerService: csComp.Services.LayerService, $messageBusService: csComp.Services.MessageBusService);
        toggleChart(chart: Idv.ChartConfig): void;
        update(): void;
        reset(): void;
        export(): void;
    }
}

declare module Idv {
    interface ChartConfig {
        id?: string;
        enabled?: boolean;
        elementId?: string;
        containerId?: string;
        title?: string;
        bins?: number;
        type?: string;
        property?: string;
        properties?: string[];
        secondProperty?: string;
        dimension?: any;
        columns?: string[];
        group?: any;
        stat?: string;
        width?: number;
        height?: number;
        chart?: any;
        cap?: number;
        time?: string;
        ordering?: string;
        propertyTitle?: string;
        secondPropertyTitle?: string;
        record?: string;
        layer?: string;
        featureProperty?: string;
        featureTargetProperty?: string;
        filtered?: Function;
        _view: any;
        xaxis?: string;
        yaxis?: string;
        marginLeft?: number;
    }
    interface ScanConfig {
        title?: string;
        containerId?: string;
        config?: string;
        data?: string;
        localStorage?: boolean;
        refreshTimer?: number;
        charts?: ChartConfig[];
    }
    class Idv {
        static days_nl: string[];
        static days_en: string[];
        static months: string[];
        config: ScanConfig;
        ndx: CrossFilter.CrossFilter<any>;
        gridster: any;
        data: any;
        state: string;
        layerService: csComp.Services.LayerService;
        storage: ng.localStorage.ILocalStorageService;
        defaultWidth: number;
        DataLoaded: boolean;
        private scope;
        reduceAddSum(properties: string[]): (p: any, v: any) => any;
        reduceRemoveSum(properties: string[]): (p: any, v: any) => any;
        reduceInitSum(properties: string[]): {};
        reduceAddAvg(attr: any): (p: any, v: any) => any;
        reduceRemoveAvg(attr: any): (p: any, v: any) => any;
        reduceInitAvg(): {
            count: number;
            sum: number;
            avg: number;
            max: number;
        };
        stop(): void;
        updateCharts(): void;
        enums: {
            [key: string]: string[];
        };
        loadDataSource(done: Function): void;
        private resize();
        loadData(prepare: any, done: any): void;
        initCharts(scope: ng.IScope, layerService: csComp.Services.LayerService, prepare: any, done: any): void;
        parseData(data: any, prepare: any, done: any): void;
        reset(id: any): void;
        resetAll(): void;
        savePng(title: string, elementId: string): void;
        exportCsv(): void;
        hasFilter(id: any): boolean;
        private addSearchWidget(config);
        addSumCompare(config: Idv.ChartConfig): void;
        addLayerLink(config: Idv.ChartConfig): void;
        private addChartItem(config);
        private triggerFilter(config);
        private createGridsterItem(config);
        addChart(config: Idv.ChartConfig): void;
    }
}

declare module KanbanBoard {
    /**
      * Module
      */
    var myModule: any;
    interface IVisualType {
        id: string;
        title: string;
    }
    interface IKanbanBoardEditCtrl extends ng.IScope {
        vm: KanbanBoardEditCtrl;
        selectedColumn: KanbanColumn.Column;
        data: KanbanColumn.KanbanConfig;
    }
    class KanbanBoardEditCtrl {
        private $scope;
        private $timeout;
        private $compile;
        private $layerService;
        private $templateCache;
        $messageBus: csComp.Services.MessageBusService;
        private $mapService;
        private $dashboardService;
        private scope;
        private widget;
        private selectedIndicatorVisual;
        indicatorVisuals: {
            [key: string]: IVisualType;
        };
        private featureType;
        private propertyTypes;
        allLayers: csComp.Services.ProjectLayer[];
        layer: string;
        static $inject: string[];
        constructor($scope: IKanbanBoardEditCtrl, $timeout: ng.ITimeoutService, $compile: any, $layerService: csComp.Services.LayerService, $templateCache: any, $messageBus: csComp.Services.MessageBusService, $mapService: csComp.Services.MapService, $dashboardService: csComp.Services.DashboardService);
        selectColumn(): void;
        selectLayer(): void;
        colorUpdated(c: any, i: any): void;
    }
}

declare module KanbanColumn {
    /**
      * Module
      */
    var myModule: any;
}

declare module KanbanColumn {
    interface IKanbanBoardScope extends ng.IScope {
        vm: KanbanBoardCtrl;
    }
    class KanbanConfig {
        featureTypesToAdd: string[];
        columns: Column[];
        canAdd: boolean;
    }
    class KanbanBoardCtrl {
        private $scope;
        private $layerService;
        private $messageBus;
        private scope;
        feeds: csComp.Services.Feed[];
        layer: csComp.Services.ProjectLayer;
        featureTypes: {
            [key: string]: csComp.Services.IFeatureType;
        };
        kanban: KanbanColumn.KanbanConfig;
        static $inject: string[];
        addFeature(key: string): void;
        constructor($scope: IKanbanBoardScope, $layerService: csComp.Services.LayerService, $messageBus: csComp.Services.MessageBusService);
        private initLayer();
    }
}

declare module KanbanColumn {
    /**
      * Module
      */
    var myModule: any;
}

declare module KanbanColumn {
    interface IKanbanColumnScope extends ng.IScope {
        vm: KanbanColumnCtrl;
        column: Column;
        columnFilter: Function;
        columnOrderTitle: string;
        columnOrderBy: string;
        query: string;
        fields: any;
        layer: csComp.Services.ProjectLayer;
        /** In case the KanbanColumn should use a temporary layer instead of a project layer, this should be set
         *  to true and the layer should be passed through the scope variables. One example where this is used,
         *  is in the EventTab.
         */
        providedlayer: boolean;
    }
    class ColumnFilter {
        layerId: string;
        prio: number;
        roles: string[];
        tags: string[];
    }
    class Column {
        title: string;
        /** If true (default false), show the tags in the kanban card. */
        showFeatureTags: boolean;
        id: string;
        filters: ColumnFilter;
        propertyTags: string[];
        timeReference: string;
        roles: string[];
        fields: any;
        orderBy: string;
        actions: string[];
        canShare: boolean;
    }
    class KanbanColumnCtrl {
        private $scope;
        private $layerService;
        private $messageBus;
        private mapService;
        scope: IKanbanColumnScope;
        column: Column;
        static $inject: string[];
        sortOptions: any[];
        layer: csComp.Services.ProjectLayer;
        constructor($scope: IKanbanColumnScope, $layerService: csComp.Services.LayerService, $messageBus: csComp.Services.MessageBusService, mapService: csComp.Services.MapService);
        getClass(feature: csComp.Services.IFeature): string;
        clickPrio($event: any): void;
        createForm(feature: csComp.Services.IFeature): void;
        sendForm(feature: csComp.Services.IFeature): void;
        saveCategory(feature: csComp.Services.IFeature, property: string, value: string): void;
        updateTime(): void;
        toggleRole(feature: csComp.Services.IFeature, role: string): void;
        logFilter(feature: csComp.Services.IFeature): void;
        startAction(action: string, feature: csComp.Services.IFeature): void;
        getPrioColor(feature: csComp.Services.IFeature): any;
        setOrder(order: string): void;
        updateFeature(feature: csComp.Services.Feature): void;
        selectFeature(feature: csComp.Services.IFeature): void;
        editFeature(feature: csComp.Services.IFeature): void;
        searchFeature(feature: csComp.Services.IFeature): void;
        /** make sure all layers/feeds are loaded
        we only use the first one for now
         */
        initLayers(): void;
    }
}

declare module LanguageSwitch {
    /**
      * Module
      */
    var myModule: any;
}

declare module LanguageSwitch {
    interface ILanguageSwitchScope extends ng.IScope {
        vm: LanguageSwitchCtrl;
    }
    interface ILanguage {
        key: string;
        img: string;
        name: string;
    }
    class LanguageSwitchCtrl {
        private $scope;
        private $translate;
        private $languages;
        private $layerService;
        private $messageBus;
        private scope;
        language: ILanguage;
        static $inject: string[];
        constructor($scope: ILanguageSwitchScope, $translate: ng.translate.ITranslateService, $languages: ILanguage[], $layerService: csComp.Services.LayerService, $messageBus: csComp.Services.MessageBusService);
        switchLanguage(language: ILanguage): void;
    }
}

declare module LayersDirective {
    interface IAddLayerScope extends ng.IScope {
        vm: AddLayerCtrl;
    }
    class AddLayerCtrl {
        private $scope;
        private $http;
        private $modalInstance;
        layerService: csComp.Services.LayerService;
        private translate;
        private messageBusService;
        groupTitle: string;
        groupDescription: string;
        layerGroup: any;
        layerTitle: string;
        layers: csComp.Services.ProjectLayer[];
        selectedLayer: csComp.Services.ProjectLayer;
        static $inject: string[];
        project: csComp.Services.Project;
        constructor($scope: IAddLayerScope, $http: ng.IHttpService, $modalInstance: any, layerService: csComp.Services.LayerService, translate: ng.translate.ITranslateService, messageBusService: csComp.Services.MessageBusService);
        addGroup(): void;
        selectProjectLayer(layer: csComp.Services.ProjectLayer): void;
        addProjectLayer(): void;
        addLayer(): void;
        done(): void;
        cancel(): void;
    }
}

declare module LayersDirective {
    /**
      * Module
      */
    var myModule: any;
}

declare module LayersDirective {
    interface ILayersDirectiveScope extends ng.IScope {
        vm: LayersDirectiveCtrl;
        options: Function;
    }
    class LayersDirectiveCtrl {
        private $scope;
        private $layerService;
        private $messageBusService;
        private $mapService;
        private $dashboardService;
        private $modal;
        private $http;
        private scope;
        private allCollapsed;
        editing: boolean;
        state: string;
        layer: csComp.Services.ProjectLayer;
        resource: csComp.Services.TypeResource;
        project: csComp.Services.Project;
        directory: csComp.Services.ProjectLayer[];
        mylayers: string[];
        selectedFeatureType: csComp.Services.IFeatureType;
        newLayer: csComp.Services.ProjectLayer;
        layerResourceType: string;
        resources: {
            [key: string]: csComp.Services.TypeResource;
        };
        layerGroup: any;
        layerTitle: string;
        newGroup: string;
        groups: csComp.Services.ProjectGroup[];
        layerfilter: string;
        static $inject: string[];
        constructor($scope: ILayersDirectiveScope, $layerService: csComp.Services.LayerService, $messageBusService: csComp.Services.MessageBusService, $mapService: csComp.Services.MapService, $dashboardService: csComp.Services.DashboardService, $modal: any, $http: ng.IHttpService);
        dropLayer(layer: csComp.Services.ProjectLayer): void;
        editGroup(group: csComp.Services.ProjectGroup): void;
        layerSettings(layer: csComp.Services.ProjectLayer): void;
        /** add new type to a resource file */
        addNewType(): void;
        dropdownpos(event: any): void;
        deleteFeaturetype(featureType: csComp.Services.IFeatureType): void;
        /** start editing feature type */
        editFeaturetype(featureType: csComp.Services.IFeatureType): void;
        initGroups(): void;
        initDrag(key: string, layer: csComp.Services.ProjectLayer): void;
        selectProjectLayer(layer: csComp.Services.ProjectLayer): void;
        exitDirectory(): void;
        editLayer(layer: csComp.Services.ProjectLayer): void;
        stopEditingLayer(layer: csComp.Services.ProjectLayer): void;
        /** change layer opacity */
        updateLayerOpacity: (layer: csComp.Services.ProjectLayer) => void;
        setLayerOpacity(layer: csComp.Services.ProjectLayer): void;
        /** get a list of available layers from the server */
        loadAvailableLayers(): void;
        openDirectory(): void;
        /** get a list of resources for the forms */
        private initResources();
        /** go to create layer state */
        createLayer(): void;
        /** actually create new layer */
        createNewLayer(): void;
        /** toggle layer (use shift key to start editing) */
        toggleLayer(layer: csComp.Services.ProjectLayer, event: any): void;
        /** execute layer action */
        clickAction(o: IActionOption, layer: csComp.Services.ProjectLayer): void;
        /** triggered when layer was created, make a list of layer actions */
        openLayerMenu(event: any, layer: csComp.Services.ProjectLayer): void;
        collapseAll(): void;
        expandAll(): void;
        /** Hide groups whose title or id start with an underscore */
        private filterHiddenGroups(group);
    }
}

declare module Legend {
    /**
      * Module
      */
    var myModule: any;
}

declare module Legend {
    class LegendData {
        propertyTypeKey: string;
        mode: string;
    }
    interface ILegendDirectiveScope extends ng.IScope {
        vm: LegendCtrl;
        data: LegendData;
        legend: csComp.Services.Legend;
        activeStyleProperty: csComp.Services.IPropertyType;
        activeStyleGroup: csComp.Services.ProjectGroup;
    }
    class LegendCtrl {
        private $scope;
        private $layerService;
        private $messageBus;
        private scope;
        private widget;
        private passcount;
        private subscribeHandle;
        private parentWidget;
        static $inject: string[];
        constructor($scope: ILegendDirectiveScope, $layerService: csComp.Services.LayerService, $messageBus: csComp.Services.MessageBusService);
        createLegend(activeStyle?: csComp.Services.GroupStyle): csComp.Services.Legend;
        createLegendEntry(activeStyle: csComp.Services.GroupStyle, ptd: csComp.Services.IPropertyType, value: number): csComp.Services.LegendEntry;
        getStyle(legend: csComp.Services.Legend, le: csComp.Services.LegendEntry, key: number): {
            'float': string;
            'position': string;
            'top': string;
            'background': string;
            'border-left': string;
            'border-right': string;
        };
        toggleFilter(legend: csComp.Services.Legend, le: csComp.Services.LegendEntry): void;
    }
}

declare module LegendList {
    /**
      * Module
      */
    var myModule: any;
}

declare module LegendList {
    interface ILegendItem {
        title: string;
        uri: string;
        html: string;
        count?: number;
        expressions?: IPropertyType[];
        features?: IFeature[];
    }
    interface ILegendListScope extends ng.IScope {
        vm: LegendListCtrl;
        numberOfItems: number;
        legendItems: ILegendItem[];
    }
    class LegendListCtrl {
        private $scope;
        private $sce;
        private $timeout;
        private layerService;
        private mapService;
        private messageBusService;
        private expressionService;
        /** Active bounding box */
        private bbox;
        /** If true, the legend is visible in the DOM. */
        private isVisible;
        static $inject: string[];
        constructor($scope: ILegendListScope, $sce: ng.ISCEService, $timeout: ng.ITimeoutService, layerService: csComp.Services.LayerService, mapService: csComp.Services.MapService, messageBusService: csComp.Services.MessageBusService, expressionService: csComp.Services.ExpressionService);
        /**
         * Three approaches for creating a legend can be used:
         * 1. Using the featureTypes loaded in LayerService, which is quick, but also includes items that are not shown.
         *    Also, when deactivating the layer, items persist in the legendlist. Finally, items with an icon based on a property
         *    are only shown once (e.g., houses with energylabels).
         * 2. Second approach is to loop over all features on the map and select unique legend items. This is slower for large
         *    amounts of features, but the items in the legendlist are always complete and correct.
         * 3. Third approach is to use a legend that is defined in a featuretype. This is useful if you want to show a custom legend.
         * For 1. use 'updateLegendItemsUsingFeatureTypes()', for 2. use 'updateLegendItemsUsingFeatures(), for 3. use 'updateLegendStatically()'
         */
        private updateLegendItems();
        /**
         * Loops over every layer in the project. If a layer is enabled, has a typeUrl and a defaultFeatureType,
         * that corresponding featureType is acquired. When the featureType has a property 'legend' in which legenditems are defined,
         * these items are added to the legend.
         * Example definition in the FeatureType:
         * 'MyFeatureType' : {
         *   'legendItems' : [{
         *     'title' : 'My feature',
         *     'uri' : 'images/myicon.png'
         *   }]
         * }
         */
        private updateLegendStatically();
        private updateLegendItemsUsingFeatureTypes();
        private updateLegendItemsUsingFeatures();
        private getName(key, ft);
        toTrusted(html: string): string;
    }
}

declare module MapElement {
    /**
      * Module
      */
    var myModule: any;
}

declare module MapElement {
    interface IMapElementScope extends ng.IScope {
        vm: MapElementCtrl;
        mapid: string;
        initMap: Function;
    }
    class MapElementCtrl {
        private $scope;
        private $layerService;
        private mapService;
        private $messageBusService;
        private scope;
        private locale;
        options: string[];
        static $inject: string[];
        constructor($scope: IMapElementScope, $layerService: csComp.Services.LayerService, mapService: csComp.Services.MapService, $messageBusService: csComp.Services.MessageBusService);
        initMap(): void;
    }
}

declare module Mca.Models {
    import IFeature = csComp.Services.IFeature;
    enum ScoringFunctionType {
        Manual = 0,
        Ascending = 1,
        Descending = 2,
        AscendingSigmoid = 3,
        DescendingSigmoid = 4,
        GaussianPeak = 5,
        GaussianValley = 6,
    }
    /**
    * Scoring function creates a PLA of the scoring algorithm.
    */
    class ScoringFunction {
        title: string;
        type: ScoringFunctionType;
        scores: string;
        cssClass: string;
        constructor(scoringFunctionType?: ScoringFunctionType);
        /**
         * Create a score based on the type, in which x in [0,10] and y in [0.1].
         * Before applying it, you need to scale the x-axis based on your actual range.
         * Typically, you would map x=0 to the min(x)+0.1*range(x) and x(10)-0.1*range(x) to max(x),
         * i.e. x' = ax+b, where a=100/(8r) and b=-100(min+0.1r)/(8r) and r=max-min
         */
        static createScores(type: ScoringFunctionType): string;
    }
    class ScoringFunctions {
        static scoringFunctions: ScoringFunctions[];
    }
    class Criterion {
        title: string;
        description: string;
        /**
        * Top level label will be used to add a property to a feature, mca_LABELNAME, with the MCA value.
        * Lower level children will be used to obtain the property value.
        */
        label: string;
        /** Color of the pie chart */
        color: string;
        /** Specified weight by the user */
        userWeight: number;
        /** Derived weight based on the fact that the sum of weights in a group of criteria needs to be 1. */
        weight: number;
        /** Scoring function y = f(x), which translates a specified measurement x to a value y, where y in [0,1].
         * Format [x1,y1 x2,y2], and may contain special characters, such as min or max to define the minimum or maximum.
         */
        scores: string;
        criteria: Criterion[];
        /** Piece-wise linear approximation of the scoring function by a set of x and y points */
        isPlaUpdated: boolean;
        /** Piece-wise linear approximation must be scaled:x' = ax+b, where a=100/(8r) and b=-100(min+0.1r)/(8r) and r=max-min */
        isPlaScaled: boolean;
        minValue: number;
        maxValue: number;
        minCutoffValue: number;
        maxCutoffValue: number;
        _propValues: number[];
        _x: number[];
        _y: number[];
        deserialize(input: Criterion): Criterion;
        toJSON(): {};
        private requiresMinimum();
        private requiresMaximum();
        getTitle(): string;
        /**
         * Update the piecewise linear approximation (PLA) of the scoring (a.k.a. user) function,
         * which translates a property value to a MCA value in the range [0,1] using all features.
         * The 'force' parameter forces the PLA to be updated.
         */
        updatePla(features: IFeature[], force?: boolean): void;
        getScore(feature: IFeature): number;
    }
    class Mca extends Criterion implements csComp.Services.ISerializable<Mca> {
        id: string;
        /** Section of the callout */
        section: string;
        stringFormat: string;
        /** Optionally, export the result also as a rank */
        rankTitle: string;
        rankDescription: string;
        /** Optionally, stringFormat for the ranked result */
        rankFormat: string;
        /** Maximum number of star ratings to use to set the weight */
        userWeightMax: number;
        /** Applicable feature ids as a string[]. */
        featureIds: string[];
        scaleMaxValue: number;
        scaleMinValue: number;
        rankLabel: string;
        constructor(mca?: Models.Mca);
        deserialize(input: Mca): Mca;
        /**
        * Update the MCA by calculating the weights and setting the colors.
        */
        update(): void;
        private calculateWeights(criteria?);
        /** Set the colors of all criteria and sub-criteria */
        private setColors();
    }
}

declare module Mca {
    /**
     * Module
     */
    var myModule: ng.IModule;
}

declare module Mca {
    import IFeature = csComp.Services.IFeature;
    interface IMcaScope extends ng.IScope {
        vm: McaCtrl;
        ratingStates: any;
    }
    class McaCtrl {
        private $scope;
        private $uibModal;
        private $translate;
        private $timeout;
        private $localStorageService;
        private layerService;
        private messageBusService;
        private static mcaChartId;
        private static mcas;
        private static confirmationMsg1;
        private static confirmationMsg2;
        features: IFeature[];
        selectedFeature: IFeature;
        properties: FeatureProps.CallOutProperty[];
        showFeature: boolean;
        showChart: boolean;
        featureIcon: string;
        mca: Models.Mca;
        selectedCriterion: Models.Criterion;
        availableMcas: Models.Mca[];
        showAsterChart: boolean;
        showDialog: boolean;
        expertMode: boolean;
        showSparkline: boolean;
        private groupStyle;
        static $inject: string[];
        constructor($scope: IMcaScope, $uibModal: ng.ui.bootstrap.IModalService, $translate: ng.translate.ITranslateService, $timeout: ng.ITimeoutService, $localStorageService: ng.localStorage.ILocalStorageService, layerService: csComp.Services.LayerService, messageBusService: csComp.Services.MessageBusService);
        /** Save the MCA to the project, only if it is not already there. */
        private saveMcaToProject(saveMca);
        private getVotingClass(criterion);
        toggleMcaChartType(): void;
        toggleSparkline(): void;
        weightUpdated(criterion: Models.Criterion): void;
        updateMca(criterion?: Models.Criterion): void;
        editMca(mca: Models.Mca): void;
        createMca(): void;
        private showMcaEditor(newMca);
        removeMca(mca: Models.Mca): void;
        private getMcaIndex(mca);
        private saveMca(mca);
        private deleteMca(mca);
        private saveMcaToLocalStorage(mca);
        private deleteMcaFromLocalStorage(mca);
        featureMessageReceived: (title: string, feature: IFeature) => void;
        filtersMessageReceived: (title: string, groupId: string) => void;
        private scopeApply();
        updateSelectedFeature(feature: IFeature, drawCharts?: boolean): void;
        drawChart(criterion?: Models.Criterion): void;
        getTitle(criterion: Mca.Models.Criterion): string;
        private getParentOfSelectedCriterion(criterion?);
        private drawHistogram(criterion?);
        private drawAsterPlot(criterion?);
        private drawPieChart(criterion?);
        /**
        * Based on the currently loaded features, which MCA can we use
        */
        updateAvailableMcas(mca?: Models.Mca): void;
        calculateMca(): void;
        private applyPropertyInfoToCriteria(mca, featureType);
        private addPropertyInfo(featureId, mca, forceUpdate?);
        setStyle(item: FeatureProps.CallOutProperty): void;
        /**
         * Return the first MCA having an id equal to the mcaId parameter.
         */
        findMcaById(mcaId: string): Models.Mca;
        private static createPropertyType(mca);
        private static createRankPropertyType(mca);
    }
}

declare module Mca {
    import IFeatureType = csComp.Services.IFeatureType;
    import IGeoJsonFile = csComp.Services.IGeoJsonFile;
    interface IMcaEditorScope extends ng.IScope {
        vm: McaEditorCtrl;
    }
    interface IExtendedPropertyInfo extends csComp.Services.IPropertyType {
        isSelected?: boolean;
        category?: string;
        scores?: string;
        scoringFunctionType?: Models.ScoringFunctionType;
        /** The data is considered invalid when below this value */
        minCutoffValue?: number;
        /** The data is considered invalid when above this value */
        maxCutoffValue?: number;
        userWeight?: number;
    }
    class McaEditorCtrl {
        private $scope;
        private $uibModalInstance;
        private $layerService;
        private $translate;
        private messageBusService;
        private mca;
        dataset: IGeoJsonFile;
        propInfos: Array<IExtendedPropertyInfo>;
        headers: Array<string>;
        selectedFeatureType: IFeatureType;
        mcaTitle: string;
        rankTitle: string;
        scoringFunctions: Models.ScoringFunction[];
        showItem: number;
        scaleMax: number;
        scaleMin: number;
        static $inject: string[];
        constructor($scope: IMcaEditorScope, $uibModalInstance: ng.ui.bootstrap.IModalServiceInstance, $layerService: csComp.Services.LayerService, $translate: ng.translate.ITranslateService, messageBusService: csComp.Services.MessageBusService, mca?: Models.Mca);
        private updatePropertyInfoUponEdit(criterion, category?);
        loadPropertyTypes(): void;
        private selectFirstFeatureType();
        private updatePropertyInfo(featureType);
        toggleSelection(metaInfoTitle: string): void;
        isDisabled(): boolean;
        /**
         * Create a new MCA criterion
         */
        save(): void;
        cancel(): void;
        toggleItemDetails(index: number): void;
    }
}

declare module Mobile {
    /**
      * Module
      */
    var myModule: any;
}

declare module Mobile {
    interface IMobileScope extends ng.IScope {
        vm: MobileCtrl;
    }
    class MobileCtrl {
        private $scope;
        private $layerService;
        private $messageBus;
        private localStorageService;
        private geoService;
        private scope;
        private availableLayers;
        static $inject: string[];
        constructor($scope: IMobileScope, $layerService: csComp.Services.LayerService, $messageBus: csComp.Services.MessageBusService, localStorageService: ng.localStorage.ILocalStorageService, geoService: csComp.Services.GeoService);
    }
}

declare module Navigate {
    /**
      * Module
      */
    var myModule: any;
}

declare module Navigate {
    interface INavigateScope extends ng.IScope {
        vm: NavigateCtrl;
        search: string;
    }
    class RecentFeature {
        id: string;
        name: string;
        layerId: string;
        feature: csComp.Services.IFeature;
    }
    class NavigateCtrl {
        private $scope;
        private $layerService;
        private $messageBus;
        private localStorageService;
        private $dashboardService;
        private geoService;
        private scope;
        /** The layer that holds the search results. */
        private searchResultLayer;
        /** The group that holds the search results layer. */
        private searchResultGroup;
        RecentLayers: csComp.Services.ProjectLayer[];
        mobileLayers: csComp.Services.ProjectLayer[];
        mobileLayer: csComp.Services.ProjectLayer;
        RecentFeatures: RecentFeature[];
        UserName: string;
        MyFeature: csComp.Services.Feature;
        private lastPost;
        searchResults: csComp.Services.ISearchResultItem[];
        static $inject: string[];
        constructor($scope: INavigateScope, $layerService: csComp.Services.LayerService, $messageBus: csComp.Services.MessageBusService, localStorageService: ng.localStorage.ILocalStorageService, $dashboardService: csComp.Services.DashboardService, geoService: csComp.Services.GeoService);
        /** Create a new layer for the search results. Also create a group, if necessary, and a feature type for the search results. */
        private createSearchResultLayer();
        /** Remove the search results from the map. */
        private clearSearchLayer();
        /**
         * Update the displayed search results on the map, basically creating a feature from each search result (that has a
         * location and isn't a feature already).
         */
        private updateSearchLayer();
        /** Fit the search results, if any, to the map. */
        private fitMap(layer);
        selectFirstResult(): void;
        selectSearchResult(item: csComp.Services.ISearchResultItem): void;
        private doSearch(search);
        private leave(l);
        private join(l);
        private initMobileLayers(p);
        private updateRecentFeaturesList();
        private selectFeature(feature);
        private initRecentFeatures();
        toggleLayer(layer: csComp.Services.ProjectLayer): void;
        private initRecentLayers();
    }
}

declare module Search {
    class NavigateSteps {
    }
    class NavigateState {
        state: any;
    }
    interface INavigateProvider {
        title: string;
        url: string;
    }
}

declare module OfflineSearch {
    /**
      * Module
      */
    var myModule: any;
}

declare module OfflineSearch {
    interface IProjectLocation {
        title: string;
        url: string;
    }
    /**
     * The name of the property you include in generating the offline search result.
     */
    interface IPropertyType {
        /**
         * Name of the property
         * @type {string}
         */
        name: string;
        /**
         * The title of the property.
         * @type {string}
         */
        title: string;
        /**
         * Language information for localisation.
         * @type {f.ILanguageData}
         */
        languages?: csComp.Services.ILanguageData;
    }
    /**
     * Specify the offline search options.
     */
    interface IOfflineSearchOptions {
        /**
         * Words you wish to exclude from the index.
         * @type {string[]}
         */
        stopWords: string[];
        /**
         * The property types that you wish to use for generating the index.
         * @type {osr.PropertyType}
         */
        propertyTypes: IPropertyType[];
    }
    class Layer {
        groupTitle: string;
        index: number;
        id: string;
        title: string;
        path: string;
        type: string;
        /**
         * Names of all the features.
         * @type {string[]}
         */
        featureNames: string[];
        constructor(groupTitle: string, index: number, id: string, title: string, path: string, type: string);
    }
    /**
     * An index entry that contains a search result.
     */
    class Entry {
        private v;
        constructor(layerIndexOrArray: Array<number> | number, featureIndex?: number, propertyIndex?: number);
        layerIndex: number;
        featureIndex: number;
        /**
         * This function is called when serializing the Entry object to JSON, which is
         * much less verbose than the default JSON. In the constructor, I've used a
         * Union type to deserialize it again.
         */
        toJSON(): number[];
    }
    class KeywordIndex {
        [key: string]: Entry[];
    }
    class OfflineSearchResult {
        project: IProjectLocation;
        options: IOfflineSearchOptions;
        layers: Layer[];
        keywordIndex: KeywordIndex;
        constructor(project: IProjectLocation, options: IOfflineSearchOptions);
    }
}

declare module OfflineSearch {
    interface IOfflineSearchScope extends ng.IScope {
        vm: OfflineSearchCtrl;
    }
    interface ILookupResult {
        title?: string;
        score: number;
        key: string;
        entries: Entry[];
    }
    class OfflineSearchResultViewModel {
        title: string;
        layerTitle: string;
        groupTitle: string;
        entry: Entry;
        firstInGroup: boolean;
        constructor(title: string, layerTitle: string, groupTitle: string, entry: Entry);
        toString(): string;
        fullTitle: string;
    }
    class OfflineSearchCtrl {
        private $scope;
        private $http;
        private $layerService;
        private $mapService;
        private $messageBus;
        private offlineSearchResult;
        searchText: string;
        isReady: boolean;
        static $inject: string[];
        constructor($scope: IOfflineSearchScope, $http: ng.IHttpService, $layerService: csComp.Services.LayerService, $mapService: csComp.Services.MapService, $messageBus: csComp.Services.MessageBusService);
        /**
         * Load the offline search results (json file).
         */
        private loadSearchResults(url);
        /**
         * Get the locations based on the entered text.
         */
        getLocation(text: string, resultCount?: number): OfflineSearchResultViewModel[];
        /**
         * Merge the resuls of two keyword lookups by checking whether different entries refer
         * to the same layer and feature.
         * @result1 {ILookupResult[]}
         * @result2 {ILookupResult[]}
         */
        private mergeResults(result1, result2);
        /**
         * Do a fuzzy keyword comparison between the entered text and the list of keywords,
         * and return a subset.
         * @text: {string}
         */
        private getKeywordHits(text);
        /**
         * When an item is selected, optionally open the layer and jump to the selected feature.
         */
        onSelect(selectedItem: OfflineSearchResultViewModel): void;
        private selectFeature(layerId, featureIndex);
    }
}

declare module ProfileHeader {
    interface IProfileHeaderScope extends ng.IScope {
        vm: ProfileHeaderCtrl;
        enabled: boolean;
    }
    class ProfileHeaderCtrl {
        private $scope;
        private $localStorageService;
        private $layerService;
        private $mapService;
        private $messageBus;
        profileService: csComp.Services.ProfileService;
        static $inject: string[];
        startLogin(): void;
        logout(): void;
        constructor($scope: IProfileHeaderScope, $localStorageService: ng.localStorage.ILocalStorageService, $layerService: csComp.Services.LayerService, $mapService: csComp.Services.MapService, $messageBus: csComp.Services.MessageBusService, profileService: csComp.Services.ProfileService);
    }
    /**
      * Module
      */
    var myModule: any;
}

declare module ProfileTab {
    interface IProfileTabScope extends ng.IScope {
        vm: ProfileTabCtrl;
        enabled: boolean;
    }
    class ProfileTabCtrl {
        private $scope;
        private $localStorageService;
        private $layerService;
        private $mapService;
        private $messageBus;
        profileService: csComp.Services.ProfileService;
        static $inject: string[];
        userName: string;
        userPassword: string;
        startLogin(): void;
        validateUser(): void;
        logout(): void;
        constructor($scope: IProfileTabScope, $localStorageService: ng.localStorage.ILocalStorageService, $layerService: csComp.Services.LayerService, $mapService: csComp.Services.MapService, $messageBus: csComp.Services.MessageBusService, profileService: csComp.Services.ProfileService);
    }
    /**
      * Module
      */
    var myModule: any;
}

declare module ProjectHeaderSelection {
    /**
      * Module
      */
    var myModule: any;
}

declare module ProjectHeaderSelection {
    interface IProjectHeaderSelectionScope extends ng.IScope {
        vm: ProjectHeaderSelectionCtrl;
    }
    class ProjectHeaderSelectionCtrl {
        private $scope;
        $layerService: csComp.Services.LayerService;
        $dashboardService: csComp.Services.DashboardService;
        private $mapService;
        $messageBusService: csComp.Services.MessageBusService;
        scope: any;
        project: csComp.Services.SolutionProject;
        static $inject: string[];
        constructor($scope: any, $layerService: csComp.Services.LayerService, $dashboardService: csComp.Services.DashboardService, $mapService: csComp.Services.MapService, $messageBusService: csComp.Services.MessageBusService);
    }
}

declare module ProjectSettings {
    /**
      * Module
      */
    var myModule: any;
}

declare module ProjectSettings {
    interface IProjectSettingsScope extends ng.IScope {
        vm: ProjectSettingsCtrl;
    }
    class ProjectSettingsCtrl {
        private $scope;
        private $timeout;
        private $layerService;
        private dashboardService;
        private mapService;
        private messageBus;
        private $localStorageService;
        private scope;
        static $inject: string[];
        project: csComp.Services.Project;
        constructor($scope: IProjectSettingsScope, $timeout: ng.ITimeoutService, $layerService: csComp.Services.LayerService, dashboardService: csComp.Services.DashboardService, mapService: csComp.Services.MapService, messageBus: csComp.Services.MessageBusService, $localStorageService: ng.localStorage.ILocalStorageService);
        toggleTouchMode(): void;
        toggleRenderer(): void;
        toggleShowLocation(): void;
        toggleAdminMode(): void;
        saveSettings(): void;
        updateProject(): void;
        private updateProjectReady(data);
    }
}

declare module Helpers.Resize {
    /**
      * Module
      */
    var myModule: any;
}

declare module ShowModal {
    /**
      * Module
      */
    var myModule: any;
}

declare module StyleList {
    /**
      * Module
      */
    var myModule: any;
}

declare module StyleList {
    interface IStyleListScope extends ng.IScope {
        vm: StyleListCtrl;
    }
    class StyleListCtrl {
        private $scope;
        private $timeout;
        private $layerService;
        private messageBus;
        private scope;
        static $inject: string[];
        selectedGroup: csComp.Services.ProjectGroup;
        selectedSection: csComp.Services.Section;
        activeStyles: string[];
        constructor($scope: IStyleListScope, $timeout: ng.ITimeoutService, $layerService: csComp.Services.LayerService, messageBus: csComp.Services.MessageBusService);
        selectGroup(group: csComp.Services.ProjectGroup): void;
        selectSection(section: csComp.Services.Section): void;
        initWizard(): void;
        setStyle(g: csComp.Services.ProjectGroup, property: csComp.Services.IPropertyType): void;
        getStyle(legend: csComp.Services.Legend, le: csComp.Services.LegendEntry, key: number): {
            'float': string;
            'position': string;
            'top': string;
            'background': string;
        };
    }
}

declare module Timeline {
    interface ITimelineService {
        getTimelineOptions(): csComp.Services.ITimelineOptions;
        setTimelineOptions(options: csComp.Services.ITimelineOptions): void;
    }
    /**
      * Module
      */
    var myModule: any;
}

declare module Timeline {
    interface ITimelineScope extends ng.IScope {
        vm: TimelineCtrl;
        numberOfItems: number;
        timeline: any;
        datePickerOptions: any;
        datePickerDate: Date;
    }
    /** Interface for the timeline configuration, may be part of the {csComp.Services.IFeatureType} or {csComp.Services.IProjectLayer}. */
    interface ITimelineConfig {
        /** Group (row/lane) to use */
        group?: string;
        /** Property to use as the group (row/lane) */
        groupProperty?: string;
        /** CSS class to use for the group */
        groupClass?: string;
        /** Property to use as the CSS class for the group */
        groupClassProperty?: string;
        /** CSS class to use for the timeline item */
        class?: string;
        /** Property to use as the CSS class for the timeline item */
        classProperty?: string;
        /** Property that contains the start time (as stringified Date) */
        startTimeProperty?: string;
        /** Property that contains the end time (as stringified Date) */
        endTimeProperty?: string;
        /** Property that contains the content (text that appears inside the timeline item) */
        contentProperty?: string;
    }
    /** Interface for every group and timeline item. */
    interface ITimelineItem {
        /** Feature ID */
        id?: any;
        /** Layer ID */
        layerId?: string;
        /** Content to show in the timeline item (html or string) */
        content?: string;
        /** Start time */
        start?: Date;
        /** End time */
        end?: Date;
        group?: string;
        /** CSS group class name */
        groupClass?: string;
        /** CSS timeline item class name */
        className?: string;
    }
    /** Interface to talk to the timeline items in the timeline, of type vis.DataSet. */
    interface IDataSet {
        /** Add one or more timeline items. */
        add(items: ITimelineItem | ITimelineItem[]): any;
        /** Removes an item from the timeline. */
        remove(items: ITimelineItem | ITimelineItem[]): any;
        /** Returns the ids of all timeline items. */
        getIds(): string[];
        /** Get all timeline items. */
        get(): ITimelineItem[];
        /** Clears the timeline items. */
        clear(): any;
        forEach(calback: (item: ITimelineItem) => void): any;
    }
    class TimelineCtrl {
        private $scope;
        private $layerService;
        private $mapService;
        private $messageBusService;
        private TimelineService;
        private scope;
        private locale;
        private timelineGroups;
        /** Holds the timeline items, is databound to the timeline. */
        private timelineItems;
        static $inject: string[];
        focusDate: Date;
        line1: string;
        line2: string;
        startDate: Date;
        endDate: Date;
        timer: any;
        isPlaying: boolean;
        showControl: boolean;
        isPinned: boolean;
        activeDateRange: csComp.Services.DateRange;
        options: any;
        expandButtonBottom: number;
        datePickerBottom: number;
        items: any;
        private debounceUpdate;
        private debounceSetItems;
        private ids;
        constructor($scope: ITimelineScope, $layerService: csComp.Services.LayerService, $mapService: csComp.Services.MapService, $messageBusService: csComp.Services.MessageBusService, TimelineService: Timeline.ITimelineService);
        updateTimeline(start: Date, end: Date): void;
        private getDayClass(data);
        /** Check whether the layer contains timeline items, and if so, add them to the timeline. */
        private addTimelineItemsInLayer(layer);
        /** Remove all timeline items that could be found in this layer. */
        private removeTimelineItemsInLayer(layer);
        /** Update the groups, most likely after certain items have been added or deleted */
        private updateGroups();
        private update(s, data);
        private setFocusContainerDebounce;
        private addItems(items);
        private deleteItems(items);
        private setGroups(groups);
        private updateFeatures();
        private initTimeline();
        selectDate(): void;
        updateDragging(): void;
        expandToggle(): void;
        private updateTimelineHeight();
        private updatePanelHeights();
        private throttleTimeSpanUpdate;
        /**
         * trigger a debounced timespan updated message on the message bus
         */
        private triggerTimeSpanUpdated();
        /**
         * time span was updated by timeline control
         */
        onRangeChanged(prop: any): void;
        start(): void;
        goLive(): void;
        stopLive(): void;
        myTimer(): void;
        mouseEnter(): void;
        mouseLeave(): void;
        pin(): void;
        unPin(): void;
        pinToNow(): void;
        stop(): void;
        timelineSelect(): void;
        updateFocusTimeContainer(time: Date): void;
        updateFocusTime(): void;
        /**
        * Load the locales: instead of loading them from the original timeline-locales.js distribution,
        * add them here so you don't need to add another js dependency.
        * @seealso: http://almende.github.io/chap-links-library/downloads.html
        */
        loadLocales(): void;
    }
}

declare module TripPlanner {
    /**
      * Module
      */
    var myModule: any;
}

declare module TripPlanner {
    interface ITripPlannerScope extends ng.IScope {
        vm: TripPlannerCtrl;
    }
    interface IOtpUrlParameters {
        [key: string]: any;
    }
    interface IOtpTab {
        icon: string;
        title: string;
    }
    interface IOtpItinerary {
        duration: number;
        legs: csComp.Services.IOtpLeg[];
    }
    class TripPlannerCtrl {
        private $scope;
        private $mapService;
        private $layerService;
        private $messageBusService;
        private $dashboardService;
        private scope;
        layer: csComp.Services.ProjectLayer;
        private urlAddress;
        private urlParameters;
        private transportModes;
        private transportMode;
        private walkSpeedKm;
        private bikeSpeedKm;
        private time;
        private fromLoc;
        private toLoc;
        private tabs;
        private activeTab;
        private itineraries;
        urlKeys: string[];
        static $inject: string[];
        constructor($scope: ITripPlannerScope, $mapService: csComp.Services.MapService, $layerService: csComp.Services.LayerService, $messageBusService: csComp.Services.MessageBusService, $dashboardService: csComp.Services.DashboardService);
        planRoute(): void;
        parseUrl(): void;
        private featureTabActivated(title);
    }
}

declare module Voting {
    /**
      * Module
      */
    var myModule: any;
}

declare module Authentication {
}

declare module csComp.Services {
    interface IMessageBusCallback {
        (title: string, data?: any): any;
    }
    class ClientMessage {
        action: string;
        data: any;
        constructor(action: string, data: any);
    }
    class MessageBusHandle {
        constructor(topic: string, callback: IMessageBusCallback);
        topic: string;
        callback: IMessageBusCallback;
    }
    interface IBaseEvent {
        add(listener: () => void): void;
        remove(listener: () => void): void;
        trigger(...a: any[]): void;
    }
    class TypedEvent implements IBaseEvent {
        private _listeners;
        add(listener: () => void): void;
        remove(listener?: () => void): void;
        trigger(...a: any[]): void;
    }
    interface IMessageEvent extends IBaseEvent {
        add(listener: (message: string) => void): void;
        remove(listener: (message: string) => void): void;
        trigger(message: string): void;
    }
    class Connection {
        id: string;
        url: string;
        bus: MessageBusService;
        isConnected: boolean;
        isConnecting: boolean;
        cache: {
            [topic: string]: Array<IMessageBusCallback>;
        };
        subscriptions: {
            [id: string]: ServerSubscription;
        };
        socket: any;
        events: IMessageEvent;
        constructor(id: string, url: string, bus: MessageBusService);
        unsubscribe(id: string, callback: IMessageBusCallback): void;
        reSubscribeAll(): void;
        disconnectAll(): void;
        subscribe(target: string, type: string, callback: IMessageBusCallback): ServerSubscription;
        connect(callback: Function): void;
        disconnect(): void;
    }
    enum NotifyLocation {
        BottomRight = 0,
        BottomLeft = 1,
        TopRight = 2,
        TopLeft = 3,
        TopBar = 4,
    }
    enum NotifyType {
        Normal = 0,
        Info = 1,
        Error = 2,
        Success = 3,
    }
    class ServerSubscription {
        target: string;
        type: string;
        callbacks: Array<IMessageBusCallback>;
        id: string;
        serverCallback: any;
        constructor(target: string, type: string);
    }
    /**
     * Simple message bus service, used for subscribing and unsubsubscribing to topics.
     * @see {@link https://gist.github.com/floatingmonkey/3384419}
     */
    class MessageBusService {
        private $translate;
        private static cache;
        static $inject: string[];
        private connections;
        private notifications;
        private confirms;
        constructor($translate: ng.translate.ITranslateService);
        getConnection(id: string): Connection;
        initConnection(id: string, url: string, callback: Function): void;
        serverPublish(topic: string, message: any, serverId?: string): any;
        serverSendMessage(msg: ClientMessage, serverId?: string): any;
        serverSendMessageAction(action: string, data: any, serverId?: string): void;
        serverSubscribe(target: string, type: string, callback: IMessageBusCallback, serverId?: string): MessageBusHandle;
        serverUnsubscribe(handle: MessageBusHandle, serverId?: string): any;
        /**
         * Publish a notification that needs to be translated
         * @title:       the translation key of the notification's title
         * @text:        the translation key of the notification's content
         * @location:    the location on the screen where the notification is shown (default bottom right)
         */
        notifyWithTranslation(title: string, text: string, location?: NotifyLocation, type?: NotifyType, duration?: number): void;
        notifyError(title: string, text: string): void;
        /**
         * Publish a notification
         * @title:       the title of the notification
         * @text:        the contents of the notification
         * @location:    the location on the screen where the notification is shown (default bottom right)
         * @notifyType:  the type of notification
         */
        notify(title: string, text: string, location?: NotifyLocation, notifyType?: NotifyType, duration?: number): any;
        confirmButtons(title: string, text: string, buttons: string[], callback: (result: string) => any): any;
        /**
         * Show a confirm dialog
         * @title           : the title of the notification
         * @text            : the contents of the notification
         * @callback        : the callback that will be called after the confirmation has been answered.
         */
        confirm(title: string, text: string, callback: (result: boolean) => any, allowDuplicate?: boolean): any;
        notifyBottom(title: string, text: string): void;
        /**
         * Publish a notification
         * @title: the title of the notification
         * @text:  the contents of the notification
         */
        notifyData(data: any): void;
        /**
         * Publish to a topic
         */
        publish(topic: string, title: string, data?: any): void;
        /**
         * Subscribe to a topic
         * @param {string} topic The desired topic of the message.
         * @param {IMessageBusCallback} callback The callback to call.
         */
        subscribe(topic: string, callback: IMessageBusCallback): MessageBusHandle;
        /**
         * Unsubscribe to a topic by providing its handle
         */
        unsubscribe(handle: MessageBusHandle): void;
    }
    class EventObj {
        myEvents: any;
        bind(event: any, fct: any): void;
        unbind(event: any, fct: any): void;
        unbindEvent(event: any): void;
        unbindAll(): void;
        trigger(event: any, ...args: any[]): void;
        registerEvent(evtname: string): void;
        registerEvents(evtnames: Array<string>): void;
    }
    /**
      * Module
      */
    var myModule: any;
}

declare module csComp.Services {
    interface IButtonActionOptions {
        layerId?: string;
        groupId?: string;
        propertyId?: string;
        [key: string]: any;
    }
    interface IButtonAction {
        /** Specifies button actions */
        [action: string]: (options: IButtonActionOptions) => void;
    }
    /**
     * The action service can be used to execute certain actions, e.g. when clicking a feature.
     * It comes with some predefined actions, and can be enhanced with other actions from your application.
     */
    class ActionService {
        private messageBusService;
        private $timeout;
        /** The layerService cannot be injected, as this would cause a circular dependency with the LayerService itself. */
        private layerService;
        private actions;
        static $inject: string[];
        constructor(messageBusService: MessageBusService, $timeout: ng.ITimeoutService);
        /** Initialize the default actions */
        init(layerService: LayerService): void;
        /** Call an action by name (lowercase), optionally providing it with additional parameters like group, layer or property id. */
        execute(actionTitle: string, options?: IButtonActionOptions): void;
        /** Add your own action to the list of all actions. */
        addAction(actionTitle: string, func: (options: IButtonActionOptions) => void): void;
        /** Return a copy of all the actions. */
        getActions(): IButtonAction;
        activateStyle(groupId: string, propId: string): void;
    }
    /**
      * Module
      */
    var myModule: any;
}

declare module csComp.Services {
    interface IChartGenerator {
        start(ctrl: ChartsWidget.ChartCtrl): any;
        stop(): any;
    }
    class PropertyBarChartGenerator implements IChartGenerator {
        private $layerService;
        private $dashboardService;
        private ctrl;
        private mb;
        private options;
        constructor($layerService: Services.LayerService, $dashboardService: Services.DashboardService);
        start(ctrl: ChartsWidget.ChartCtrl): void;
        private lastSelectedFeature;
        private selectFeature(f);
        stop(): void;
    }
    class propertySensordataGenerator implements IChartGenerator {
        private $layerService;
        private $dashboardService;
        private ctrl;
        private mb;
        private options;
        constructor($layerService: Services.LayerService, $dashboardService: Services.DashboardService);
        start(ctrl: ChartsWidget.ChartCtrl): void;
        private lastSelectedFeature;
        private selectFeature(f);
        stop(): void;
    }
    class layerPropertySensordataGenerator implements IChartGenerator {
        private $layerService;
        private $dashboardService;
        private ctrl;
        private mb;
        private options;
        private layer;
        constructor($layerService: Services.LayerService, $dashboardService: Services.DashboardService);
        start(ctrl: ChartsWidget.ChartCtrl): void;
        private selectLayer(layer);
        stop(): void;
    }
    class layerKpiGenerator implements IChartGenerator {
        private $layerService;
        private $dashboardService;
        private ctrl;
        private mb;
        private options;
        private layer;
        constructor($layerService: Services.LayerService, $dashboardService: Services.DashboardService);
        start(ctrl: ChartsWidget.ChartCtrl): void;
        private selectLayer(layer);
        stop(): void;
    }
}

declare module csComp.Services {
    /** Contains properties needed to describe right panel */
    class RightPanelTab {
        title: string;
        container: string;
        directive: string;
        data: any;
        icon: string;
        popover: string;
        open: boolean;
        replace: boolean;
        canClose: boolean;
    }
    /** When searching, specify the search query */
    interface ISearch {
        /** If true, the search is active. */
        isActive?: boolean;
        /** Query string to search for */
        query: string;
    }
    /** service for managing dashboards */
    class DashboardService {
        private $rootScope;
        private $compile;
        private $injector;
        private $location;
        private $timeout;
        private $translate;
        private $messageBusService;
        private $layerService;
        private $mapService;
        private $localStorageService;
        maxBounds: IBoundingBox;
        featureDashboard: csComp.Services.Dashboard;
        mainDashboard: csComp.Services.Dashboard;
        editMode: boolean;
        activeWidget: IWidget;
        dashboards: any;
        widgetTypes: {
            [key: string]: IWidget;
        };
        chartGenerators: {
            [key: string]: Function;
        };
        socket: any;
        editWidgetMode: boolean;
        /** Search status: if isActive is true, show the Navigate directive. */
        _search: ISearch;
        /** website is running in touch mode */
        touchMode: boolean;
        rightPanelTabs: {
            [key: string]: RightPanelTab;
        };
        static $inject: string[];
        constructor($rootScope: any, $compile: any, $injector: any, $location: ng.ILocationService, $timeout: ng.ITimeoutService, $translate: ng.translate.ITranslateService, $messageBusService: Services.MessageBusService, $layerService: Services.LayerService, $mapService: Services.MapService, $localStorageService: ng.localStorage.ILocalStorageService);
        search: ISearch;
        leftMenuVisible(id: string): boolean;
        selectDashboard(dashboard: csComp.Services.Dashboard, container: string): void;
        closeContainer(): void;
        activateTab(t: any): void;
        deactivateTabContainer(container: string): void;
        deactivateTab(tab: RightPanelTab): void;
        editWidget(widget: csComp.Services.IWidget): void;
        stopEditWidget(): void;
        removeWidget(): void;
    }
    /**
      * Module
      */
    var myModule: any;
}

declare module csComp.Services {
    class top10Generator implements IChartGenerator {
        private $layerService;
        private $dashboardService;
        private ctrl;
        private mb;
        private options;
        constructor($layerService: Services.LayerService, $dashboardService: Services.DashboardService);
        private layerSub;
        private styleSub;
        private property;
        private layer;
        start(ctrl: ChartsWidget.ChartCtrl): void;
        private updateChart(layer);
        stop(): void;
    }
}

declare module csComp.Services {
    class Coordinates {
        accuracy: number;
        latitude: number;
        longitude: number;
    }
    class Geoposition {
        coords: Coordinates;
        timestamp: number;
    }
    class GeoService {
        bus: Services.MessageBusService;
        $rootScope: ng.IRootScopeService;
        $window: ng.IWindowService;
        $q: ng.IQService;
        position: Geoposition;
        geolocation_msgs: {
            'errors.location.unsupportedBrowser': string;
            'errors.location.permissionDenied': string;
            'errors.location.positionUnavailable': string;
            'errors.location.timeout': string;
        };
        static $inject: string[];
        constructor(bus: Services.MessageBusService, $rootScope: ng.IRootScopeService, $window: ng.IWindowService, $q: ng.IQService);
        getLocation(): any;
        start(opts?: any): void;
    }
    /**
      * Module
      */
    var myModule: any;
}


declare module ContourAction {
    import IFeature = csComp.Services.IFeature;
    import IActionOption = csComp.Services.IActionOption;
    class ContourActionModel implements csComp.Services.IActionService {
        id: string;
        private layerService;
        stop(): void;
        addFeature(feature: IFeature): void;
        removeFeature(feature: IFeature): void;
        selectFeature(feature: IFeature): void;
        addLayer(layer: csComp.Services.IProjectLayer): void;
        removeLayer(layer: csComp.Services.IProjectLayer): void;
        getFeatureActions(feature: IFeature): IActionOption[];
        getLayerActions(layer: csComp.Services.IProjectLayer): any;
        getFeatureHoverActions(feature: IFeature): IActionOption[];
        deselectFeature(feature: IFeature): void;
        updateFeature(feuture: IFeature): void;
        private showContour(feature, layerService);
        private hideContour(feature, layerService);
        init(layerService: csComp.Services.LayerService): void;
    }
}

declare module csComp.Services {
    class ExpressionService {
        private $parse;
        private messageBusService;
        /**
         * A common set of operations for parsing Angular expressions, such as:
         * count, sum, average and standard deviation.
         *
         * Since Angular's $parse does not allow you to define a function or for loop, we use a hack to supply these
         * functions through an object.
         * See also http://glebbahmutov.com/blog/angularjs-parse-hacks/
         */
        private ops;
        static $inject: string[];
        constructor($parse: ng.IParseService, messageBusService: Services.MessageBusService);
        /**
         * Evaluate the layer by evaluating any expressions.
         * @param  {ProjectLayer} layer
         */
        evalLayer(layer: ProjectLayer, featureTypes: {
            [key: string]: IFeatureType;
        }): void;
        /**
         * Check whether the features contain an expressions, and if so, evaluate them.
         * @param  {ng.IParseService} $parse
         * @param  {csComp.Services.TypeResource} resource
         * @param  {IFeature[]} features
         */
        evalResourceExpressions(resource: csComp.Services.TypeResource, features: IFeature[]): void;
        /**
         * Check whether the property type has an expression, and if so, evaluate it.
         * @param  {IPropertyType} propertyType
         * @param  {IFeature[]} features
         * @param  {boolean} isDefaultPropertyType: default true, indicating that the expression should be applied to all features that haven't explicitly specified their featureTypeId.
         */
        evalExpressions(propertyType: IPropertyType, features: IFeature[], isDefaultPropertyType?: boolean): void;
        evalExpression(expression: string, features: IFeature[], feature?: IFeature): any;
        evalSensorExpression(expression: string, features: IFeature[], feature?: IFeature, timeIndex?: number): any;
        /** Evaluate the expression in a property */
        evalPropertyType(pt: IPropertyType, features: IFeature[], feature?: IFeature): string;
    }
    /**
      * Module
      */
    var myModule: any;
}

declare module csComp.Services {
    import IFeature = csComp.Services.IFeature;
    enum ActionType {
        Context = 0,
        Hover = 1,
    }
    interface IActionOption {
        title: string;
        icon: string;
        feature: IFeature;
        callback: Function;
    }
    interface ISearchResultItem {
        type?: string;
        feature?: IFeature;
        description?: string;
        title: string;
        score?: number;
        icon?: string;
        service: string;
        click: Function;
        location?: IGeoJsonGeometry;
        /** The position the item has in the result, e.g. A, B, or C... */
        searchIndex?: string;
    }
    type SearchResultHandler = (error: Error, result: ISearchResultItem[]) => void;
    interface ISearchQuery {
        query: string;
        results: ISearchResultItem[];
    }
    interface IActionService {
        id: string;
        init(ls: LayerService): any;
        stop(): any;
        addFeature(feature: IFeature): any;
        addLayer(layer: IProjectLayer): any;
        removeLayer(layer: IProjectLayer): any;
        removeFeature(feature: IFeature): any;
        selectFeature(feature: IFeature): any;
        getLayerActions(layer: IProjectLayer): IActionOption[];
        getFeatureActions(feature: IFeature): IActionOption[];
        getFeatureHoverActions(feature: IFeature): IActionOption[];
        deselectFeature(feature: IFeature): any;
        updateFeature(feuture: IFeature): any;
        search?(query: ISearchQuery, result: SearchResultHandler): any;
    }
    class BasicActionService implements csComp.Services.IActionService {
        id: any;
        layerService: csComp.Services.LayerService;
        stop(): void;
        addFeature(feature: IFeature): void;
        removeFeature(feature: IFeature): void;
        selectFeature(feature: IFeature): void;
        getLayerActions(layer: IProjectLayer): IActionOption[];
        getFeatureActions(feature: IFeature): IActionOption[];
        getFeatureHoverActions(feature: IFeature): IActionOption[];
        deselectFeature(feature: IFeature): void;
        addLayer(layer: IProjectLayer): void;
        removeLayer(layer: IProjectLayer): void;
        updateFeature(feuture: IFeature): void;
        search(query: ISearchQuery, result: Function): void;
        init(layerService: csComp.Services.LayerService): void;
    }
    class LayerActions extends BasicActionService {
        id: string;
        addLayer(layer: ProjectLayer): void;
        getLayerActions(layer: ProjectLayer): IActionOption[];
        getFeatureActions(feature: IFeature): IActionOption[];
        getFeatureHoverActions(feature: IFeature): IActionOption[];
        private zoomFeatureTimeline(feature, layerService);
        private setAsFilter(feature, layerService);
        search(query: ISearchQuery, result: SearchResultHandler): void;
        init(layerService: csComp.Services.LayerService): void;
    }
}

declare module csComp.Services {
    /** describes a layer source, every layer has a layer source that is responsible for importing the data (e.g. geojson, wms, etc */
    interface ILayerSource {
        title: string;
        service: LayerService;
        addLayer(layer: ProjectLayer, callback: Function, data: Object): any;
        removeLayer(layer: ProjectLayer): void;
        refreshLayer(layer: ProjectLayer): void;
        fitMap?(layer: ProjectLayer): void;
        fitTimeline?(layer: ProjectLayer): void;
        requiresLayer: boolean;
        getRequiredLayers?(layer: ProjectLayer): ProjectLayer[];
        layerMenuOptions(layer: ProjectLayer): [[string, Function]];
    }
    /** layer service is responsible for reading and managing all project, layer and sensor related data */
    class LayerService {
        private $location;
        $compile: any;
        $translate: ng.translate.ITranslateService;
        $messageBusService: Services.MessageBusService;
        $mapService: Services.MapService;
        $rootScope: any;
        geoService: GeoService;
        $http: ng.IHttpService;
        private expressionService;
        actionService: ActionService;
        $storage: ng.localStorage.ILocalStorageService;
        maxBounds: IBoundingBox;
        title: string;
        accentColor: string;
        mb: Services.MessageBusService;
        map: Services.MapService;
        _featureTypes: {
            [key: string]: IFeatureType;
        };
        propertyTypeData: {
            [key: string]: IPropertyType;
        };
        project: Project;
        projectUrl: SolutionProject;
        solution: Solution;
        openSingleProject: boolean;
        emptySolutionUrl: string;
        dimension: any;
        lastSelectedFeature: IFeature;
        selectedFeatures: IFeature[];
        selectedLayerId: string;
        timeline: any;
        _activeContextMenu: IActionOption[];
        editing: boolean;
        directoryHandle: MessageBusHandle;
        /** true if no filters are active */
        noFilters: boolean;
        /** indicator true for mobile devices */
        isMobile: boolean;
        currentLocale: string;
        /** layers that are currently active */
        loadedLayers: {
            [key: string]: ProjectLayer;
        };
        /** list of available layer sources */
        layerSources: {
            [key: string]: ILayerSource;
        };
        /** list of available map renderers */
        mapRenderers: {
            [key: string]: IMapRenderer;
        };
        /** map render currently in use */
        activeMapRenderer: IMapRenderer;
        /** list of all loaded types resources */
        typesResources: {
            [key: string]: ITypesResource;
        };
        actionServices: IActionService[];
        currentContour: L.GeoJSON;
        startDashboardId: string;
        visual: VisualState;
        throttleSensorDataUpdate: Function;
        throttleBBOXUpdate: (bbox: string, bboxarray: number[][]) => void;
        static $inject: string[];
        constructor($location: ng.ILocationService, $compile: any, $translate: ng.translate.ITranslateService, $messageBusService: Services.MessageBusService, $mapService: Services.MapService, $rootScope: any, geoService: GeoService, $http: ng.IHttpService, expressionService: ExpressionService, actionService: ActionService, $storage: ng.localStorage.ILocalStorageService);
        private setLanguage(project?);
        refreshActiveLayers(): void;
        updateBBOX(bbox: string, bboxarray: number[][]): void;
        updateLayerKpiLink(layer: ProjectLayer): void;
        /** update sensor data using an external sensor link */
        updateLayerSensorLink(layer: ProjectLayer): void;
        /**
         * Get external sensordata for loaded layers with sensor links enabled
         */
        updateSensorLinks(): void;
        enableDrop(): void;
        handleFileUpload(files: any, obj: any): void;
        checkMobile(): void;
        getActions(feature: IFeature, type: ActionType): IActionOption[];
        addActionService(as: IActionService): void;
        removeActionService(as: IActionService): void;
        checkViewBounds(): void;
        /** Find a dashboard by ID */
        findDashboardById(dashboardId: string): Dashboard;
        /** Find a widget by ID, optionally supplying its parent dashboard id. */
        findWidgetById(widgetId: string, dashboardId?: string): IWidget;
        /**
         * Initialize the available layer sources
         */
        private initLayerSources();
        private removeSubLayers(feature);
        /**
        * Check for every feature (de)select if layers should automatically be activated
        */
        private checkFeatureSubLayers();
        loadRequiredLayers(layer: ProjectLayer): void;
        addLayer(layer: ProjectLayer, layerloaded?: Function, data?: any): void;
        getLayerLegend(l: ProjectLayer): Legend;
        evaluateLayerExpressions(l: ProjectLayer, fTypes: {
            [key: string]: IFeatureType;
        }): void;
        evaluateFeatureExpressions(f: Feature): void;
        /** save a resource back to the api */
        saveResource(resource: TypeResource): void;
        expandGroup(layer: ProjectLayer): void;
        collapseAll(): void;
        expandAll(): void;
        /** load external type resource for a project or layer */
        loadTypeResources(url: any, requestReload: boolean, callback: Function): void;
        /**
         * returns a list of all project layers in all groups
         */
        allLayers(): ProjectLayer[];
        /** add a types resource (project, resource file or layer) */
        initTypeResources(source: any): void;
        getLayerPropertyTypes(layer: ProjectLayer): IPropertyType[];
        checkLayerLegend(layer: ProjectLayer, property: string): void;
        /**
         * Check whether we need to enable the timer to refresh the layer.
         */
        private checkLayerTimer(layer);
        removeStyle(style: GroupStyle): void;
        updatePropertyStyle(k: string, v: any, parent: any): void;
        updateStyle(style: GroupStyle): void;
        updateGroupFeatures(group: ProjectGroup): void;
        /**
         * Recompute the style of the layer features, e.g. after changing the opacity or after
         * zooming to a level outside the layers' range.
         */
        updateLayerFeatures(layer: ProjectLayer): void;
        updateCanvasOverlay(layer: ProjectLayer): void;
        updateFeatureTypes(featureType: IFeatureType): void;
        selectRenderer(renderer: string): void;
        centerFeatureOnMap(selFeatures: IFeature[]): void;
        editFeature(feature: IFeature, select?: boolean): void;
        private deselectFeature(feature);
        /** Called when a feature is selected. */
        selectFeature(feature: IFeature, multi?: boolean, force?: boolean): void;
        private lookupLog(logs, timestamp);
        updateLog(f: IFeature): void;
        updateFeature(feature: IFeature): void;
        getSensorIndex(d: Number, timestamps: Number[]): number;
        updateFeatureSensorData(f: IFeature, date: number): void;
        updateLayerSensorDataWithDate(l: ProjectLayer, date: any): void;
        /** update for all features the active sensor data values and update styles */
        updateSensorData(): void;
        /** update sensor data for a layer */
        updateLayerSensorData(l: ProjectLayer): void;
        /***
         * get list of properties that are part of the filter collection
         */
        private filterProperties(group);
        /**
         * init feature (add to feature list, crossfilter)
         */
        initFeature(feature: IFeature, layer: ProjectLayer, applyDigest?: boolean, publishToTimeline?: boolean): IFeatureType;
        cleanSensorData(feature: IFeature, s: string): void;
        /** remove feature */
        removeFeature(feature: IFeature, save?: boolean): void;
        /**
        * Calculate the effective feature style.
        */
        calculateFeatureStyle(feature: IFeature): void;
        /**
        * Initialize the feature type and its property types by setting default property values, and by localizing it.
        */
        initFeatureType(ft: IFeatureType, source: ITypesResource): void;
        /** Set the iconUri for remote servers (newIconUri = server/oldIconUri) */
        private initIconUri(ft);
        /**
        * Initialize the property type with default values, and, if applicable, localize it.
        */
        private initPropertyType(pt, legends);
        /**
        * Set default PropertyType's properties:
        * type              = text
        * visibleInCallout  = true
        * canEdit           = false
        * isSearchable      = true
        */
        private setDefaultPropertyType(pt);
        private localizePropertyType(pt);
        findResourceByLayer(layer: ProjectLayer): TypeResource;
        findResourceByFeature(feature: IFeature): ITypesResource;
        findPropertyTypeById(id: string): IPropertyType;
        /**
         * find a filter for a specific group/property combination
         */
        private findFilter(group, property);
        /**
         * Find a feature by layerId and FeatureId.
         * @layerId {string}
         * @featureIndex {number}
         */
        findFeatureByIndex(layerId: string, featureIndex: number): IFeature;
        /**
         * Find a feature by layerId and FeatureId.
         * @layerId {string}
         * @featureIndex {number}
         */
        findFeatureById(featureId: string): IFeature;
        /**
         * Find a feature by layerId and FeatureId.
         * @property {string}
         * @value {number}
         */
        findFeatureByPropertyValue(property: string, value: Object): IFeature;
        /**
         * Find a feature by layerId and FeatureId.
         * @layer {ProjectLayer}
         * @featureId {number}
         */
        findFeature(layer: ProjectLayer, featureId: string): IFeature;
        /**
         * Find a group by id
         */
        findGroupById(id: string): ProjectGroup;
        /**
         * Find a group by id
         */
        findGroupByLayerId(layer: ProjectLayer): ProjectGroup;
        /**
         * Find the feature by name.
         */
        findFeatureByName(name: string): IFeature;
        /**
        * Find a loaded layer with a specific id.
        */
        findLoadedLayer(id: string): ProjectLayer;
        /**
         * Find a layer with a specific id.
         */
        findLayer(id: string): ProjectLayer;
        setGroupStyle(group: ProjectGroup, property: IPropertyType): void;
        setStyleForProperty(layer: ProjectLayer, property: string): void;
        /**
         * Creates a GroupStyle based on a property and adds it to a group.
         * If the group already has a style which contains legends, those legends are copied into the newly created group.
         * Already existing groups (for the same visualAspect) are replaced by the new group.
         * Restoring a previously used groupstyle is possible by sending that GroupStyle object.
         */
        setStyle(property: any, openStyleTab?: boolean, customStyleInfo?: PropertyInfo, groupStyle?: GroupStyle): any;
        toggleStyle(property: any, group: ProjectGroup, openStyleTab?: boolean, customStyleInfo?: PropertyInfo): void;
        /**
         * checks if there are other styles that affect the same visual aspect, removes them (it)
         * and then adds the style to the group's styles
         */
        saveStyle(group: ProjectGroup, style: GroupStyle): void;
        /** checks if there are any filters available, used to show/hide filter tab leftpanel menu */
        updateFilterAvailability(): void;
        addFilter(group: ProjectGroup, prop: string): void;
        /**
         * enable a filter for a specific property
         */
        setFilter(filter: GroupFilter, group: csComp.Services.ProjectGroup): void;
        setLocationFilter(group: ProjectGroup): void;
        setFeatureAreaFilter(f: IFeature): void;
        resetFeatureAreaFilter(): void;
        /**
        * enable a filter for a specific property
        */
        setPropertyFilter(property: FeatureProps.CallOutProperty): void;
        createScatterFilter(group: ProjectGroup, prop1: string, prop2: string): void;
        triggerUpdateFilter(groupId: string): void;
        /** remove filter from group */
        removeFilter(filter: GroupFilter): void;
        /**
         * Returns PropertyType for a specific property in a feature
         */
        getPropertyType(feature: IFeature, property: string): IPropertyType;
        /**
        Returns the featureTypeId for specific feature.
        It looks for the FeatureTypeId property, defaultFeatureType of his layer
        and checks if it should be found in a resource file or within his own layer
        */
        getFeatureTypeId(feature: IFeature): string;
        /**
         * Find a feature type by its ID (of the format 'featuretypeurl + # + featuretypename').
         * If it does not exist, return null.
         */
        getFeatureTypeById(featureTypeId: string): IFeatureType;
        /**
         * Return the feature style for a specific feature.
         * First, look for a layer specific feature type, otherwise, look for a project-specific feature type.
         * In case both fail, create a default feature type at the layer level.
         *
         * If the feature type contains a _{xxx} part, replace the {xxx} with the value of feature.property['xxx']
         * if it exists, otherwise remove it.
         */
        getFeatureType(feature: IFeature): IFeatureType;
        private createMissingFeatureType(feature);
        resetFilters(): void;
        private getGroupFeatures(g);
        rebuildFilters(g: ProjectGroup): void;
        /**
         * deactivate layer
         */
        removeLayer(layer: ProjectLayer, removeFromGroup?: boolean): void;
        removeAllFilters(g: ProjectGroup): void;
        removeAllStyles(g: ProjectGroup): void;
        /***
         * Open solution file with references to available baselayers and projects
         * @params url: URL of the solution
         * @params layers: Optionally provide a semi-colon separated list of layer IDs that should be opened.
         * @params initialProject: Optionally provide a project name that should be loaded, if omitted the first project in the definition will be loaded
         */
        openSolution(url: string, layers?: string, initialProject?: string): void;
        /**
        * Clear all layers.
        */
        clearLayers(): void;
        /**
         * Open project
         * @params url: URL of the project
         * @params layers: Optionally provide a semi-colon separated list of layer IDs that should be opened.
         * @params project: Optionally provide the project that should be parsed. If not provided, it will be requested using the solution url.
         */
        openProject(solutionProject: csComp.Services.SolutionProject, layers?: string, project?: Project): void;
        private parseProject(prj, solutionProject, layerIds);
        private apply();
        /** toggle layer enabled/disabled */
        toggleLayer(layer: ProjectLayer, loaded?: Function): void;
        enableLayer(layer: ProjectLayer, loaded?: Function): void;
        removeGroup(group: ProjectGroup): void;
        /** initializes project group (create crossfilter index, clustering, initializes layers) */
        initGroup(group: ProjectGroup, layerIds?: string[]): void;
        /** initializes a layer (check for id, language, references group, add to active map renderer) */
        initLayer(group: ProjectGroup, layer: ProjectLayer, layerIds?: string[]): void;
        checkDataSourceSubscriptions(ds: DataSource): void;
        checkSubscriptions(): void;
        closeProject(): void;
        /** Find a sensor set for a specific source/sensor combination. Key should be something like datasource/sensorid */
        findSensorSet(key: string, callback: Function): any;
        getPropertyValues(layer: ProjectLayer, property: string): Object[];
        /**
         * Calculate min/max/count/mean/varience/sd for a specific property in a group
         */
        calculatePropertyInfo(group: ProjectGroup, property: string): PropertyInfo;
        updateFilterGroupCount(group: ProjectGroup): void;
        private trackGeometry(f, result);
        /**
         * Check for property changes for a specific key inside a feature, return a set of logs in result
         */
        private trackPropertyLog(f, key, result);
        /** Check for property changes inside a feature, return a set of logs in result */
        private trackFeature(feature);
        isLocked(f: IFeature): boolean;
        /**
         * Set a lock property on the feature to signal others prevent feature updates
         */
        lockFeature(f: IFeature): boolean;
        unlockFeature(f: IFeature): void;
        stopEditingLayer(layer: csComp.Services.ProjectLayer): void;
        saveProject(): void;
        private updateProjectReady(data);
        /** Create a new feature and save it to the server. */
        createFeature(feature: Feature, layer: ProjectLayer): void;
        /**
         * Save feature back to the server. Does not create it, use createFeature for that.
         */
        saveFeature(f: IFeature, logs?: boolean): void;
        /**
         * Update the filter status of a feature, i.e. the _gui.included property.
         * When a filter is applied, and the feature is not shown anymore, the feature._gui.included = false.
         * In all other cases, it is true. */
        private updateFilterStatusFeature(group);
        /***
         * Update map markers in cluster after changing filter
         */
        updateMapFilter(group: ProjectGroup): void;
        resetMapFilter(group: ProjectGroup): void;
    }
    /**
     * object for sending layer messages over socket.io channel
     */
    class LayerUpdate {
        layerId: string;
        action: LayerUpdateAction;
        item: any;
        featureId: string;
    }
    /**
     * List of available action for sending/receiving layer actions over socket.io channel
     */
    enum LayerUpdateAction {
        updateFeature = 0,
        updateLog = 1,
        deleteFeature = 2,
        updateLayer = 3,
        deleteLayer = 4,
        addUpdateFeatureBatch = 5,
    }
    /** Type of change in an ApiEvent */
    enum ChangeType {
        Create = 0,
        Update = 1,
        Delete = 2,
    }
    /** When a key|layer|project is changed, the ChangeEvent is emitted with the following data. */
    interface IChangeEvent {
        id: string;
        type: ChangeType;
        value?: Object;
    }
    /**
     * List of available action for sending/receiving project actions over socket.io channel
     */
    enum ProjectUpdateAction {
        updateProject = 0,
        deleteProject = 1,
    }
    /**
     * object for sending project messages over socket.io channel
     */
    class ProjectUpdate {
        projectId: string;
        action: ProjectUpdateAction;
        item: any;
    }
    /**
      * Module
      */
    var myModule: any;
}

declare module MatrixAction {
    import IFeature = csComp.Services.IFeature;
    class MatrixActionModel extends csComp.Services.BasicActionService {
        id: string;
        init(layerService: csComp.Services.LayerService): void;
        selectFeature(feature: IFeature): void;
        addLayer(layer: csComp.Services.IProjectLayer): void;
    }
}

declare module RelationAction {
    import IFeature = csComp.Services.IFeature;
    interface IRelation {
        [propertyKey: string]: IFeature[];
    }
    /**
     * When a feature is selected, its propertyTypes will be searched for 'relation' propertyTypes.
     * If present, related features of these propTypes will be looked up and stored in
     * the _gui.relations property of the feature as an IRelation-dictionary.
     */
    class RelationActionModel extends csComp.Services.BasicActionService {
        id: string;
        init(layerService: csComp.Services.LayerService): void;
        selectFeature(feature: IFeature): void;
        addLayer(layer: csComp.Services.IProjectLayer): void;
    }
}

declare module csComp.Services {
    class MapService {
        private $localStorageService;
        private $timeout;
        private $messageBusService;
        private static expertModeKey;
        private scale;
        private showLocation;
        static $inject: string[];
        map: L.Map;
        baseLayers: any;
        drawingLayer: ProjectLayer;
        drawingFeatureType: csComp.Services.IFeatureType;
        activeBaseLayer: BaseLayer;
        activeBaseLayerId: string;
        mapVisible: boolean;
        rightMenuVisible: boolean;
        maxBounds: IBoundingBox;
        drawInstance: any;
        featureGroup: L.ILayer;
        drawingNotification: any;
        private _timelineVisible;
        timelineVisible: boolean;
        expertMode: Expertise;
        constructor($localStorageService: ng.localStorage.ILocalStorageService, $timeout: ng.ITimeoutService, $messageBusService: csComp.Services.MessageBusService);
        private mapClicked(e);
        /**
         * The expert mode can either be set manually, e.g. using this directive, or by setting the expertMode property in the
         * project.json file. In neither are set, we assume that we are dealing with an expert, so all features should be enabled.
         *
         * Precedence:
         * - when a declaration is absent, assume Expert.
         * - when the mode is set in local storage, take that value.
         * - when the mode is set in the project.json file, take that value.
         */
        private initExpertMode();
        isExpert: boolean;
        isIntermediate: boolean;
        isAdminExpert: boolean;
        getBaselayer(layer: string): BaseLayer;
        changeBaseLayer(layer: string): void;
        invalidate(): void;
        /**
         * Zoom to a location on the map.
         */
        zoomToLocation(center: L.LatLng, zoomFactor?: number): void;
        /**
         * Zoom to a feature on the map.
         */
        zoomTo(feature: IFeature, zoomLevel?: number): void;
        zoomIn(): void;
        zoomOut(): void;
        /**
         * Compute the bounding box.
         * Returns [min_x, max_x, min_y, max_y]
         */
        private getBoundingBox(arr);
        getMap(): L.Map;
        initDraw(layerService: csComp.Services.LayerService): void;
        /** start drawing line/polygon */
        startDraw(layer: csComp.Services.ProjectLayer, featureType: csComp.Services.IFeatureType): void;
    }
    /**
      * Module
      */
    var myModule: any;
}

declare module csComp.Services {
    class ProfileService {
        private $localStorageService;
        private $timeout;
        private $messageBusService;
        loggedIn: boolean;
        validate: Function;
        logout: Function;
        isValidating: boolean;
        static $inject: string[];
        startLogin(): void;
        validateUser(userName: any, userPassword: any): void;
        logoutUser(): void;
        constructor($localStorageService: ng.localStorage.ILocalStorageService, $timeout: ng.ITimeoutService, $messageBusService: csComp.Services.MessageBusService);
    }
    /**
      * Module
      */
    var myModule: any;
}

declare module csComp.Search {
    interface ISearchFormScope extends ng.IScope {
        vm: SearchFormCtrl;
        location: L.LatLng;
    }
    class SearchFormCtrl {
        private $scope;
        private $mapService;
        static $inject: string[];
        constructor($scope: ISearchFormScope, $mapService: csComp.Services.MapService);
        doSearch(): void;
    }
}

declare module Dashboard {
    /**
      * Module
      */
    var myModule: any;
}

declare module Dashboard {
    interface IDashboardScope extends ng.IScope {
        vm: DashboardCtrl;
        dashboard: csComp.Services.Dashboard;
        container: string;
        param: any;
        initDashboard: Function;
        minus: Function;
    }
    interface IWidgetScope extends ng.IScope {
        data: any;
    }
    class DashboardCtrl {
        private $scope;
        private $compile;
        private $layerService;
        private $mapService;
        private $messageBusService;
        private $dashboardService;
        private $templateCache;
        private $timeout;
        private scope;
        private project;
        static $inject: string[];
        constructor($scope: IDashboardScope, $compile: any, $layerService: csComp.Services.LayerService, $mapService: csComp.Services.MapService, $messageBusService: csComp.Services.MessageBusService, $dashboardService: csComp.Services.DashboardService, $templateCache: any, $timeout: ng.ITimeoutService);
        closeDashboard(): void;
        updateWidgetPosition(widget: csComp.Services.IWidget): void;
        toggleWidget(widget: csComp.Services.IWidget): void;
        getOptions(widget: csComp.Services.IWidget): void;
        triggerOption(o: any, w: csComp.Services.IWidget): void;
        updateWidget(w: csComp.Services.IWidget): void;
        toggleInteract(widget: csComp.Services.IWidget): void;
        checkMap(): void;
        checkDescription(): void;
        checkLayers(): void;
        checkViewbound(): void;
        checkTimeline(): void;
        private setValue(diff, value);
        removeWidget(widget: csComp.Services.IWidget): void;
        isReady(widget: csComp.Services.IWidget): void;
        private checkLegend(d);
        updateDashboard(): void;
    }
}

declare module DashboarHeaderdSelection {
    /**
      * Module
      */
    var myModule: any;
}

declare module DashboarHeaderdSelection {
    interface IDashboardHeaderSelectionScope extends ng.IScope {
        vm: any;
        addWidget: Function;
        title: string;
    }
    class DashboardHeaderSelectionCtrl {
        private $scope;
        private $layerService;
        $dashboardService: csComp.Services.DashboardService;
        private $mapService;
        $messageBusService: csComp.Services.MessageBusService;
        scope: any;
        project: csComp.Services.SolutionProject;
        static $inject: string[];
        constructor($scope: any, $layerService: csComp.Services.LayerService, $dashboardService: csComp.Services.DashboardService, $mapService: csComp.Services.MapService, $messageBusService: csComp.Services.MessageBusService);
        childDashboards(db: csComp.Services.Dashboard): csComp.Services.Dashboard[];
    }
}

declare module DashboardSelection {
    /**
      * Module
      */
    var myModule: any;
}

declare module DashboardSelection {
    interface IDashboardSelectionScope extends ng.IScope {
        vm: any;
        addWidget: Function;
        widgetStyle: csComp.Services.WidgetStyle;
        title: string;
    }
    class DashboardSelectionCtrl {
        private $scope;
        private $layerService;
        $dashboardService: csComp.Services.DashboardService;
        private $mapService;
        private $messageBusService;
        scope: any;
        project: csComp.Services.SolutionProject;
        activeWidget: csComp.Services.BaseWidget;
        style: string;
        static $inject: string[];
        constructor($scope: any, $layerService: csComp.Services.LayerService, $dashboardService: csComp.Services.DashboardService, $mapService: csComp.Services.MapService, $messageBusService: csComp.Services.MessageBusService);
        initDrag(key: string): void;
        startWidgetEdit(widget: csComp.Services.BaseWidget): void;
        /**
        * Start editing a specific dashboard
        */
        startDashboardEdit(dashboard: csComp.Services.Dashboard): void;
        /**
        * Stop editing a specific dashboard
        */
        stopDashboardEdit(dashboard: csComp.Services.Dashboard): void;
        stopEdit(): void;
        startEdit(): void;
        widgetHighlight(widget: csComp.Services.BaseWidget): void;
        widgetStopHighlight(widget: csComp.Services.BaseWidget): void;
        /** Add new dashboard */
        addDashboard(widget: csComp.Services.IWidget): void;
        /** Remove existing dashboard */
        removeDashboard(key: string): void;
        selectStyle(): void;
        /** publish a message that a new dashboard was selected */
        private publishDashboardUpdate();
        /** Select an active dashboard */
        selectDashboard(dashboard: csComp.Services.Dashboard): void;
    }
}

declare module Search {
    /**
      * Module
      */
    var myModule: any;
}

declare module Search {
    interface ISearchScope extends ng.IScope {
        vm: SearchCtrl;
        sv: boolean;
    }
    interface IWidgetScope extends ng.IScope {
        data: any;
    }
    class SearchCtrl {
        private $scope;
        private $compile;
        private $layerService;
        private $mapService;
        private $messageBusService;
        private $dashboardService;
        private $templateCache;
        private $timeout;
        private scope;
        private project;
        private query;
        string: any;
        static $inject: string[];
        constructor($scope: ISearchScope, $compile: any, $layerService: csComp.Services.LayerService, $mapService: csComp.Services.MapService, $messageBusService: csComp.Services.MessageBusService, $dashboardService: csComp.Services.DashboardService, $templateCache: any, $timeout: ng.ITimeoutService);
        startSearch(): void;
        closeSearch(): void;
        selectFirst(): void;
    }
}

declare module DashboardEdit {
    /**
      * Module
      */
    var myModule: any;
}

declare module DashboardEdit {
    interface IDashboardEditScope extends ng.IScope {
        vm: DashboardEditCtrl;
    }
    class DashboardEditCtrl {
        $scope: IDashboardEditScope;
        private $mapService;
        private $layerService;
        private $messageBusService;
        private $dashboardService;
        private scope;
        dashboard: csComp.Services.Dashboard;
        hasParent: boolean;
        parent: string;
        static $inject: string[];
        constructor($scope: IDashboardEditScope, $mapService: csComp.Services.MapService, $layerService: csComp.Services.LayerService, $messageBusService: csComp.Services.MessageBusService, $dashboardService: csComp.Services.DashboardService);
        updateHasParent(): void;
        toggleTimeline(): void;
        toggleLegend(): void;
        setExtent(): void;
        setVisibleLayers(): void;
        setBaseLayer(): void;
        toggleMap(): void;
        checkMap(): void;
        checkTimeline(): void;
        checkLegend(): void;
    }
}

declare module WidgetEdit {
    /**
      * Module
      */
    var myModule: any;
}

declare module WidgetEdit {
    import IWidget = csComp.Services.IWidget;
    interface IWidgetEditScope extends ng.IScope {
        widget: IWidget;
        vm: WidgetEditCtrl;
    }
    class WidgetEditCtrl {
        private $scope;
        private mapService;
        private layerService;
        private messageBusService;
        private dashboardService;
        private scope;
        static $inject: string[];
        constructor($scope: IWidgetEditScope, mapService: csComp.Services.MapService, layerService: csComp.Services.LayerService, messageBusService: csComp.Services.MessageBusService, dashboardService: csComp.Services.DashboardService);
        selectStyle(): void;
        removeWidget(widget: IWidget): void;
    }
}

declare module FeatureTypeEditor {
    /**
      * Module
      */
    var myModule: any;
}

declare module FeatureTypeEditor {
    import IFeature = csComp.Services.IFeature;
    interface IFeatureTypeEditorScope extends ng.IScope {
        vm: FeatureTypeEditorCtrl;
        data: IFeature;
        featureType: csComp.Services.IFeatureType;
        featureTypeId: string;
    }
    class FeatureTypeEditorCtrl {
        private $scope;
        private $layerService;
        private $messageBusService;
        private scope;
        selectedResourceUrl: string;
        selectedResource: csComp.Services.ITypesResource;
        static $inject: string[];
        constructor($scope: IFeatureTypeEditorScope, $layerService: csComp.Services.LayerService, $messageBusService: csComp.Services.MessageBusService);
        /** force features to be updated */
        updateFeatureTypes(ft: csComp.Services.IFeatureType): void;
        /** apply updates to features, don't return or save back to api */
        apply(): void;
        cancel(): void;
        /** save a resource (back to api and update features) */
        saveFeatureType(): void;
    }
}

declare module FeatureTypes {
    /**
      * Module
      */
    var myModule: any;
}

declare module FeatureTypes {
    import IFeature = csComp.Services.IFeature;
    interface IFeatureTypesScope extends ng.IScope {
        vm: FeatureTypesCtrl;
        data: IFeature;
    }
    class FeatureTypesCtrl {
        private $scope;
        private $layerService;
        private $messageBusService;
        private scope;
        selectedResourceUrl: string;
        selectedResource: csComp.Services.ITypesResource;
        static $inject: string[];
        constructor($scope: IFeatureTypesScope, $layerService: csComp.Services.LayerService, $messageBusService: csComp.Services.MessageBusService);
        updateFeatureTypes(ft: csComp.Services.IFeatureType): void;
        selectResource(): void;
    }
}

declare module GroupEdit {
    /**
      * Module
      */
    var myModule: any;
}

declare module GroupEdit {
    interface IGroupEditScope extends ng.IScope {
        vm: GroupEditCtrl;
        group: csComp.Services.ProjectGroup;
    }
    class GroupEditCtrl {
        private $scope;
        private $mapService;
        private $layerService;
        private $messageBusService;
        private $dashboardService;
        private scope;
        noLayerSelected: boolean;
        static $inject: string[];
        constructor($scope: IGroupEditScope, $mapService: csComp.Services.MapService, $layerService: csComp.Services.LayerService, $messageBusService: csComp.Services.MessageBusService, $dashboardService: csComp.Services.DashboardService);
        updateLayers(): void;
        removeGroup(): void;
        toggleClustering(): void;
        updateOws(): void;
    }
}

declare module LayerEdit {
    /**
      * Module
      */
    var myModule: any;
}

declare module LayerEdit {
    interface ILayerEditScope extends ng.IScope {
        vm: LayerEditCtrl;
    }
    class LayerEditCtrl {
        private $scope;
        private $http;
        private $mapService;
        private $layerService;
        private $messageBusService;
        private $dashboardService;
        private scope;
        layer: csComp.Services.ProjectLayer;
        availabeTypes: {
            (key: string): csComp.Services.IFeatureType;
        };
        static $inject: string[];
        constructor($scope: ILayerEditScope, $http: ng.IHttpService, $mapService: csComp.Services.MapService, $layerService: csComp.Services.LayerService, $messageBusService: csComp.Services.MessageBusService, $dashboardService: csComp.Services.DashboardService);
        addLayer(): void;
        removeLayer(): void;
        addFeatureType(): void;
        getTypes(): void;
    }
}

declare module LayerEditor {
    /**
      * Module
      */
    var myModule: any;
}

declare module LayerEditor {
    interface ILayerEditorScope extends ng.IScope {
        vm: LayerEditorCtrl;
        layer: csComp.Services.ProjectLayer;
    }
    class LayerEditorCtrl {
        private $scope;
        private $http;
        private $mapService;
        private $layerService;
        private $messageBusService;
        private $dashboardService;
        private scope;
        layer: csComp.Services.ProjectLayer;
        availabeTypes: {
            (key: string): csComp.Services.IFeatureType;
        };
        static $inject: string[];
        constructor($scope: ILayerEditorScope, $http: ng.IHttpService, $mapService: csComp.Services.MapService, $layerService: csComp.Services.LayerService, $messageBusService: csComp.Services.MessageBusService, $dashboardService: csComp.Services.DashboardService);
        startDraw(featureType: csComp.Services.IFeatureType, event?: any): void;
        initDrag(key: string, layer: csComp.Services.ProjectLayer): void;
        deleteFeaturetype(type: csComp.Services.IFeatureType): void;
        editFeaturetype(type: csComp.Services.IFeatureType): void;
    }
}

declare module LayerSettings {
    /**
      * Module
      */
    var myModule: any;
}

declare module LayerSettings {
    interface ILayerSettingsScope extends ng.IScope {
        vm: LayerSettingsCtrl;
    }
    class LayerSettingsCtrl {
        private $scope;
        private $http;
        private $mapService;
        private $layerService;
        private $messageBusService;
        private $dashboardService;
        private scope;
        layer: csComp.Services.ProjectLayer;
        availabeTypes: {
            (key: string): csComp.Services.IFeatureType;
        };
        static $inject: string[];
        constructor($scope: ILayerSettingsScope, $http: ng.IHttpService, $mapService: csComp.Services.MapService, $layerService: csComp.Services.LayerService, $messageBusService: csComp.Services.MessageBusService, $dashboardService: csComp.Services.DashboardService);
        saveLayer(): void;
        removeLayer(): void;
        addFeatureType(): void;
        getTypes(): void;
    }
}

declare module PropertyTypes {
    /**
      * Module
      */
    var myModule: any;
}

declare module PropertyTypes {
    interface IPropertyTypesScope extends ng.IScope {
        vm: PropertyTypesCtrl;
        showMenu: boolean;
        showMenuEdit: boolean;
        filterProperty: any;
        propertyTypes: any;
        getSections: any;
        addSection: any;
        sections: any;
    }
    class PropertyTypesCtrl {
        private $scope;
        private $layerService;
        private $messageBusService;
        private scope;
        selectedResourceUrl: string;
        selectedResource: csComp.Services.ITypesResource;
        static $inject: string[];
        constructor($scope: IPropertyTypesScope, $layerService: csComp.Services.LayerService, $messageBusService: csComp.Services.MessageBusService);
        selectResource(): void;
        private editModeMessageReceived;
        /**
         * Callback function
         * @see {http://stackoverflow.com/questions/12756423/is-there-an-alias-for-this-in-typescript}
         * @see {http://stackoverflow.com/questions/20627138/typescript-this-scoping-issue-when-called-in-jquery-callback}
         * @todo {notice the strange syntax using a fat arrow =>, which is to preserve the this reference in a callback!}
         */
        private sidebarMessageReceived;
    }
}

declare module Agenda {
    /** Module */
    var myModule: any;
    interface IAgendaWidgetEditScope extends ng.IScope {
        vm: AgendaWidgetEditCtrl;
        data: AgendaData;
    }
    interface AgendaData {
        selectedLayerId: string;
    }
    class AgendaWidgetEditCtrl {
        private $scope;
        private $http;
        layerService: csComp.Services.LayerService;
        private messageBusService;
        private $timeout;
        private widget;
        private selectedLayer;
        private layers;
        static $inject: string[];
        constructor($scope: IAgendaWidgetEditScope, $http: ng.IHttpService, layerService: csComp.Services.LayerService, messageBusService: csComp.Services.MessageBusService, $timeout: ng.ITimeoutService);
        update(): void;
    }
}

declare module Agenda {
    /** Module */
    var myModule: any;
    interface IAgendaWidgetScope extends ng.IScope {
        vm: AgendaWidgetCtrl;
        data: AgendaData;
    }
    interface IAgendaItem {
        title: string;
        description: string;
        startTime: Date;
        endTime: Date;
    }
    /**
     * The agenda widget does two things:
     * - it shows the relations of the currently selected feature, if any, as an agenda.
     * - it analyses a layer, if the 'agenda' tag is present in the ProjectLayer, for all events, i.e.
     *   features with a start and end time, and displays them on the timeline.
     */
    class AgendaWidgetCtrl {
        private $scope;
        private $http;
        layerService: csComp.Services.LayerService;
        private messageBusService;
        private $timeout;
        private widget;
        private selectedLayer;
        private agenda;
        private title;
        static $inject: string[];
        constructor($scope: IAgendaWidgetScope, $http: ng.IHttpService, layerService: csComp.Services.LayerService, messageBusService: csComp.Services.MessageBusService, $timeout: ng.ITimeoutService);
        private clearAgenda();
        private updateAgenda(feature);
        private getProperty(feature, prop, defaultValue?);
    }
}

declare module ButtonWidget {
    /** Module */
    var myModule: any;
    interface IButtonWidgetMessage {
        name: string;
        httpMethod: {
            name: string;
        };
        url: string;
        message: string;
        description: string;
    }
    interface ButtonWidgetEditorData {
        messages: IButtonWidgetMessage[];
        /** Set to true to show a smaller widget, with only the messages and an execute button */
        smallSize: boolean;
    }
    interface IButtonWidgetEditScope extends ng.IScope {
        vm: ButtonWidgetEditCtrl;
        selectedMessage: IButtonWidgetMessage;
        data: ButtonWidgetEditorData;
        methods: [{
            name: string;
        }];
    }
    class ButtonWidgetEditCtrl {
        private $scope;
        private $timeout;
        private $messageBus;
        private $dashboardService;
        private scope;
        widget: csComp.Services.IWidget;
        static $inject: string[];
        constructor($scope: IButtonWidgetEditScope, $timeout: ng.ITimeoutService, $messageBus: csComp.Services.MessageBusService, $dashboardService: csComp.Services.DashboardService);
        addMessage(): void;
        deleteMessage(): void;
    }
}

declare module ButtonWidget {
    /** Module */
    var myModule: any;
    interface IButtonWidgetScope extends ng.IScope {
        vm: ButtonWidgetCtrl;
        data: IButtonData;
        buttons: IButton[];
        activeIndex: number;
    }
    interface IButtonWidget {
        id: string;
        name: string;
    }
    interface IButton {
        title: string;
        description: string;
        moreInfo: string;
        action: string;
        buttongroup: string;
        tag: string;
        layer: string;
        group: string;
        timerange: string;
        property: string;
        showLegend: boolean;
        image: string;
        defaultEnabled: boolean;
        zoomLevel: number;
        _legend: csComp.Services.Legend;
        _layer: csComp.Services.ProjectLayer;
        _feature: csComp.Services.Feature;
        _featureIcon: string;
        _disabled: boolean;
        _active: boolean;
        _firstLegendLabel: string;
        _lastLegendLabel: string;
        _canEdit: boolean;
        _visible: boolean;
        _groupbuttons: IButton[];
    }
    interface IButtonData {
        buttons: IButton[];
        /** The minimal layout just displays a button, without a legend */
        minimalLayout: boolean;
        toggleMode: boolean;
        /** Apply extended style information to image, e.g. add rounded corners */
        extStyle: Object;
        layerGroup: string;
        featureLayer: string;
    }
    class ButtonWidgetCtrl {
        private $scope;
        private $http;
        layerService: csComp.Services.LayerService;
        private messageBusService;
        private actionService;
        private $timeout;
        private $sce;
        private activeGroups;
        private activeGroupsCollection;
        static $inject: string[];
        constructor($scope: IButtonWidgetScope, $http: ng.IHttpService, layerService: csComp.Services.LayerService, messageBusService: csComp.Services.MessageBusService, actionService: csComp.Services.ActionService, $timeout: ng.ITimeoutService, $sce: ng.ISCEService);
        private initButtons();
        private initFeatureLayer();
        private initLayerGroup();
        switchButtonGroup(b: IButton): void;
        private checkFeatureLayer();
        private checkLayerGroup();
        private checkBaselayer(b);
        /** start or stop editing, when starting all features are editable */
        toggleEditLayer(b: IButton): void;
        private updateLegendLabels(b);
        private checkLayer(b);
        private checkStyle(b);
        checkLegend(b: IButton): void;
        click(b: IButton): void;
        toggleFilter(le: csComp.Services.LegendEntry, group: string, prop: string): void;
    }
}

declare module ChartsWidget {
    /**
      * Module
      */
    var myModule: any;
    interface IChartsEditCtrl extends ng.IScope {
        vm: ChartsEditCtrl;
        data: any;
        spec: string;
    }
    class ChartsEditCtrl {
        private $scope;
        private $timeout;
        private $compile;
        private $layerService;
        private $templateCache;
        private $messageBus;
        private $mapService;
        private $dashboardService;
        private scope;
        widget: csComp.Services.IWidget;
        editor: any;
        static $inject: string[];
        constructor($scope: IChartsEditCtrl, $timeout: ng.ITimeoutService, $compile: ng.ICompileService, $layerService: csComp.Services.LayerService, $templateCache: ng.ITemplateCacheService, $messageBus: csComp.Services.MessageBusService, $mapService: csComp.Services.MapService, $dashboardService: csComp.Services.DashboardService);
        setupEditor(): void;
        loadChart(): void;
        updateChart(): void;
        refreshChart(): void;
    }
}

declare module ChartsWidget {
    /**
      * Module
      */
    var myModule: any;
}

declare module ChartsWidget {
    class ChartData {
        title: string;
        /**
         * Content to display: you can either provide it directly, or specify a URL, in which case it will replace the content.
         */
        content: string;
        key: string;
        lite: boolean;
        spec: any;
        _spec: any;
        generator: any;
        _id: string;
        _view: any;
        _csv: any;
    }
    interface IChartScope extends ng.IScope {
        vm: ChartCtrl;
        data: ChartData;
        spec: string;
    }
    class ChartCtrl implements csComp.Services.IWidgetCtrl {
        $scope: IChartScope;
        private $timeout;
        private $layerService;
        private $messageBus;
        private $mapService;
        private $dashboardService;
        private scope;
        widget: csComp.Services.BaseWidget;
        private parentWidget;
        private generator;
        private defaultSpec;
        static $inject: string[];
        constructor($scope: IChartScope, $timeout: ng.ITimeoutService, $layerService: csComp.Services.LayerService, $messageBus: csComp.Services.MessageBusService, $mapService: csComp.Services.MapService, $dashboardService: csComp.Services.DashboardService);
        private keyHandle;
        startEdit(): void;
        goFullscreen(): void;
        getOptions(): any[];
        savePng(): void;
        initChart(): void;
        updateChart(): void;
        startChart(): void;
    }
}

declare module AreaFilter {
    import IFeature = csComp.Services.IFeature;
    import IActionOption = csComp.Services.IActionOption;
    class AreaFilterModel implements csComp.Services.IActionService {
        id: string;
        private layerService;
        stop(): void;
        addFeature(feature: IFeature): void;
        removeFeature(feature: IFeature): void;
        selectFeature(feature: IFeature): void;
        addLayer(layer: csComp.Services.IProjectLayer): void;
        removeLayer(layer: csComp.Services.IProjectLayer): void;
        getLayerActions(layer: csComp.Services.IProjectLayer): any;
        getFeatureActions(feature: IFeature): IActionOption[];
        getFeatureHoverActions(feature: IFeature): IActionOption[];
        deselectFeature(feature: IFeature): void;
        updateFeature(feuture: IFeature): void;
        private setAsFilter(feature, layerService);
        private resetFilter(feature, layerService);
        init(layerService: csComp.Services.LayerService): void;
    }
}

declare module Filters {
    interface IAreaFilterScope extends ng.IScope {
        vm: AreaFilterCtrl;
        filter: csComp.Services.GroupFilter;
        options: Function;
        removeString: string;
    }
    class AreaFilterCtrl {
        $scope: IAreaFilterScope;
        private $layerService;
        private $messageBus;
        private $timeout;
        private $translate;
        private scope;
        private widget;
        private dcChart;
        private helperDim;
        private helperGroup;
        private isInsideFunction;
        private isEmpty;
        static $inject: string[];
        constructor($scope: IAreaFilterScope, $layerService: csComp.Services.LayerService, $messageBus: csComp.Services.MessageBusService, $timeout: ng.ITimeoutService, $translate: ng.translate.ITranslateService);
        setAreaFilter(f: any): void;
        initAreaFilter(): void;
        updateAreaFilter(feat: csComp.Services.IFeature, triggerRender?: boolean): void;
        remove(): void;
    }
}

declare module Filters {
    interface IBarFilterScope extends ng.IScope {
        vm: BarFilterCtrl;
        filter: csComp.Services.GroupFilter;
        options: Function;
        editMode: boolean;
        removeString: string;
        createScatterString: string;
    }
    class BarFilterCtrl {
        $scope: IBarFilterScope;
        private $layerService;
        private $messageBus;
        private $timeout;
        private $translate;
        private scope;
        private widget;
        static $inject: string[];
        constructor($scope: IBarFilterScope, $layerService: csComp.Services.LayerService, $messageBus: csComp.Services.MessageBusService, $timeout: ng.ITimeoutService, $translate: ng.translate.ITranslateService);
        private createScatter(gf);
        private displayFilterRange(min, max);
        private dcChart;
        initBarFilter(): void;
        private updateFilter();
        updateRange(): void;
        remove(): void;
    }
}

declare module Filters {
    interface IBoolFilterScope extends ng.IScope {
        vm: BoolFilterCtrl;
        filter: csComp.Services.GroupFilter;
    }
    class BoolFilterCtrl {
        $scope: IBoolFilterScope;
        private $layerService;
        private $messageBus;
        private scope;
        private widget;
        static $inject: string[];
        constructor($scope: IBoolFilterScope, $layerService: csComp.Services.LayerService, $messageBus: csComp.Services.MessageBusService);
        initBoolFilter(): void;
        updateBoolFilter(): void;
        remove(): void;
    }
}

declare module Filters {
    interface IDateFilterScope extends ng.IScope {
        vm: DateFilterCtrl;
        filter: csComp.Services.GroupFilter;
    }
    class DateFilterCtrl {
        $scope: IDateFilterScope;
        private $layerService;
        private $messageBus;
        private scope;
        private widget;
        switch: string;
        private subHandle;
        static $inject: string[];
        constructor($scope: IDateFilterScope, $layerService: csComp.Services.LayerService, $messageBus: csComp.Services.MessageBusService);
        select(): void;
        private check(d);
        initTextFilter(): void;
        updateDateFilter(): void;
        remove(): void;
    }
}

declare module Filters {
    interface ILocationFilterScope extends ng.IScope {
        vm: LocationFilterCtrl;
        filter: csComp.Services.GroupFilter;
        options: Function;
        removeString: string;
    }
    class LocationFilterCtrl {
        $scope: ILocationFilterScope;
        private $layerService;
        private $messageBus;
        private $timeout;
        private $translate;
        private scope;
        private widget;
        private locationFilter;
        private dcChart;
        private helperDim;
        private helperGroup;
        private isEmpty;
        static $inject: string[];
        constructor($scope: ILocationFilterScope, $layerService: csComp.Services.LayerService, $messageBus: csComp.Services.MessageBusService, $timeout: ng.ITimeoutService, $translate: ng.translate.ITranslateService);
        setLocationFilter(): void;
        initLocationFilter(): void;
        updateLocationFilter(bounds: any, triggerRender?: boolean): void;
        remove(): void;
    }
}

declare module Filters {
    interface IRowFilterScope extends ng.IScope {
        vm: RowFilterCtrl;
        filter: csComp.Services.GroupFilter;
        options: Function;
        removeString: string;
        createScatterString: string;
        saveAsImageString: string;
    }
    class RowFilterCtrl {
        $scope: IRowFilterScope;
        private $layerService;
        private $messageBus;
        private $timeout;
        private $translate;
        private scope;
        private widget;
        /** To export a filter, canvg can be used. Due to its size it is not included in csWeb by default,
         *  you need to add it to your csWeb-App. When you have added it, a save-icon will appear in the filter.
         * canvg is available from https://github.com/gabelerner/canvg */
        private exporterAvailable;
        static $inject: string[];
        constructor($scope: IRowFilterScope, $layerService: csComp.Services.LayerService, $messageBus: csComp.Services.MessageBusService, $timeout: ng.ITimeoutService, $translate: ng.translate.ITranslateService);
        private createScatter(gf);
        private dcChart;
        initRowFilter(): void;
        private ensureAllBins(source_group, fake_group);
        private updateFilter();
        updateRange(): void;
        remove(): void;
        exportToImage(): void;
    }
}

declare module Filters {
    interface IScatterFilterScope extends ng.IScope {
        vm: ScatterFilterCtrl;
        filter: csComp.Services.GroupFilter;
        options: Function;
        editMode: boolean;
    }
    class ScatterFilterCtrl {
        $scope: IScatterFilterScope;
        private $layerService;
        private $messageBus;
        private $timeout;
        private scope;
        private widget;
        static $inject: string[];
        constructor($scope: IScatterFilterScope, $layerService: csComp.Services.LayerService, $messageBus: csComp.Services.MessageBusService, $timeout: ng.ITimeoutService);
        private displayFilterRange(min, max);
        private dcChart;
        private addScatterFilter();
        private updateFilter();
        updateRange(): void;
        remove(): void;
    }
}

declare module Filters {
    /**
      * Module
      */
    var myModule: any;
}

declare module Filters {
    interface ITextFilterScope extends ng.IScope {
        vm: TextFilterCtrl;
        filter: csComp.Services.GroupFilter;
    }
    class TextFilterCtrl {
        $scope: ITextFilterScope;
        private $layerService;
        private $messageBus;
        private scope;
        private widget;
        static $inject: string[];
        constructor($scope: ITextFilterScope, $layerService: csComp.Services.LayerService, $messageBus: csComp.Services.MessageBusService);
        initTextFilter(): void;
        updateTextFilter(): void;
        remove(): void;
    }
}

declare module FilterStyleWidget {
    /**
      * Module
      */
    var myModule: any;
}

declare module FilterStyleWidget {
    class FilterStyleWidgetData {
        title: string;
    }
    interface IFilterStyleWidgetScope extends ng.IScope {
        vm: FilterStyleWidgetCtrl;
        data: FilterStyleWidgetData;
        style: csComp.Services.GroupStyle;
        filter: csComp.Services.GroupFilter;
        minimized: boolean;
        selectedFeature: csComp.Services.IFeature;
    }
    class FilterStyleWidgetCtrl {
        private $scope;
        private $timeout;
        private $translate;
        private $layerService;
        private $messageBus;
        private $mapService;
        private scope;
        private widget;
        private parentWidget;
        private mBusHandles;
        private exporterAvailable;
        static $inject: string[];
        constructor($scope: IFilterStyleWidgetScope, $timeout: ng.ITimeoutService, $translate: ng.translate.ITranslateService, $layerService: csComp.Services.LayerService, $messageBus: csComp.Services.MessageBusService, $mapService: csComp.Services.MapService);
        private canMinimize();
        private minimize();
        private canClose();
        private close();
        stop(): void;
        private selectFeature(feature);
        private createChart();
        private updateChart();
        private updateRowFilterScope(gf);
        exportToImage(): void;
    }
}

declare module FocusTimeWidget {
    /** Module */
    var myModule: any;
    interface IButtonWidgetScope extends ng.IScope {
        vm: FocusTimeWidgetCtrl;
        data: IFocusTimeData;
    }
    interface IFocusTimeWidget {
        id: string;
        name: string;
    }
    interface IFocusTimeData {
        mode: string;
        layer: string;
        tags: any[];
        activeTag: string;
    }
    class FocusTimeWidgetCtrl {
        private $scope;
        private $http;
        layerService: csComp.Services.LayerService;
        private messageBusService;
        private $timeout;
        disabled: boolean;
        active: boolean;
        layer: csComp.Services.ProjectLayer;
        time: number;
        endTime: number;
        dateFormat: string;
        timeFormat: string;
        private handle;
        isOpen: boolean;
        private timeOptions;
        static $inject: string[];
        constructor($scope: IButtonWidgetScope, $http: ng.IHttpService, layerService: csComp.Services.LayerService, messageBusService: csComp.Services.MessageBusService, $timeout: ng.ITimeoutService);
        openCalendar(e: Event): void;
        lastHour(): void;
        lastDay(): void;
        setTag(tag: string): void;
        checkLayerTimestamp(): void;
    }
}

declare module HeaderWidget {
    /**
      * Module
      */
    var myModule: any;
}

declare module HeaderWidget {
    class HeaderWidgetData {
        title: string;
        subTitle: string;
        autoShow: boolean;
        /**
         * Content to display: you can either provide it directly, or specify a URL, in which case it will replace the content.
         */
        content: string;
        url: string;
        /**
         * Allows you to provide a link to a text file containing a list of properties (i.e. key-value pairs). When the keys
         * are stated in the markdown content (between curly braces {{KEY}}), they will be replaced by the value.
         */
        dataSourceUrl: string;
        /**
         * Set true to use translate the content. To use it, create a separate file
         * for each language and add a pre-extension to the file corresponding to the language code, e.g.
         * data/mycontent.en.txt or data/mycontent.nl.txt . The url should then be "data/mycontent.txt"
         */
        useLanguagePrefix: boolean;
        /**
         * The actual content is being converted, if necessary, and set to the markdown text.
         */
        mdText: string;
        /**
         * If provided, indicates the feature type that needs to be selected in order to show the widget.
         */
        featureTypeName: string;
        /**
         * If provided, a list of properties that need to be injected into the content in order to generate the mdText.
         */
        dynamicProperties: string[];
    }
    interface IHeaderWidgetScope extends ng.IScope {
        vm: HeaderWidgetCtrl;
        data: HeaderWidgetData;
        minimized: boolean;
    }
    class HeaderWidgetCtrl {
        private $scope;
        private $timeout;
        private $layerService;
        private $messageBus;
        private $mapService;
        private scope;
        private widget;
        private parentWidget;
        private dataProperties;
        static $inject: string[];
        constructor($scope: IHeaderWidgetScope, $timeout: ng.ITimeoutService, $layerService: csComp.Services.LayerService, $messageBus: csComp.Services.MessageBusService, $mapService: csComp.Services.MapService);
        showContent(): void;
    }
}

declare module InfoWidget {
    /**
      * Module
      */
    var myModule: any;
    class InfoWidgetData {
        title: string;
        subTitle: string;
        /**
         * Content to display: you can either provide it directly, or specify a URL, in which case it will replace the content.
         */
        content: string;
        url: string;
        /**
         * Allows you to provide a link to a text file containing a list of properties (i.e. key-value pairs). When the keys
         * are stated in the markdown content (between curly braces {{KEY}}), they will be replaced by the value.
         */
        dataSourceUrl: string;
        /**
         * Set true to use translate the content. To use it, create a separate file
         * for each language and add a pre-extension to the file corresponding to the language code, e.g.
         * data/mycontent.en.txt or data/mycontent.nl.txt . The url should then be "data/mycontent.txt"
         */
        useLanguagePrefix: boolean;
        /**
         * The actual content is being converted, if necessary, and set to the markdown text.
         */
        mdText: string;
        /**
         * If provided, indicates the feature type that needs to be selected in order to show the widget.
         */
        featureTypeName: string;
        /**
         * If provided, a list of properties that need to be injected into the content in order to generate the mdText.
         */
        dynamicProperties: string[];
    }
    interface IInfoWidgetScope extends ng.IScope {
        vm: InfoWidgetCtrl;
        data: InfoWidgetData;
        minimized: boolean;
    }
    class InfoWidgetCtrl {
        private $scope;
        private $timeout;
        private $layerService;
        private $messageBus;
        private $mapService;
        private scope;
        private widget;
        private parentWidget;
        private dataProperties;
        static $inject: string[];
        constructor($scope: IInfoWidgetScope, $timeout: ng.ITimeoutService, $layerService: csComp.Services.LayerService, $messageBus: csComp.Services.MessageBusService, $mapService: csComp.Services.MapService);
    }
}

declare module IFrameWidget {
    /**
      * Module
      */
    var myModule: any;
    interface IIFrameEditCtrl extends ng.IScope {
        vm: IFrameEditCtrl;
        data: any;
    }
    class IFrameEditCtrl {
        private $scope;
        private $sce;
        private scope;
        widget: csComp.Services.IWidget;
        static $inject: string[];
        constructor($scope: IIFrameEditCtrl, $sce: any);
        update(): void;
    }
}

declare module IFrameWidget {
    /**
      * Module
      */
    var myModule: any;
}

declare module IFrameWidget {
    class IFrameWidgetData {
        title: string;
        url: string;
        width: number;
        height: number;
        _safeurl: string;
    }
    interface IIFrameWidgetScope extends ng.IScope {
        vm: IFrameWidgetCtrl;
        data: IFrameWidgetData;
    }
    class IFrameWidgetCtrl {
        private $scope;
        private $sce;
        private scope;
        private widget;
        private parentWidget;
        static $inject: string[];
        constructor($scope: IIFrameWidgetScope, $sce: any);
        update(): void;
    }
}

declare module Indicators {
    /**
      * Module
      */
    var myModule: any;
    interface IVisualInput {
        type: string;
        default: Object;
    }
    interface IVisualType {
        id: string;
        title: string;
        input: any;
    }
    interface IIndicatorsEditCtrl extends ng.IScope {
        vm: IndicatorsEditCtrl;
        data: IndicatorData;
    }
    class IndicatorsEditCtrl {
        private $scope;
        private $timeout;
        private $compile;
        private $layerService;
        private $templateCache;
        private $messageBus;
        private $mapService;
        private $dashboardService;
        private scope;
        private widget;
        private selectedIndicatorVisual;
        indicatorVisuals: {
            [key: string]: IVisualType;
        };
        private featureType;
        private propertyTypes;
        private propertyTypeData;
        static $inject: string[];
        constructor($scope: IIndicatorsEditCtrl, $timeout: ng.ITimeoutService, $compile: any, $layerService: csComp.Services.LayerService, $templateCache: any, $messageBus: csComp.Services.MessageBusService, $mapService: csComp.Services.MapService, $dashboardService: csComp.Services.DashboardService);
        colorUpdated(c: any, i: any): void;
        updatePropertyTypes(indic: Indicator): void;
        moveUp(i: Indicator): void;
        deleteIndicator(i: string): void;
        updateIndicator(i: Indicator): void;
        initIndicator(i: Indicator): void;
        updateVisual(i: Indicator): void;
        addIndicator(): void;
        sensorChanged(i: Indicator): void;
    }
}

declare module Indicators {
    /**
      * Module
      */
    var myModule: any;
}

declare module Indicators {
    class IndicatorData {
        title: string;
        orientation: string;
        indicators: Indicator[];
    }
    class Indicator {
        title: string;
        visual: string;
        type: string;
        featureTypeName: string;
        propertyTypes: string[];
        propertyTypeTitles: string[];
        data: string;
        indicatorWidth: number;
        property: string;
        sensor: string;
        _sensorSet: csComp.Services.SensorSet;
        layer: string;
        /** Dashboard to select after click */
        dashboard: string;
        source: string;
        isActive: boolean;
        id: string;
        color: string;
        indexValue: number;
        _focusTime: number;
        _toggleUpdate: boolean;
        _value: any;
        inputs: {
            [key: string]: any;
        };
        _result: {
            [key: string]: any;
        };
        constructor();
    }
    interface IIndicatorsScope extends ng.IScope {
        vm: IndicatorsCtrl;
        data: IndicatorData;
    }
    class IndicatorsCtrl implements csComp.Services.IWidgetCtrl {
        private $scope;
        private $timeout;
        private $layerService;
        private $messageBus;
        private $mapService;
        private $dashboardService;
        private $translate;
        private scope;
        private widget;
        static $inject: string[];
        constructor($scope: IIndicatorsScope, $timeout: ng.ITimeoutService, $layerService: csComp.Services.LayerService, $messageBus: csComp.Services.MessageBusService, $mapService: csComp.Services.MapService, $dashboardService: csComp.Services.DashboardService, $translate: ng.translate.ITranslateService);
        forceUpdateIndicator(i: Indicator, value: any): void;
        updateIndicator(i: Indicator): void;
        startEdit(): void;
        private checkLayers();
        selectIndicator(i: Indicator): void;
        indicatorInit(i: Indicator, scope: any): void;
        private selectFeature(f, i);
    }
}

declare module LocationWidget {
    /** Module */
    var myModule: any;
    interface ILocationWidgetScope extends ng.IScope {
        vm: LocationWidgetCtrl;
        data: ILocationData;
    }
    interface ILocationWidget {
        id: string;
        name: string;
    }
    interface ILocationData {
        /** Street view API key: https://developers.google.com/maps/documentation/streetview/get-api-key#get-an-api-key */
        streetViewApiKey: string;
        /** Optionally, specify the StreetView url, e.g. https://maps.googleapis.com/maps/api/streetview */
        streetViewUrl: string;
        showCoordinates: boolean;
        showSunMoonRise: boolean;
    }
    interface LocationInfo {
        title?: string;
        address?: string;
        postcode?: string;
        city?: string;
        neighbourhood?: string;
        sunrise?: string;
        sunset?: string;
        locations?: string[];
        defaultLocation?: string;
        streetViewUrlThumb?: string;
        streetViewUrlFull?: string;
    }
    class LocationWidgetCtrl {
        private $scope;
        private $http;
        layerService: csComp.Services.LayerService;
        private messageBusService;
        private actionService;
        private $timeout;
        private streetViewUrl;
        private parentWidget;
        private location;
        private selectedLocationFormat;
        static $inject: string[];
        constructor($scope: ILocationWidgetScope, $http: ng.IHttpService, layerService: csComp.Services.LayerService, messageBusService: csComp.Services.MessageBusService, actionService: csComp.Services.ActionService, $timeout: ng.ITimeoutService);
        private updateWidget(data);
        private close();
    }
}

declare module Markdown {
    /**
      * Module
      */
    var myModule: any;
    interface IMarkdownEditCtrl extends ng.IScope {
        vm: MarkdownEditCtrl;
        data: any;
    }
    class MarkdownEditCtrl {
        private $scope;
        private $timeout;
        private $compile;
        private $layerService;
        private $templateCache;
        private $messageBus;
        private $mapService;
        private $dashboardService;
        private scope;
        widget: csComp.Services.IWidget;
        static $inject: string[];
        constructor($scope: IMarkdownEditCtrl, $timeout: ng.ITimeoutService, $compile: any, $layerService: csComp.Services.LayerService, $templateCache: any, $messageBus: csComp.Services.MessageBusService, $mapService: csComp.Services.MapService, $dashboardService: csComp.Services.DashboardService);
        updateText(): void;
    }
}

declare module MarkdownWidget {
    /**
      * Module
      */
    var myModule: any;
}

declare module MarkdownWidget {
    class MarkdownWidgetData {
        title: string;
        /**
         * Content to display: you can either provide it directly, or specify a URL, in which case it will replace the content.
         */
        content: string;
        url: string;
        /**
         * Allows you to provide a link to a text file containing a list of properties (i.e. key-value pairs). When the keys
         * are stated in the markdown content (between curly braces {{KEY}}), they will be replaced by the value.
         */
        dataSourceUrl: string;
        /**
         * Set true to use translate the content. To use it, create a separate file
         * for each language and add a pre-extension to the file corresponding to the language code, e.g.
         * data/mycontent.en.txt or data/mycontent.nl.txt . The url should then be "data/mycontent.txt"
         */
        useLanguagePrefix: boolean;
        /**
         * The actual content is being converted, if necessary, and set to the markdown text.
         */
        mdText: string;
        /**
         * If provided, indicates the feature type that needs to be selected in order to show the widget.
         */
        featureTypeName: string;
        /**
         * If provided, a list of properties that need to be injected into the content in order to generate the mdText.
         */
        dynamicProperties: string[];
    }
    interface IMarkdownWidgetScope extends ng.IScope {
        vm: MarkdownWidgetCtrl;
        data: MarkdownWidgetData;
        minimized: boolean;
        lastSelectedFeature: IFeature;
    }
    class MarkdownWidgetCtrl {
        private $scope;
        private $timeout;
        private $layerService;
        private $messageBus;
        private $mapService;
        private scope;
        private widget;
        private parentWidget;
        private dataProperties;
        private msgBusHandle;
        /** To export a markdownwidget, jsPDF can be used. Due to its size it is not included in csWeb by default,
         *  you need to add it to your csWeb-App. When you have added it, a save-icon will appear in the widget.
         * jsPDF is available from https://github.com/MrRio/jsPDF */
        private exporterAvailable;
        static $inject: string[];
        constructor($scope: IMarkdownWidgetScope, $timeout: ng.ITimeoutService, $layerService: csComp.Services.LayerService, $messageBus: csComp.Services.MessageBusService, $mapService: csComp.Services.MapService);
        private canMinimize();
        private minimize();
        private canClose();
        private close();
        stop(): void;
        private escapeRegExp(str);
        private replaceAll(str, find, replace);
        private selectFeature(feature);
        private replaceKeys();
        private exportToPDF();
    }
}

declare module MarvelWidget {
    /**
      * Module
      */
    var myModule: any;
}

declare module MarvelWidget {
    class MarvelWidgetData {
        title: string;
        /** Folder containing the marvel diagrams */
        marvelFolder: string;
        /**
         * If provided, indicates the feature type that needs to be selected in order to show the widget.
         */
        featureTypeName: string;
    }
    interface IDependency {
        label: string;
        type: string;
    }
    interface IMarvelWidgetScope extends ng.IScope {
        vm: MarvelWidgetCtrl;
        data: MarvelWidgetData;
        minimized: boolean;
        editmode: boolean;
        selectedFeature: csComp.Services.IFeature;
        dependencyTypes: {
            [key: string]: IDependency;
        };
        states: string[];
    }
    class MarvelWidgetCtrl {
        private $scope;
        private $timeout;
        private $translate;
        private $layerService;
        private $messageBus;
        private $mapService;
        private scope;
        private widget;
        private parentWidget;
        private defaultStates;
        static $inject: string[];
        constructor($scope: IMarvelWidgetScope, $timeout: ng.ITimeoutService, $translate: ng.translate.ITranslateService, $layerService: csComp.Services.LayerService, $messageBus: csComp.Services.MessageBusService, $mapService: csComp.Services.MapService);
        private initDependencies();
        private minimize();
        private edit();
        private close();
        /** Save single feature update by sending it to the server over the messageBus  */
        private save();
        /** Save all features of the selected feature's featureType. Set a property
          * 'changeAllFeaturesOfType' to inform the simservice that all features
          * should be updated.
          */
        private saveAll();
        private escapeRegExp(str);
        private replaceAll(str, find, replace);
        private addDependency(id, dep);
        private addDependencyFeature(dep);
        private removeDependencyFeature(dep, name);
        private selectFeature(feature);
    }
}

declare module MCAWidget {
    /**
      * Module
      */
    var myModule: any;
}

declare module MCAWidget {
    class MCAWidgetData {
        title: string;
        /**
         * If provided, indicates the layer that needs to be enabled in order to show the widget.
         */
        layerId: string;
        /**
         * The available mca's
         */
        availableMcas: Mca.Models.Mca[];
        /**
         * Instead of listing all available mca's, filter those that have a featureId that equals the
         * defaultFeatureType of an enabled layer.
         */
        filterByDefaultFeatureType: boolean;
    }
    interface IMCAWidgetScope extends ng.IScope {
        vm: MCAWidgetCtrl;
        data: MCAWidgetData;
    }
    class MCAWidgetCtrl {
        private $scope;
        private $timeout;
        private $controller;
        private $layerService;
        private $messageBus;
        private $mapService;
        private scope;
        private widget;
        private parentWidget;
        private mcaScope;
        selectedMCA: string;
        static $inject: string[];
        constructor($scope: IMCAWidgetScope, $timeout: ng.ITimeoutService, $controller: ng.IControllerService, $layerService: csComp.Services.LayerService, $messageBus: csComp.Services.MessageBusService, $mapService: csComp.Services.MapService);
        private activateLayer(layer);
        private getMcaScope();
        private setMcaAsStyle(mcaId);
    }
}

declare module NavigatorWidget {
    /**
      * Module
      */
    var myModule: any;
}

declare module NavigatorWidget {
    class NavigatorWidgetData {
        title: string;
        /**
         * Content to display: you can either provide it directly, or specify a URL, in which case it will replace the content.
         */
        content: string;
        url: string;
        /**
         * The actual content is being converted, if necessary, and set to the markdown text.
         */
        mdText: string;
        /**
         * If provided, indicates the feature type that needs to be selected in order to show the widget.
         */
        featureTypeName: string;
        /**
         * If provided, a list of properties that need to be injected into the content in order to generate the mdText.
         */
        dynamicProperties: string[];
    }
    interface INavigatorWidgetScope extends ng.IScope {
        vm: NavigatorWidgetCtrl;
        data: NavigatorWidgetData;
    }
    class NavigatorWidgetCtrl {
        private $scope;
        private $timeout;
        private $layerService;
        private $messageBus;
        private $mapService;
        private scope;
        private widget;
        private parentWidget;
        static $inject: string[];
        constructor($scope: INavigatorWidgetScope, $timeout: ng.ITimeoutService, $layerService: csComp.Services.LayerService, $messageBus: csComp.Services.MessageBusService, $mapService: csComp.Services.MapService);
    }
}

declare module PostMan {
    /** Module */
    var myModule: any;
}

declare module PostMan {
    /** Module */
    var myModule: any;
}

declare module PostMan {
    interface IPostManScope extends ng.IScope {
        vm: PostManCtrl;
        data: PostManEditorData;
        selectedMessage: IPostManMessage;
    }
    class PostManCtrl {
        private $scope;
        private $http;
        private messageBusService;
        private $timeout;
        private result;
        static $inject: string[];
        constructor($scope: IPostManScope, $http: ng.IHttpService, messageBusService: csComp.Services.MessageBusService, $timeout: ng.ITimeoutService);
        execute(): void;
    }
}

declare module PostMan {
    interface IPostManMessage {
        name: string;
        httpMethod: {
            name: string;
        };
        url: string;
        message: string;
        description: string;
    }
    interface PostManEditorData {
        messages: IPostManMessage[];
        /** Set to true to show a smaller widget, with only the messages and an execute button */
        smallSize: boolean;
    }
    interface IPostManEditScope extends ng.IScope {
        vm: PostManEditCtrl;
        selectedMessage: IPostManMessage;
        data: PostManEditorData;
        methods: [{
            name: string;
        }];
    }
    class PostManEditCtrl {
        private $scope;
        private $timeout;
        private $messageBus;
        private $dashboardService;
        private scope;
        widget: csComp.Services.IWidget;
        static $inject: string[];
        constructor($scope: IPostManEditScope, $timeout: ng.ITimeoutService, $messageBus: csComp.Services.MessageBusService, $dashboardService: csComp.Services.DashboardService);
        addMessage(): void;
        deleteMessage(): void;
    }
}

declare module Presentation {
    /**
     * This service keeps the presentation state, so that when we switch between tabs,
     * we don't loose any information.
     */
    class PresentationService {
        private $rootScope;
        private layerService;
        private messageBusService;
        private dashboardService;
        /** All slides, from all open layers, grouped by layer id. */
        presentations: {
            [key: string]: IPresentation;
        };
        /** The active slides for each widget, where each key represents a widget's id. */
        activePresentation: {
            [key: string]: IPresentation;
        };
        static $inject: string[];
        constructor($rootScope: ng.IRootScopeService, layerService: csComp.Services.LayerService, messageBusService: csComp.Services.MessageBusService, dashboardService: csComp.Services.DashboardService);
        /** Initialize the layer by creating an initial presentation */
        private createPresentation(layer);
        /** Add the slides from the project layer */
        private addSlidesFromLayer(layer);
        /** Remove the slides from the project layer */
        private removeSlidesFromLayer(layer);
        /** Update all slides in the layer */
        save(layer: csComp.Services.ProjectLayer): void;
        isFirstPresentation(presentation: IPresentation): boolean;
        isLastPresentation(presentation: IPresentation): boolean;
        /** Get the next or the previous presentation, if any */
        getNextPrevPresentation(activeSlides: IPresentation, isNext: boolean): IPresentation;
    }
    /**
      * Module
      */
    var myModule: any;
}

declare module Presentation {
    /** Module */
    var myModule: any;
    interface IPresentationWidgetEditScope extends ng.IScope {
        vm: PresentationWidgetEditCtrl;
        data: PresentationData;
    }
    interface PresentationData {
    }
    class PresentationWidgetEditCtrl {
        private $scope;
        private $http;
        layerService: csComp.Services.LayerService;
        private messageBusService;
        private $timeout;
        private widget;
        private selectedLayer;
        private layers;
        static $inject: string[];
        constructor($scope: IPresentationWidgetEditScope, $http: ng.IHttpService, layerService: csComp.Services.LayerService, messageBusService: csComp.Services.MessageBusService, $timeout: ng.ITimeoutService);
        update(): void;
    }
}

declare module Presentation {
    /** Module */
    var myModule: any;
    interface IPresentationWidgetScope extends ng.IScope {
        vm: PresentationWidgetCtrl;
        data: PresentationData;
    }
    interface PresentationData {
        selectedLayerId: string;
    }
    /** Describes a feature's slide information property */
    interface ISlide {
        /** Reference to feature that holds the _slide property. */
        featureId?: string;
        /** For ordering the slides */
        index?: number;
        /** HTML string with the content, including images */
        content?: string;
        /** Bounding box which holds the map view to show */
        boundingBox?: csComp.Services.IBoundingBox;
    }
    /** Collection of slides and layer title */
    interface IPresentation {
        /** Layer title */
        title: string;
        /** Slides */
        slides: ISlide[];
    }
    /**
     * The presentation widget is inspired by ESRI Storymaps, collects slides from all enabled layers, which you can show one by one.
     * The slides are stored in the GeoJSON, as part of regular features, in the _slide property, which is of type ISlide.
     */
    class PresentationWidgetCtrl {
        private $scope;
        private layerService;
        private messageBusService;
        private presentationService;
        private widget;
        private selectedLayer;
        /** The index of the active slide */
        private activeSlideIndex;
        /** The active/visible slide */
        private activeSlide;
        /** The active layer, used as a source for slides */
        private activeLayerId;
        /** Are we in edit mode */
        private isEditing;
        static $inject: string[];
        constructor($scope: IPresentationWidgetScope, layerService: csComp.Services.LayerService, messageBusService: csComp.Services.MessageBusService, presentationService: PresentationService);
        /** The active slides from one layer */
        private activePresentation;
        private updateActiveSlide();
        private selectSlide(index);
        private isFirstSlide;
        private isLastSlide;
        private isActiveSlide(index);
        private nextSlide();
        private previousSlide();
        private isFirstPresentation;
        private isLastPresentation;
        private nextPresentation();
        private previousPresentation();
        private toggleEdit();
        private addSlide();
        private reindexSlides();
        private deleteSlide();
        private saveLocation();
        private save();
    }
}

declare module RangeWidget {
    /**
      * Module
      */
    var myModule: any;
}

declare module RangeWidget {
    class RangeWidgetData {
        title: string;
        groupId: string;
        propId: string;
    }
    interface IRangeWidgetScope extends ng.IScope {
        vm: RangeWidgetCtrl;
        data: RangeWidgetData;
        style: csComp.Services.GroupStyle;
        filter: csComp.Services.GroupFilter;
        minimized: boolean;
        selectedFeature: csComp.Services.IFeature;
    }
    class RangeWidgetCtrl {
        private $scope;
        private $timeout;
        private $translate;
        private $layerService;
        private $messageBus;
        private $mapService;
        private scope;
        private widget;
        private parentWidget;
        private mBusHandles;
        private filterDim;
        private filterGroup;
        private filterValue;
        private group;
        static $inject: string[];
        constructor($scope: IRangeWidgetScope, $timeout: ng.ITimeoutService, $translate: ng.translate.ITranslateService, $layerService: csComp.Services.LayerService, $messageBus: csComp.Services.MessageBusService, $mapService: csComp.Services.MapService);
        private minimize();
        private canClose();
        private close();
        stop(): void;
        private selectFeature(feature);
        private createFilter(groupId);
        private applyFilter();
    }
}

declare module SimState {
    /** Module */
    var myModule: any;
    interface ISimStateEditScope extends ng.IScope {
        vm: SimStateEditCtrl;
    }
    class SimStateEditCtrl {
        private $scope;
        private $http;
        private messageBusService;
        private $timeout;
        static $inject: string[];
        constructor($scope: ISimStateEditScope, $http: ng.IHttpService, messageBusService: csComp.Services.MessageBusService, $timeout: ng.ITimeoutService);
    }
}

declare module SimState {
    /** Module */
    var myModule: any;
    interface ISimStateScope extends ng.IScope {
        vm: SimStateCtrl;
    }
    interface ISimState {
        id: string;
        name: string;
        state: string;
        time: Date;
        msg?: string;
    }
    class SimStateCtrl {
        private $scope;
        private $http;
        private messageBusService;
        private $timeout;
        private states;
        static $inject: string[];
        constructor($scope: ISimStateScope, $http: ng.IHttpService, messageBusService: csComp.Services.MessageBusService, $timeout: ng.ITimeoutService);
    }
}

declare module SimTimeController {
    /**
      * Module
      */
    var myModule: any;
}

declare module SimTimeController {
    /**
      * Module
      */
    var myModule: any;
}

declare module SimTimeController {
    enum PlayState {
        Stopped = 0,
        Playing = 1,
        Paused = 2,
    }
    enum SimCommand {
        Start = 0,
        Pause = 1,
        Stop = 2,
        Run = 3,
        Finish = 4,
        Exit = 5,
    }
    interface ISimTimeMessage {
        simTime: string;
        simSpeed: string;
        simCmd: string;
        type: string;
    }
    interface ISimTimeControllerScope extends ng.IScope {
        vm: SimTimeControllerCtrl;
    }
    class SimTimeControllerCtrl {
        private $scope;
        private $http;
        private messageBusService;
        private $timeout;
        private timeSinceSimulationStart;
        timeSinceStartString: string;
        private scope;
        private fsm;
        /** REST endpoint method */
        private httpMethod;
        /** REST endpoint */
        private url;
        private speed;
        /** Start time, e.g. when restarting */
        private startTime;
        /** Current time */
        private time;
        private editorData;
        private isOpen;
        private timeOptions;
        isPlaying: boolean;
        isPaused: boolean;
        isStopped: boolean;
        private messageBusHandle;
        static $inject: string[];
        constructor($scope: ISimTimeControllerScope, $http: ng.IHttpService, messageBusService: csComp.Services.MessageBusService, $timeout: ng.ITimeoutService);
        private updateTimeSinceSimStart();
        private subscribeToSimTime();
        play(): void;
        pause(): void;
        stop(): void;
        increaseSpeed(): void;
        decreaseSpeed(): void;
        setSpeed(newSpeed: number): void;
        setTime(newTime: number): void;
        openCalendar(e: Event): void;
        private speedChanged();
        private sendSimTimeMessage(cmd);
    }
}

declare module SimTimeController {
    interface SimTimeControllerEditorData {
        httpMethod: {
            name: string;
        };
        url: string;
        message: string;
    }
    interface ISimTimeControllerEditCtrl extends ng.IScope {
        vm: SimTimeControllerEditCtrl;
        data: SimTimeControllerEditorData;
        methods: [{
            name: string;
        }];
    }
    /** Controller class for the SimTimeController editor */
    class SimTimeControllerEditCtrl {
        private $scope;
        private $timeout;
        private $messageBus;
        private $dashboardService;
        private scope;
        widget: csComp.Services.IWidget;
        editor: any;
        static $inject: string[];
        constructor($scope: ISimTimeControllerEditCtrl, $timeout: ng.ITimeoutService, $messageBus: csComp.Services.MessageBusService, $dashboardService: csComp.Services.DashboardService);
    }
}

declare module TableWidget {
    /**
      * Module
      */
    var myModule: any;
}

declare module TableWidget {
    interface ITableDefinition {
        /** Number of columns */
        nrOfCols: number;
        /** Number of rows */
        nrOfRows: number;
        /** Headers of each column */
        columnHeaders: string[];
        /** Titles of each row */
        rowTitles: string[];
        /**
         * Content grid of the table: you can either provide it directly, or specify a URL, in which case it will replace the content.
         */
        datagrid: string[][];
        /**
         * Allows for defining a style for each cell of the datagrid.
         */
        stylegrid: string[][];
    }
    class TableWidgetData {
        title: string;
        /**
         * Table content definition: you can either provide it directly, or specify a URL, in which case it will replace the content.
         */
        content: ITableDefinition;
        url: string;
        /**
         * Allows you to provide a link to a text file containing a list of properties (i.e. key-value pairs). When the keys
         * are stated in the markdown content (between curly braces {{KEY}}), they will be replaced by the value.
         */
        dataSourceUrl: string;
        /**
         * Set true to use translate the content. To use it, create a separate file
         * for each language and add a pre-extension to the file corresponding to the language code, e.g.
         * data/mycontent.en.txt or data/mycontent.nl.txt . The url should then be "data/mycontent.txt"
         */
        useLanguagePrefix: boolean;
        /**
         * The actual table with headers and content
         */
        tableHtml: string;
        /**
         * If provided, indicates the feature type that needs to be selected in order to show the widget.
         */
        featureTypeName: string;
        /**
         * If provided, a list of properties that need to be injected into the content in order to generate the table.
         */
        dynamicProperties: string[];
        /**
         * If provided, shows a caption under the table
         */
        caption: string[];
    }
    interface ITableWidgetScope extends ng.IScope {
        vm: TableWidgetCtrl;
        data: TableWidgetData;
        minimized: boolean;
    }
    class TableWidgetCtrl {
        private $scope;
        private $timeout;
        private $layerService;
        private $messageBus;
        private $mapService;
        private $sce;
        private scope;
        private widget;
        private parentWidget;
        private dataProperties;
        static $inject: string[];
        constructor($scope: ITableWidgetScope, $timeout: ng.ITimeoutService, $layerService: csComp.Services.LayerService, $messageBus: csComp.Services.MessageBusService, $mapService: csComp.Services.MapService, $sce: ng.ISCEService);
        private createTable();
        private updateTable();
        private minimize();
        private canClose();
        private close();
        private escapeRegExp(str);
        private replaceAll(str, find, replace);
        private selectFeature(feature);
        private replaceKeys();
        toTrusted(html: string): string;
    }
}

declare module csComp.Services {
    /**
     * Describes the returned BING search result:
     * https://msdn.microsoft.com/en-us/library/ff701726.aspx
     */
    interface IBingSearchResult {
        authenticationResultCode?: string;
        brandLogoUri?: string;
        copyright?: string;
        resourceSets?: [{
            estimatedTotal?: number;
            resources?: IBingSearchResource[];
        }];
        statusCode: number;
        statusDescription?: string;
        traceId?: string;
    }
    interface IBingSearchResource {
        __type: string;
        /**
         * A bounding box is defined by two latitudes and two longitudes that represent the four sides of a
         * rectangular area on the Earth. Use the following syntax to specify a bounding box.
         * South Latitude, West Longitude, North Latitude, East Longitude
         */
        bbox?: number[];
        name?: string;
        /** The coordinates are double values that are separated by commas and are specified in the following order. */
        point?: {
            type: string;
            /** Coordinate of point in lat, lon */
            coordinates: number[];
        };
        /**
         * An address can contain the following fields: address line, locality, neighborhood, admin district,
         * admin district 2, formatted address, postal code and country or region. For descriptions see the
         */
        address?: {
            /** A string specifying the name of the landmark when there is a landmark associated with an address. */
            landmark?: string;
            /**
             * The official street line of an address relative to the area, as specified by the Locality,
             * or PostalCode, properties. Typical use of this element would be to provide a street
             * address or any official address.
             */
            addressLine?: string;
            /**
             * A string specifying the subdivision name in the country or region for an address. This
             * element is typically treated as the first order administrative subdivision, but in some
             * cases it is the second, third, or fourth order subdivision in a country, dependency, or region.
             */
            adminDistrict?: string;
            /**
             * A string specifying the subdivision name in the country or region for an address. This element
             * is used when there is another level of subdivision information for a location, such as the county.
             */
            adminDistrict2?: string;
            /** A string specifying the country or region name of an address. */
            countryRegion?: string;
            /**
             * A string specifying the two-letter ISO country code.
             * You must specify include=ciso2 in your request to return this ISO country code.
             */
            countryRegionIso2?: string;
            /** A string specifying the complete address. This address may not include the country or region. */
            formattedAddress?: string;
            /**
             * A string specifying the populated place for the address. This typically refers to a city,
             * but may refer to a suburb or a neighborhood in certain countries.
             */
            locality?: string;
            /** A string specifying the post code, postal code, or ZIP Code of an address. */
            postalCode?: string;
            /**
             * A string specifying the neighborhood for an address.
             * You must specify includeNeighborhood=1 in your request to return the neighborhood.
             */
            neighborhood?: string;
        };
        confidence?: string;
        entityType?: string;
        geocodePoints?: [{
            type: string;
            coordinates: number[];
            calculationMethod: string;
            usageTypes: string[];
        }];
        matchCodes?: string[];
    }
    class BingSearchAction extends BasicActionService {
        private $http;
        apiKey: string;
        searchUrl: string;
        data: {
            culture?: string;
            userLocation?: string;
        };
        private isReady;
        private debouncedFn;
        id: string;
        searchCache: {
            [query: string]: IBingSearchResult;
        };
        /**
         * @param  {string} apiKey: route to the search api (optional, followed by a |), and the Bing maps key (required)
         */
        constructor($http: angular.IHttpService, apiKey: string, searchUrl?: string, data?: {
            culture?: string;
            userLocation?: string;
        });
        init(layerService: csComp.Services.LayerService): void;
        search(query: ISearchQuery, result: SearchResultHandler): void;
        /** Create the geocode request uri and call it using JSONP. */
        private bingRestRequest(query, handler);
        /** JSONP callback wrapper */
        private callRestService(request, callback, handler, query);
        private geocodeCallback(result, handler, query);
        private swapLatLonInPoint(location);
        private onSelect(selectedItem);
    }
}

declare module csComp.Services {
    interface IEsriFeature {
        address?: string;
        location?: {
            x: number;
            y: number;
            z: number;
        };
        score?: number;
        attributes?: any;
    }
    interface IEsriSearchResult {
        spatialReference?: any;
        candidates?: IEsriFeature[];
    }
    class EsriBagSearchAction extends BasicActionService {
        private $http;
        apiKey: string;
        searchUrl: string;
        private data;
        private isReady;
        private debouncedFn;
        private queryUrl;
        id: string;
        searchCache: {
            [query: string]: IEsriSearchResult;
        };
        /**
         * @param  {string} apiKey: route to the search api (optional, followed by a |), and the Bing maps key (required)
         */
        constructor($http: angular.IHttpService, apiKey: string, searchUrl: string, data: {});
        init(layerService: csComp.Services.LayerService): void;
        search(query: ISearchQuery, result: SearchResultHandler): void;
        /** Create the geocode request uri and call it using JSONP. */
        private esriRestRequest(query, handler);
        /** JSONP callback wrapper */
        private callRestService(request, callback, handler, query);
        private geocodeCallback(result, handler, query);
        private convertRD(location);
        private onSelect(feature);
    }
}

declare module csComp.Services {
    import IFeature = csComp.Services.IFeature;
    class KeywordIndex {
        [key: string]: Entry[];
    }
    /** Description of the offline search index. */
    interface OfflineSearchIndex {
        project: {
            title: string;
            url: string;
            dynamic: boolean;
        };
        options: {
            propertyNames: string[];
            stopWords: string[];
        };
        layers: [{
            groupTitle: string;
            index: number;
            id: string;
            title: string;
            path: string;
            type: string;
            featureNames: string[];
        }];
        keywordIndex: KeywordIndex;
    }
    /** Result returned when looking something up in the index. */
    interface ILookupResult {
        title?: string;
        score: number;
        key: string;
        entries: Entry[];
    }
    /** An index entry that contains a search result. */
    class Entry {
        private v;
        constructor(layerIndexOrArray: Array<number> | number, featureIndex?: number, propertyIndex?: number);
        layerIndex: number;
        featureIndex: number;
    }
    class OfflineSearchResult {
        title: string;
        layerTitle: string;
        groupTitle: string;
        entry: Entry;
        score: number;
        firstInGroup: boolean;
        constructor(title: string, layerTitle: string, groupTitle: string, entry: Entry, score: number);
        toString(): string;
        fullTitle: string;
    }
    class OfflineSearchActions extends BasicActionService {
        private $http;
        private offlineSearchResult;
        private isReady;
        id: string;
        /**
         * @param  {string} projectUri: path to the project.json file
         */
        constructor($http: angular.IHttpService, projectUri: string);
        /** Load the offline search index from a json file. */
        private loadIndex(url);
        search(query: ISearchQuery, result: SearchResultHandler): void;
        /**
         * Get the features based on the entered text.
         */
        private getHits(text, resultCount?);
        /**
         * Merge the resuls of two keyword lookups by checking whether different entries refer
         * to the same layer and feature.
         * @result1 {ILookupResult[]}
         * @result2 {ILookupResult[]}
         */
        private mergeResults(result1, result2);
        /**
         * Do a fuzzy keyword comparison between the entered text and the list of keywords,
         * and return a subset.
         * @text: {string}
         */
        private getKeywordHits(text);
        init(layerService: csComp.Services.LayerService): void;
        onSelect(selectedItem: OfflineSearchResult): void;
        private selectFeatureById(layerId, featureIndex);
        selectFeature(feature: IFeature): void;
    }
}

declare module csComp.Services {
    import IFeature = csComp.Services.IFeature;
    /** The online search results should be an array of objects implementing this interface. */
    interface IOnlineSearchResult {
        title: string;
        description: string;
        /** Location should be a stringified IGeoJsonGeometry object of the location that should be zoomed to */
        location: string;
        /** Score of the search result ranging between [0...1] */
        score: number;
    }
    class OnlineSearchActions extends BasicActionService {
        private $http;
        private searchUrl;
        private isReady;
        id: string;
        /**
         * @param  {string} searchUrl: route to the search api
         */
        constructor($http: angular.IHttpService, searchUrl: string);
        search(query: ISearchQuery, result: SearchResultHandler): void;
        /**
         * Get the features based on the entered text.
         */
        private getHits(text, resultCount, cb);
        init(layerService: csComp.Services.LayerService): void;
        onSelect(selectedItem: IOnlineSearchResult): void;
        private selectFeatureById(layerId, featureIndex);
        selectFeature(feature: IFeature): void;
    }
}

declare module csComp.Services {
    interface IOCDFeature {
        geometry?: {
            lat: number;
            lng: number;
        };
        annotations: {
            DMS?: {
                lat: string;
                lng: string;
            };
            MGRS?: string;
            Maidenhead: string;
            Mercator?: {
                x: number;
                y: number;
            };
            OSM?: {
                edit_url: string;
                url: string;
            };
            callingcode: number;
            geohash: string;
            sun?: {
                rise?: {
                    /** UNIX timestamp. Multiply by 1000 to get the Javascript Date equivalent. */
                    apparent?: number;
                    /** UNIX timestamp. Multiply by 1000 to get the Javascript Date equivalent. */
                    astronomical?: number;
                    /** UNIX timestamp. Multiply by 1000 to get the Javascript Date equivalent. */
                    civil?: number;
                    /** UNIX timestamp. Multiply by 1000 to get the Javascript Date equivalent. */
                    nautical?: number;
                };
                set?: {
                    /** UNIX timestamp. Multiply by 1000 to get the Javascript Date equivalent. */
                    apparent?: number;
                    /** UNIX timestamp. Multiply by 1000 to get the Javascript Date equivalent. */
                    astronomical?: number;
                    /** UNIX timestamp. Multiply by 1000 to get the Javascript Date equivalent. */
                    civil?: number;
                    /** UNIX timestamp. Multiply by 1000 to get the Javascript Date equivalent. */
                    nautical?: number;
                };
            };
            timezone?: {
                name?: string;
                now_in_dst?: number;
                offset_sec?: number;
                offset_string?: number;
                short_name?: string;
            };
            what3words?: {
                words?: string;
            };
        };
        bounds: {
            southwest: {
                lat: number;
                lng: number;
            };
            northeast: {
                lat: number;
                lng: number;
            };
        };
        components?: {
            city?: string;
            city_district?: string;
            country?: string;
            country_code?: string;
            county?: string;
            postcode?: string;
            road?: string;
            house_number?: string;
            state?: string;
            state_district?: string;
            neighbourhood?: string;
            suburb?: string;
            pedestrian?: string;
        };
        confidence: number;
        formatted: string;
    }
    /**
     * Describes the returned BING search result:
     * https://geocoder.opencagedata.com/api#forward
     */
    interface IOCDSearchResult {
        type?: string;
        results?: IOCDFeature[];
    }
    class OpenCageDataSearchAction extends BasicActionService {
        private $http;
        apiKey: string;
        searchUrl: string;
        private data;
        private messageBus;
        private isReady;
        private debouncedFn;
        private queryUrl;
        id: string;
        searchCache: {
            [query: string]: IOCDSearchResult;
        };
        /**
         * @param  {string} apiKey: route to the search api (optional, followed by a |), and the Bing maps key (required)
         */
        constructor($http: angular.IHttpService, apiKey: string, searchUrl: string, data: {
            /** ISO Country code, e.g. "nl" */
            culture?: string;
            /** ISO language code, e.g. nl-NL */
            language?: string;
            /** This value will restrict the possible results to the supplied region (min long, min lat, max long, max lat). */
            bounds?: string;
            messageBus: MessageBusService;
        });
        init(layerService: csComp.Services.LayerService): void;
        /** Perform a reverse geocode query for the current point and publish the results. */
        private reverseGeocodeLookup(point);
        search(query: ISearchQuery, result: SearchResultHandler): void;
        /** Create the geocode request uri and call it using JSONP. */
        private ocdRestRequest(query, handler);
        /** JSONP callback wrapper */
        private callRestService(request, callback, handler, query);
        private geocodeCallback(result, handler, query);
        private swapLatLonInPoint(location);
        private onSelect(feature);
    }
}

declare module csComp.Services {
    class DatabaseSource implements ILayerSource {
        service: LayerService;
        title: string;
        layer: ProjectLayer;
        requiresLayer: boolean;
        constructor(service: LayerService);
        refreshLayer(layer: ProjectLayer): void;
        addLayer(layer: ProjectLayer, callback: (layer: ProjectLayer) => void): void;
        /** zoom to boundaries of layer */
        fitMap(layer: ProjectLayer): void;
        layerMenuOptions(layer: ProjectLayer): [[string, Function]];
        protected baseAddLayer(layer: ProjectLayer, callback: (layer: ProjectLayer) => void, isRefresh?: boolean): void;
        private initLayer(layer, callback);
        private updateLayer(layer, callback);
        removeLayer(layer: ProjectLayer): void;
    }
}

declare module csComp.Services {
    class GeoJsonSource implements ILayerSource {
        service: LayerService;
        $storage: ng.localStorage.ILocalStorageService;
        title: string;
        layer: ProjectLayer;
        requiresLayer: boolean;
        $http: ng.IHttpService;
        constructor(service: LayerService, $http: ng.IHttpService, $storage: ng.localStorage.ILocalStorageService);
        refreshLayer(layer: ProjectLayer): void;
        addLayer(layer: ProjectLayer, callback: (layer: ProjectLayer) => void, data?: any): void;
        /** zoom to boundaries of layer */
        fitMap(layer: ProjectLayer): void;
        /** zoom to boundaries of layer */
        fitTimeline(layer: ProjectLayer): void;
        layerMenuOptions(layer: ProjectLayer): [[string, Function]];
        protected baseAddLayer(layer: ProjectLayer, callback: (layer: ProjectLayer) => void, data?: any): void;
        protected initLayer(data: any, layer: ProjectLayer): void;
        removeLayer(layer: ProjectLayer): void;
        private processAccessibilityReply(data, layer, clbk);
    }
    class EditableGeoJsonSource extends GeoJsonSource {
        service: LayerService;
        title: string;
        constructor(service: LayerService, $http: ng.IHttpService, $storage: ng.localStorage.ILocalStorageService);
        updateFeatureByProperty(key: any, id: any, value: IFeature, layer?: ProjectLayer): void;
        deleteFeatureByProperty(key: any, id: any, value: IFeature, layer: ProjectLayer): void;
        addLayer(layer: ProjectLayer, callback: (layer: ProjectLayer) => void, data?: any): void;
        removeLayer(layer: ProjectLayer): void;
        layerMenuOptions(layer: ProjectLayer): [[string, Function]];
        /** enable edit mode for @layer and disable it for the others */
        startEditing(layer: csComp.Services.ProjectLayer): void;
        stopEditing(layer: csComp.Services.ProjectLayer): void;
        /** prepare layer for editing, add featuretypes to temp. _gui object */
        initAvailableFeatureTypesEditing(layer: csComp.Services.ProjectLayer): void;
    }
    class DynamicGeoJsonSource extends EditableGeoJsonSource {
        service: LayerService;
        title: "dynamicgeojson";
        connection: Connection;
        constructor(service: LayerService, $http: ng.IHttpService, $storage: ng.localStorage.ILocalStorageService);
        addLayer(layer: ProjectLayer, callback: (layer: ProjectLayer) => void, data?: any): void;
        removeLayer(layer: ProjectLayer): void;
        initSubscriptions(layer: ProjectLayer): void;
    }
    interface IOtpLeg {
        mode: string;
        start: string;
        arrive: string;
        duration: string;
        route?: string;
        routeName?: string;
        agency?: string;
    }
    class EsriJsonSource extends GeoJsonSource {
        service: LayerService;
        title: string;
        connection: Connection;
        $http: ng.IHttpService;
        constructor(service: LayerService, $http: ng.IHttpService, $storage: ng.localStorage.ILocalStorageService);
        addLayer(layer: ProjectLayer, callback: (layer: ProjectLayer) => void): void;
    }
}

declare module csComp.Services {
    interface IGridDataSourceParameters extends IProperty {
        /**
         * Grid type, for example 'custom' (default) or 'esri' ASCII Grid
         */
        gridType?: string;
        /**
         * Projection of the ESRI ASCII GRID
         */
        projection?: string;
        /**
         * Property name of the cell value of the generated json.
         */
        propertyName?: string;
        /**
         * Skip a comment line when it starts with this character
         */
        commentCharacter?: string;
        /**
         * Character that separates cells. Default is space.
         */
        separatorCharacter?: string;
        /**
         * Skip a number of lines from the start.
         */
        skipLines?: number;
        /**
         * Skip a number of lines after a comment block ends.
         */
        skipLinesAfterComment?: number;
        /**
         * Skip a number of spaces from the start of the line.
         */
        skipSpacesFromLine?: number;
        /**
         * Number of grid columns.
         */
        columns?: number;
        /**
         * Number of grid rows.
         */
        rows?: number;
        /**
         * Start latitude in degrees.
         */
        startLat?: number;
        /**
         * Start longitude in degrees.
         */
        startLon?: number;
        /**
         * Add deltaLat after processing a grid cell.
         * NOTE: When the direction is negative, use a minus sign e.g. when counting from 90 to -90..
         */
        deltaLat?: number;
        /**
         * Add deltaLon degrees after processing a grid cell.
         */
        deltaLon?: number;
        /**
         * Skip a first column, e.g. containing the latitude degree.
         */
        skipFirstColumn?: boolean;
        /**
         * Skip a first row, e.g. containing the longitude degree.
         */
        skipFirstRow?: boolean;
        /**
         * When the cell value is below this threshold, it is ignored.
         */
        minThreshold?: number;
        /**
        * When the cell value is above this threshold, it is ignored.
         */
        maxThreshold?: number;
        /**
         * The input values to be NoData in the output raster. Optional. Default is -9999.
         */
        noDataValue: number;
        /** If true, use the CONREC contouring algorithm to create isoline contours */
        useContour?: boolean;
        /** When using contours, this specifies the number of contour levels to use. */
        contourLevels?: number | number[];
        /** Define the color used to draw grid cells having the minimum value. */
        minColor?: string;
        /** Define the color used to draw grid cells having the maximum value. */
        maxColor?: string;
        /** When using the GridLayerRenderer, the cell colors can be chosen through a groupstyle. This will be the description the legend
         * accompanying that style.
         */
        legendDescription?: string;
        /** When using the GridLayerRenderer, the cell colors can be chosen through a groupstyle. This will be the stringformat the legend
         * entries accompanying that style.
         */
        legendStringFormat?: string;
        /** Optionally, a legend can be provided. This legend overrides the parameters that define a legend too (minColor, maxColor, legendDescription,
         * legendStringFormat). If it's not defined, a legend will be created from those 4 parameters and the contourLevels.
         */
        legend?: Legend;
    }
    /**
     * A GRID data source is a raster or grid in which the grid cells are delimited by spaces
     * and each newline indicates a new row of data.
     */
    class GridDataSource extends csComp.Services.GeoJsonSource {
        service: csComp.Services.LayerService;
        /** Convert a grid point to a Feature. Default implementation is to convert it to a square grid cell (convertPointToPolygon). */
        private convertDataToFeatureCollection;
        title: string;
        gridParams: IGridDataSourceParameters;
        constructor(service: csComp.Services.LayerService, $http: ng.IHttpService, $storage: ng.localStorage.ILocalStorageService);
        addLayer(layer: csComp.Services.ProjectLayer, callback: (layer: csComp.Services.ProjectLayer) => void): void;
        /**
         * Convert the ESRI ASCII GRID header to grid parameters.
         *
            ESRI ASCII Raster format
            The ESRI ASCII raster format can be used to transfer information to or from other cell-based or raster systems. When an existing raster is output to an ESRI ASCII format raster, the file will begin with header information that defines the properties of the raster such as the cell size, the number of rows and columns, and the coordinates of the origin of the raster. The header information is followed by cell value information specified in space-delimited row-major order, with each row seperated by a carraige return.
            In order to convert an ASCII file to a raster, the data must be in this same format. The parameters in the header part of the file must match correctly with the structure of the data values.
            The basic structure of the ESRI ASCII raster has the header information at the beginning of the file followed by the cell value data:
                NCOLS xxx
                NROWS xxx
                XLLCENTER xxx | XLLCORNER xxx
                YLLCENTER xxx | YLLCORNER xxx
                CELLSIZE xxx
                NODATA_VALUE xxx
                row 1
                row 2
                ...
                row n
            *
            Row 1 of the data is at the top of the raster, row 2 is just under row 1, and so on.
            Header format
            The syntax of the header information is a keyword paired with the value of that keyword. The definitions of the kewords are:
            *
            Parameter	Description	Requirements
            NCOLS	Number of cell columns.	Integer greater than 0.
            NROWS	Number of cell rows.	Integer greater than 0.
            XLLCENTER or XLLCORNER	X coordinate of the origin (by center or lower left corner of the cell).	Match with Y coordinate type.
            YLLCENTER or YLLCORNER	Y coordinate of the origin (by center or lower left corner of the cell).	Match with X coordinate type.
            CELLSIZE	Cell size.	Greater than 0.
            NODATA_VALUE	The input values to be NoData in the output raster.	Optional. Default is -9999.
            Data format
            The data component of the ESRI ASCII raster follows the header information.
            Cell values should be delimited by spaces.
            No carriage returns are necessary at the end of each row in the raster. The number of columns in the header determines when a new row begins.
            Row 1 of the data is at the top of the raster, row 2 is just under row 1, and so on.
         */
        private convertEsriHeaderToGridParams(input);
        /** Extract the grid data from the input */
        private getData(input);
        /**
         * Convert the incoming data to a matrix grid.
         * The incoming data can be in two formats: either it is a string, representing the ASCII grid data,
         * or it is an (ILayer) object, in which case the data should be in the input.data property.
         */
        private convertDataToGrid(input, gridParams);
        /**
         * Convert data to a set of isolines.
         */
        private convertDataToIsoLines(data, gridParams);
        /**
         * Convert data to a grid of square GeoJSON polygons, so each drawable point is converted to a square polygon.
         */
        private convertDataToPolygonGrid(data, gridParams);
    }
}

declare module csComp.Services {
    class HeatmapSource implements ILayerSource {
        service: LayerService;
        title: string;
        requiresLayer: boolean;
        heatmapModel: Heatmap.HeatmapModel;
        constructor(service: LayerService);
        refreshLayer(layer: ProjectLayer): void;
        layerMenuOptions(layer: ProjectLayer): [[string, Function]];
        addLayer(layer: ProjectLayer, callback: Function, data?: any): void;
        removeLayer(layer: ProjectLayer): void;
        enableProjectLayer(layer: ProjectLayer): void;
        getRequiredLayers(layer: ProjectLayer): ProjectLayer[];
        getFeatureTypes(layer: ProjectLayer): string[];
        generateHeatmap(layer: ProjectLayer): void;
    }
}

declare module csComp.Services {
    class HierarchySource implements ILayerSource {
        service: LayerService;
        title: string;
        layer: ProjectLayer;
        requiresLayer: boolean;
        $http: ng.IHttpService;
        constructor(service: LayerService, $http: ng.IHttpService);
        refreshLayer(layer: ProjectLayer): void;
        addLayer(layer: ProjectLayer, callback: Function, data?: any): void;
        fitMap(layer: ProjectLayer): void;
        layerMenuOptions(layer: ProjectLayer): [[string, Function]];
        getRequiredLayers(layer: ProjectLayer): ProjectLayer[];
        protected baseAddLayer(layer: ProjectLayer, callback: Function): void;
        removeLayer(layer: ProjectLayer): void;
    }
}

declare module csComp.Services {
    class KmlDataSource extends csComp.Services.GeoJsonSource {
        service: csComp.Services.LayerService;
        title: string;
        constructor(service: csComp.Services.LayerService, $http: ng.IHttpService, $storage: ng.localStorage.ILocalStorageService);
        private get(x, y);
        private attr(x, y);
        addLayer(layer: ProjectLayer, callback: (layer: ProjectLayer) => void): void;
        private convertGpxToGeoJSON(layer, gpx);
        private convertKmlToGeoJSON(layer, kml);
        private getIcon(layer, style);
        private getLineColor(style);
        private getLineWidth(style);
        private getFillColor(style);
    }
}

declare module csComp.Services {
    class MapboxVectorTileSource extends GeoJsonSource implements ILayerSource {
        service: LayerService;
        static CACHE_SIZE: number;
        title: string;
        layer: ProjectLayer;
        requiresLayer: boolean;
        tileCount: number;
        /** Store obtained results in the cache, */
        cache: {
            [key: string]: IGeoJsonFile | IGeoJsonCollection;
        };
        /** The urls that are cached (in order to keep the cache from only growing). */
        cachedUrls: string[];
        constructor(service: LayerService, $http: ng.IHttpService);
        addLayer(layer: ProjectLayer, callback: (layer: ProjectLayer) => void): void;
        /**
         * Add a received object to the cache, and, if full, delete an old entry.
         */
        private addToCache(url, data);
        private checkIfFinished(layer, callback);
        addFeatures(layer: ProjectLayer, data: IGeoJsonFile | IGeoJsonCollection, fromCache?: boolean): void;
        removeLayer(layer: ProjectLayer): void;
    }
}

declare module L {
    class Terminator extends L.Polygon {
        constructor(options?: Object);
    }
}
declare module csComp.Services {
    interface INightDayDataSourceParameters extends IProperty {
        /**
         * Show the night (default) or day area.
         */
        showNight: boolean;
        /** Title to show in the tooltip of the day area (default="Day")*/
        dayName: string;
        /** Title to show in the tooltip of the night area (default="Night")*/
        nightName: string;
        /**
         * Set a property value for the area (default: intensity = 0)
         */
        value: number;
    }
    class NightDayDataSource extends csComp.Services.GeoJsonSource {
        service: csComp.Services.LayerService;
        title: string;
        constructor(service: csComp.Services.LayerService, $http: ng.IHttpService, $storage: ng.localStorage.ILocalStorageService);
        addLayer(layer: csComp.Services.ProjectLayer, callback: (layer: csComp.Services.ProjectLayer) => void): void;
        private continueInit(defaultValue, layer, callback);
    }
}

declare module csComp.Services {
    class RssDataSource extends csComp.Services.GeoJsonSource {
        service: csComp.Services.LayerService;
        title: string;
        constructor(service: csComp.Services.LayerService, $http: ng.IHttpService, $storage: ng.localStorage.ILocalStorageService);
        addLayer(layer: csComp.Services.ProjectLayer, callback: (layer: csComp.Services.ProjectLayer) => void): void;
    }
}

declare module csComp.Services {
    class TileLayerSource implements ILayerSource {
        service: LayerService;
        title: string;
        requiresLayer: boolean;
        private prevDateTimes;
        constructor(service: LayerService);
        refreshLayer(layer: ProjectLayer): void;
        layerMenuOptions(layer: ProjectLayer): [[string, Function]];
        addLayer(layer: ProjectLayer, callback: Function, data?: any): void;
        removeLayer(layer: ProjectLayer): void;
    }
}

declare module csComp.Services {
    class VectorTileSource extends GeoJsonSource implements ILayerSource {
        service: LayerService;
        static CACHE_SIZE: number;
        title: string;
        layer: ProjectLayer;
        requiresLayer: boolean;
        tileCount: number;
        /** Store obtained results in the cache, */
        cache: {
            [key: string]: IGeoJsonFile | IGeoJsonCollection;
        };
        /** The urls that are cached (in order to keep the cache from only growing). */
        cachedUrls: string[];
        constructor(service: LayerService, $http: ng.IHttpService, $storage: ng.localStorage.ILocalStorageService);
        addLayer(layer: ProjectLayer, callback: (layer: ProjectLayer) => void): void;
        /**
         * Add a received object to the cache, and, if full, delete an old entry.
         */
        private addToCache(url, data);
        private checkIfFinished(layer, callback);
        addFeatures(layer: ProjectLayer, data: IGeoJsonFile | IGeoJsonCollection, fromCache?: boolean): void;
        removeLayer(layer: ProjectLayer): void;
    }
}

declare module csComp.Services {
    class WmsSource implements ILayerSource {
        service: LayerService;
        title: string;
        requiresLayer: boolean;
        delay: Function;
        constructor(service: LayerService);
        refreshLayer(layer: ProjectLayer): void;
        layerMenuOptions(layer: ProjectLayer): [[string, Function]];
        getUrl(layer: ProjectLayer, date: Date): string;
        addLayer(layer: ProjectLayer, callback: Function, data?: any): void;
        updateTime(layer: ProjectLayer, date: Date): void;
        removeLayer(layer: ProjectLayer): void;
    }
}

declare module L {
    interface IUserDrawSettings {
        /** Canvas element for drawing */
        canvas: HTMLCanvasElement;
        /** Bounds of the map in WGS84 */
        bounds: L.Bounds;
        /** Size of the map in pixels in x and y direction */
        size: {
            x: number;
            y: number;
        };
        /** Zoom scale, e.g. 0.0026 */
        zoomScale: number;
        /** Zoom level, e.g. 12 */
        zoom: number;
        options: {
            data: number[][];
            noDataValue: number;
            topLeftLat: number;
            topLeftLon: number;
            deltaLat: number;
            deltaLon: number;
            /** The minimum data value: below (<) this value, the cell is not drawn */
            min?: number;
            /** The maximum data value: above (>) this value, the cell is not drawn */
            max?: number;
            /** A value between 0 (transparent) and 1 (opaque) */
            opacity?: number;
            /** Define the color used to draw grid cells having the minimum value. */
            minColor: string;
            /** Define the color used to draw grid cells having the minimum value. */
            maxColor: string;
            /** Defines the contour levels of the grid layer */
            levels: number[];
            /** When true, forces a recalculatiion */
            areColorsUpdated: boolean;
            legend?: {
                val: number;
                color: string;
            }[];
            [key: string]: any;
        };
    }
    function canvasOverlay(userDrawFunc: (overlay: any, layer: csComp.Services.IProjectLayer, settings: IUserDrawSettings) => void, layer: csComp.Services.IProjectLayer, options: Object): any;
}

declare module csComp.Services {
    class GeojsonRenderer {
        static render(service: LayerService, layer: ProjectLayer, mapRenderer: IMapRenderer): void;
        static remove(service: LayerService, layer: ProjectLayer): void;
    }
}

declare module csComp.Services {
    class GridLayerRenderer {
        static render(service: LayerService, layer: ProjectLayer): void;
        static drawFunction(overlay: any, layer: ProjectLayer, settings: L.IUserDrawSettings): void;
    }
}

declare module csComp.Services {
    class HeatmapRenderer {
        static render(service: LayerService, layer: ProjectLayer, mapRenderer: LeafletRenderer): void;
    }
}

declare module csComp.Services {
    class MVTLayerRenderer {
        static render(service: LayerService, layer: ProjectLayer): void;
    }
}

declare module csComp.Services {
    class TileLayerRenderer {
        static render(service: LayerService, layer: ProjectLayer): void;
        /**
         * Add a UTF Grid Layer to the tilelayer.
         */
        static addUtfGrid(service: LayerService, layer: ProjectLayer, utfGridLayerUrl: string): void;
    }
}

declare module csComp.Services {
    class VectorTileRenderer {
        static render(service: LayerService, layer: ProjectLayer): void;
        static drawFunction(overlay: any, layer: ProjectLayer, settings: L.IUserDrawSettings): void;
    }
}

declare module csComp.Services {
    class WmsRenderer {
        static getUrl(layer: ProjectLayer, date: Date): string;
        static render(service: LayerService, layer: ProjectLayer): void;
    }
}

declare module csComp.Services {
    class CesiumRenderer implements IMapRenderer {
        title: string;
        service: LayerService;
        viewer: any;
        camera: any;
        scene: any;
        handler: any;
        features: {
            [key: string]: any;
        };
        private popup;
        private popupShownFor;
        init(service: LayerService): void;
        enable(baseLayer?: BaseLayer): void;
        getLatLon(x: number, y: number): {
            lat: number;
            lon: number;
        };
        refreshLayer(): void;
        getExtent(): csComp.Services.IBoundingBox;
        getZoom(): number;
        fitBounds(bounds: csComp.Services.IBoundingBox): void;
        setUpMouseHandlers(): void;
        disable(): void;
        changeBaseLayer(layer: BaseLayer): void;
        /** Specify the terrain provider to use, if any. */
        private setTerrainProvider(baseLayer);
        /** Create the background image type provider. */
        private createImageLayerProvider(layer);
        showFeatureTooltip(feature: IFeature, endPosition: any): void;
        addLayer(layer: ProjectLayer): JQueryPromise<{}>;
        removeLayer(layer: ProjectLayer): JQueryPromise<{}>;
        updateMapFilter(group: ProjectGroup): JQueryPromise<{}>;
        addGroup(group: ProjectGroup): void;
        removeGroup(group: ProjectGroup): void;
        removeFeature(feature: IFeature): void;
        removeFeatures(features: IFeature[]): JQueryPromise<{}>;
        updateFeature(feature: IFeature): void;
        /**
         * The feature height is either set in a property as defined in the style (heightProperty), or in a style. Otherwise, it is 0.
         * In either case, the effective style is calculated in LayerService.calculateFeatureStyle.
         */
        private getFeatureHeight(feature);
        private getHeightAboveSeaLevel(feature);
        private updateEntity(entity, feature);
        addFeature(feature: IFeature): void;
        selectFeature(feature: IFeature): void;
        createFeature(feature: IFeature): any;
        private createPolygon(coordinates);
        private createMultiPolygon(coordinates);
        private coordinatesArrayToCartesianArray(coordinates);
        private defaultCrsFunction(coordinates);
    }
}

declare module csComp.Services {
    class LeafletRenderer implements IMapRenderer {
        title: string;
        service: LayerService;
        $messageBusService: MessageBusService;
        map: L.Map;
        baseLayer: L.ILayer;
        private popup;
        private cntrlIsPressed;
        init(service: LayerService): void;
        enable(): void;
        disable(): void;
        private enableMap();
        private disableMap();
        private updateBoundingBox();
        getLatLon(x: number, y: number): {
            lat: number;
            lon: number;
        };
        getExtent(): csComp.Services.IBoundingBox;
        fitBounds(bounds: csComp.Services.IBoundingBox): void;
        getZoom(): number;
        refreshLayer(): void;
        addGroup(group: ProjectGroup): void;
        removeLayer(layer: ProjectLayer): void;
        changeBaseLayer(layerObj: BaseLayer, force?: boolean): void;
        private createBaseLayer(layerObj);
        private getLeafletStyle(style);
        addLayer(layer: ProjectLayer): void;
        /***
         * Update map markers in cluster after changing filter
         */
        updateMapFilter(group: ProjectGroup): void;
        removeGroup(group: ProjectGroup): void;
        removeFeature(feature: IFeature): void;
        updateFeature(feature: IFeature): void;
        selectFeature(feature: any): void;
        addFeature(feature: IFeature): any;
        private canDrag(feature);
        /**
         * add a feature
         */
        createFeature(feature: IFeature): any;
        /**
         * create icon based of feature style
         */
        getPointIcon(feature: IFeature): any;
        /**
         * Add a new entry to the tooltip.
         * @param  {string} content: existing HTML content
         * @param  {IFeature} feature: selected feature
         * @param  {string} property: selected property
         * @param  {IPropertyType} meta: meta info added to the group or style filter
         * @param  {string} title: title of the entry
         * @param  {boolean} isFilter: is true, if we need to add a filter icon, otherwise a style icon will be applied
         */
        private addEntryToTooltip(content, feature, property, meta, title, isFilter);
        generateTooltipContent(e: L.LeafletMouseEvent, group: ProjectGroup): {
            content: string;
            widthInPixels: number;
        };
        /**
         * Show tooltip with name, styles & filters.
         */
        showFeatureTooltip(e: L.LeafletMouseEvent, group: ProjectGroup): void;
        hideFeatureTooltip(e: L.LeafletMouseEvent): void;
        updateFeatureTooltip(e: L.LeafletMouseEvent): void;
    }
}
