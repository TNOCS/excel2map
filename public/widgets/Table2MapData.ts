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
        text: 'string',
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
        'Provincie': {
            name: 'Provincie',
            nrCols: 1,
            drawingMode: 'Polygon'
        },
        'Gemeente': {
            name: 'Gemeente',
            nrCols: 1,
            drawingMode: 'Polygon'
        },
        'Adres': {
            name: 'Adres',
            nrCols: 4,
            drawingMode: 'Point'
        },
        'WMO': {
            name: 'WMO-regio',
            nrCols: 1,
            drawingMode: 'Polygon'
        },
        'latlong': {
            name: 'Lat-long coordinaten',
            nrCols: 2,
            drawingMode: 'Point'
        },
        'RD': {
            name: 'RD coordinaten',
            nrCols: 2,
            drawingMode: 'Point'
        },
    };
}