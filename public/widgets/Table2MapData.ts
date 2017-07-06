module Table2Map {

    import IProperty = csComp.Services.IProperty;

    export enum IProjectRights {
        None = 0,
            Create = 1,
            Read = 2,
            Update = 4,
            Delete = 8,
            Author = 6,
            Manage = 15,
            Approve = 16,
            Assign = 32,
            Delegate = 64,
            Sign = 128,
            All = 255
    }

    export enum IChoosableProjectRights {
        NONE = IProjectRights.None,
            READ = IProjectRights.Read,
            AUTHOR = IProjectRights.Author,
            MANAGE = IProjectRights.Manage
    }

    export enum Decision {
        Deny = 0,
            Permit = 1
    }

    export interface IProjectUser {
        email: string;
        rights: IProjectRights;
        meta ? : any;
        $loki ? : any;
    }

    export interface Subject {
        email: string;
    }

    export interface Resource {
        id ? : string;
        domain ? : string;
        type ? : string;
    }

    export interface IBaseRule {
        desc ? : string;
        subject: Subject;
        action ? : Table2Map.IProjectRights;
        resource ? : Resource;
        meta ? : any;
        $loki ? : any;
    }

    export interface IPrivilegeRequest extends IBaseRule {
        decision: Decision;
    }

    export interface INameValueObject < T > {
        name: string;
        val: T;
    }

    export var DELIMITERS = {
        'auto': 'auto',
        ';': ';',
        '|': '|',
        ':': ':',
        ',': ',',
        'tab': '\t'
    };
    export var DECIMAL_CHARS = {
        '.': '.',
        ',': ','
    };
    export var PROPERTY_TYPES = {
        text: 'Tekst',
        number: 'Getal',
        options: 'Opties',
        date: 'Datum',
        url: 'Url',
        textarea: 'Lange tekst'
    };
    export var STRING_FORMATS = [{
        name: 'No_decimals',
        val: '{0:#,#}'
    }, {
        name: 'One_decimal',
        val: '{0:#,#.#}'
    }, {
        name: 'Two_decimals',
        val: '{0:#,#.##}'
    }, {
        name: 'Euro_no_decimals',
        val: '€{0:#,#}'
    }, {
        name: 'Euro_two_decimals',
        val: '€{0:#,#.##}'
    }, {
        name: 'Percentage_no_decimals',
        val: '{0:#,#}%'
    }, {
        name: 'Percentage_one_decimal',
        val: '{0:#,#.#}%'
    }, {
        name: 'Percentage_two_decimals',
        val: '{0:#,#.##}%'
    }, {
        name: 'Percentage_four_decimals',
        val: '{0:#,#.####}%'
    }];

    export var GEOMETRY_TYPES: Dictionary < ITable2MapGeometryType > = {
        'Provincie': {
            name: 'Provincie',
            cols: ['Provincienaam of -code'],
            drawingMode: 'Polygon',
            additionalInfo: ['', 'CBS']
        },
        'Gemeente(2016)': {
            name: 'Gemeente(2016)',
            cols: ['Gemeentenaam of -code'],
            drawingMode: 'Polygon',
            additionalInfo: ['', 'CBS']
        },
        'Gemeente(2015)': {
            name: 'Gemeente(2015)',
            cols: ['Gemeentenaam of -code'],
            drawingMode: 'Polygon',
            additionalInfo: ['', 'CBS']
        },
        'Buurt(2016)': {
            name: 'Buurt(2016)',
            cols: ['Buurtcode'],
            drawingMode: 'Polygon',
            additionalInfo: []
        },
        'Buurt(2014)': {
            name: 'Buurt(2014)',
            cols: ['Buurtcode'],
            drawingMode: 'Polygon',
            additionalInfo: []
        },
        'Adres': {
            name: 'Postcode 6 / huisnummer / letter / toevoeging',
            cols: ['Postcode 6', 'Huisnummer', 'Huisletter', 'Huisnummertoevoeging'],
            drawingMode: 'Point',
            additionalInfo: ['', 'Bouwjaar']
        },
        'Adres_simple': {
            name: 'Postcode 6 / huisnummer (+ toevoeging)',
            cols: ['Postcode 6', 'Huisnummer (+ toevoeging)'],
            drawingMode: 'Point',
            additionalInfo: ['', 'Bouwjaar']
        },
        'OpenStreetMap': {
            name: 'Vrij zoeken (OpenStreetMap)',
            cols: ['Zoekveld'],
            drawingMode: 'Point',
            additionalInfo: []
        },
        'Latitude_and_longitude': {
            name: 'Lat-long coordinaten',
            cols: ['lat', 'lng'],
            drawingMode: 'Point',
            additionalInfo: []
        },
        'RD_X_en_Y': {
            name: 'RD coordinaten',
            cols: ['X', 'Y'],
            drawingMode: 'Point',
            additionalInfo: []
        },
    };

    export function getServerGeometryType(id: string, additional: string): string {
        let serverGeometryType = '';
        switch (id) {
            case 'Adres':
            case 'Adres_simple':
                if (!additional) {
                    serverGeometryType = 'Postcode6_en_huisnummer';
                } else if (additional === 'Bouwjaar') {
                    serverGeometryType = 'Postcode6_en_huisnummer_met_bouwjaar';
                } else if (additional === 'BAG') {
                    serverGeometryType = 'Postcode6_en_huisnummer_met_bag';
                } else if (additional === 'Woningtype') {
                    serverGeometryType = 'Postcode6_en_huisnummer_met_bag_en_woningtype';
                }
                break;
            default:
                serverGeometryType = id;
                break;
        }
        return serverGeometryType;
    }

    export function getBrowserGeometryType(id: string): string {
        let browserGeometryType = '';
        switch (id) {
            case 'Postcode6_en_huisnummer':
                browserGeometryType = 'Adres_simple';
                break;
            case 'Postcode6_en_huisnummer_met_bouwjaar':
            case 'Postcode6_en_huisnummer_met_bag_en_woningtype':
            case 'Postcode6_en_huisnummer_met_bag':
                browserGeometryType = 'Adres';
                break;
            default:
                browserGeometryType = id;
                break;
        }
        return browserGeometryType;
    }

    export interface Table2MapLayerDefinition {
        projectTitle: string;
        reference: string;
        group: string;
        layerTitle: string;
        description: string;
        featureType: string;
        geometryType: string;
        parameter1: string;
        parameter2: string;
        parameter3: string;
        parameter4: string;
        iconUri: string;
        iconSize: number;
        drawingMode: string;
        fillColor: string;
        strokeColor: string;
        selectedStrokeColor: string;
        strokeWidth: number;
        isEnabled: boolean;
        clusterLevel: number;
        useClustering: boolean;
        opacity: number;
        nameLabel: string;
        includeOriginalProperties: boolean;
        defaultFeatureType: string;
        defaultLegendProperty: string;
        geometryFile: string;
        geometryKey: string;
    }

    export interface Table2MapPropertyType {
        label ? : string;
        title ? : string;
        description ? : string;
        type ? : string;
        section ? : string;
        stringFormat ? : string;
        visibleInCallOut ? : boolean;
        canEdit ? : boolean;
        filterType ? : string;
        isSearchable ? : boolean;
        minValue ? : number;
        maxValue ? : number;
        defaultValue ? : number;
        count ? : number;
        calculation ? : string;
        subject ? : string;
        target ? : string;
        targetlayers ? : string[];
        targetproperty ? : string;
        options ? : string[];
        activation ? : string;
        targetid ? : string;
    }

    export interface Table2MapLayerTemplate {
        layerDefinition: Table2MapLayerDefinition[];
        propertyTypes: IPropertyType[];
        properties: IProperty[];
        sensors ? : IProperty[];
        projectId ? : string;
        projectLogo ? : string;
        iconBase64 ? : string;
        logoBase64 ? : string;
    }

    export function getDefaultFileExtensions() {
        return {
            'data': ['csv', 'mat', 'xlsx'],
            'icon': ['png'],
            'logo': ['png']
        };
    }

    export function getDefaultFeature(): csComp.Services.Feature {
        return <csComp.Services.Feature > {
            type: 'Feature',
            geometry: {
                coordinates: null,
                type: null
            },
            properties: {},
            _gui: {},
            isSelected: false
        };
    }

    export function getDefaultIconData() {
        return 'data:image/png;base64,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';
    }

    export function getDefaultIconUri() {
        return 'images/marker.png';
    }

    export function defaultHeaders(total: number): string[] {
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