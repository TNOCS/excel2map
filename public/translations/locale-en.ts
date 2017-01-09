module Translations {
    export class EnglishAdditional {
        public static locale: ng.translate.ITranslationTable = {
            UPLOAD_FROM_EXCEL2MAP: 'Upload your data from Excel2Map',
            UPLOAD_TABULAR_DATA: 'Upload your tabular data from Excel, Matlab, R, etc.',
            UPLOAD_DESCRIPTION: 'Uploading data can be performed in multiple ways. Unless your network configuration prevents it, you can simply press the upload-button in the Excel-templates to upload data automatically. When that doesn\'t work, use one of the options below to create your map.',
            PASTE_CLIPBOARD: 'Paste from clipboard',
            PASTE_CLIPBOARD_DESCRIPTION: 'Paste data from your clipboard to this textfield. Click the upload-button in the Excel-sheet first, to make sure the data has been copied to your clipboard.',
            UPLOAD_FILE: 'Upload file',
            UPLOAD_FILE_DESCRIPTION: 'Upload the *.json file that you saved on your computer.',
            DRAG_FILE: 'Drag the file onto this widget.',
            DRAG_FILE_DESCRIPTION: 'Drag the json-file from your explorer-program to this box.',
            ERROR_UPLOADING_PROJECT: 'Error while uploading project',
            UNAUTHORIZED: 'You are not authorized to change the project. Did you enter the correct password?',
            ERROR_MSG: 'An error occurred when uploading your data: {{msg}}',
            MANUAL_UPLOAD_MODE: 'Manual upload mode',
            TABLE2MAP: 'Table to map',
            HAS_HEADER: 'Data contains headers',
            DELIMITER: 'Delimiter',
            CSV_PARSE_SETTINGS: 'Input data configuration'
        };
    }
}