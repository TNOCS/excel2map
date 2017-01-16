module Table2Map {
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
        text: 'text',
        number: 'number',
        options: 'options',
        date: 'date',
        url: 'url',
        textarea: 'textarea'
    };
    export var STRING_FORMATS = {
        'No_decimals': '{0:#,#}',
        'One_decimal': '{0:#,#.#}',
        'Two_decimals': '{0:#,#.##}',
        'Euro_no_decimals': '€{0:#,#}',
        'Euro_two_decimals': '€{0:#,#.00}',
        'Percentage_no_decimals': '{0:#,#}%',
        'Percentage_one_decimal': '{0:#,#.#}%',
        'Percentage_two_decimals': '{0:#,#.##}%',
        'Percentage_four_decimals': '{0:#,#.####}%'
    };
    export var GEOMETRY_TYPES: Dictionary < ITable2MapGeometryType > = {
        'ProvincieNaam': {
            name: 'Provincie op naam',
            cols: ['Provincie-naam'],
            drawingMode: 'Polygon'
        },
        'ProvincieCode': {
            name: 'Provincie op code',
            cols: ['Provincie-code'],
            drawingMode: 'Polygon'
        },
        'GemeenteNaam': {
            name: 'Gemeente op naam',
            cols: ['Gemeente-naam'],
            drawingMode: 'Polygon'
        },
        'GemeenteCode': {
            name: 'Gemeente op code',
            cols: ['Gemeente-code'],
            drawingMode: 'Polygon'
        },
        'Adres': {
            name: 'Adres',
            cols: ['Postcode 6', 'Huisnummer', 'Huisletter', 'Huisnummertoevoeging'],
            drawingMode: 'Point'
        },
        'OpenStreetMap': {
            name: 'OpenStreetMap zoek',
            cols: ['Zoekveld'],
            drawingMode: 'Point'
        },
        'WMO': {
            name: 'WMO-regio',
            cols: ['WMO regionaam'],
            drawingMode: 'Polygon'
        },
        'latlong': {
            name: 'Lat-long coordinaten',
            cols: ['lat', 'lng'],
            drawingMode: 'Point'
        },
        'RD': {
            name: 'RD coordinaten',
            cols: ['X', 'Y'],
            drawingMode: 'Point'
        },
    };
}