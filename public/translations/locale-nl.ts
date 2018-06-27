module Translations {
    export class DutchAdditional {
        public static locale: ng.translate.ITranslationTable = {
            UPLOAD_FROM_EXCEL2MAP: 'Upload je data vanuit Excel2Map',
            UPLOAD_TABULAR_DATA: 'Upload je tabulaire data van Excel, Matlab, R, etc.',
            UPLOAD_DESCRIPTION: 'De data kan op verschillende manieren geüpload worden. Mits de netwerkinstellingen het toelaten, is een simpele druk op de knop in het Excel-werkblad genoeg om de data automatisch te uploaden. Verschijnt er een foutmelding in Excel, gebruik dan één van de onderstaande opties om de kaart aan te maken.',
            PASTE_CLIPBOARD: 'Plakken vanaf het klembord',
            PASTE_CLIPBOARD_DESCRIPTION: 'Plak de data vanaf het klembord naar dit tekstveld. Klik daarvoor eerst op de upload-knop in het Excel-werkblad, om de benodigde data naar het klembord te kopiëren.',
            UPLOAD_FILE: 'Upload bestand',
            UPLOAD_FILE_DESCRIPTION: 'Upload het *.json bestand dat opgeslagen staat op je computer.',
            // DRAG_FILE: 'Sleep bestand naar deze widget.',
            DRAG_FILE: 'Of klik hier om de data direct te plakken en te bewerken.',
            DRAG_FILE_DESCRIPTION: 'Sleep het json-bestand van je bestandsverkenner naar dit blok.',
            ERROR_UPLOADING_PROJECT: 'Fout bij het uploaden van het project',
            UNAUTHORIZED: 'Je bent niet bevoegd om dit project te wijzigen. Heb je het goede wachtwoord ingevuld?',
            ERROR_MSG: 'Foutmelding ontvangen bij het uploaden van de data: {{msg}}',
            MANUAL_UPLOAD_MODE: 'Handmatige upload mode',
            DESIGN_OF_OBJECTS: 'Vormgeving van objecten op de kaart',
            TABLE2MAP: 'Tabel naar kaart',
            HAS_HEADER: 'Data bevat kopteksten',
            DELIMITER: 'Scheidingsteken',
            CSV_PARSE_SETTINGS: 'Configureer de data import instellingen',
            SEARCH_IN_DATA: 'Zoek in de data',
            SHOW_NR_OF_TOTAL: 'Toon {{nr}} van de {{total}} rijen.',
            CSV_PARSE_SETTINGS_HELP: 'Geef aan of de data kopteksten bevat en wat voor scheidingstekens worden gebruikt tussen de kolommen.',
            DECIMAL_CHARACTER: 'Decimaal teken',
            NO_DATA_TABLE: 'Geen tabulaire data gevonden. Ga terug naar stap 1.',
            UPLOAD_HELP: 'Sleep een bestand naar het tekstvak hieronder. Een andere optie is om de data via het klembord in het tekstvak te plakken.',
            UPLOAD_ICON_HELP: 'Upload een icoon bestand (*.png, max. 50kb groot)',
            STYLE_PREVIEW: 'Preview',
            SELECTED_PROPERTY: 'Geselecteerde eigenschap',
            FEATURE_SELECTED: 'Object is geselecteerd',
            FEATURE_DESELECTED: 'Object is niet geselecteerd',
            CURRENT_ZOOM: 'Huidig zoomniveau',
            SELECT_GEOMETRY_COLUMNS: 'Bepaal plaatsing van het object',
            GEOMETRY_TYPE: 'Gebiedstype',
            GEOMETRY: 'Gebiedstype en indeling',
            SELECT_GEOMETRY_COLUMNS_HELP: 'Selecteer de kolommen die bepalen waar een object op de kaart moet komen te staan. Dit kan bijvoorbeeld de provincienaam zijn, de combinatie van postcode en huisnummer, een set coordinaten, enz.',
            COLUMN: 'Kolom',
            EDIT_COLS: 'Aanpassen',
            SELECT_FEATURE_TO_PREVIEW: 'Selecteer een item voor de voorvertoning',
            UPLOAD_ICON: 'Upload icoon',
            SWAP_ROWS: 'Verwissel de twee rijen',
            SELECT_THESE_ITEMS: 'Selecteer de volgende data',
            SELECT_COLS: 'Selecteer kolom(men)',
            EDIT_PROPERTYTYPE: 'Bewerk hoe deze eigenschap getoond wordt',
            PROPERTY_SETTINGS_HELP: 'Selecteer de titel van een eigenschap in het rechter voorbeeld paneel om aan te passen hoe die eigenschap wordt getoond (titel, afronding, enz).',
            SELECT_NAMELABEL_COLUMN: 'Selecteer de kolom met titels',
            SELECT_NAMELABEL_COLUMN_HELP: 'Selecteer de kolom waarin de titel van elk object staat, bijv. de provincie- of ziekenhuisnaam. Deze titel zal worden getoond als een object door de gebruiker wordt geselecteerd, of er overheen beweegt met de muis.',
            PREVIOUS_STEP: 'Vorige stap',
            NEXT_STEP: 'Volgende stap',
            LOAD_OR_CREATE_PROJECT: 'Laad of creëer een project',
            LOAD_OR_CREATE_BUTTON: 'Laad / creëer',
            CREATE_BUTTON: 'Aanmaken',
            PROJECT_ID: 'Project ID',
            DATA_TO_MAP: 'Data naar de kaart',
            STYLE_SETTINGS: 'Stijl instellingen',
            ADDITIONAL_INFO: 'Extra informatie',
            ADDITIONAL_INFO_COLUMN_HELP: 'Voeg extra informatie toe aan de data, bijv. populatie-data voor gemeentes of BAG-gegevens voor adressen.',
            PROJECT_SETTINGS: 'Project instellingen',
            PROJECT_SETTINGS_HELP: '',
            DATA_PARSED_CORRECTLY: 'Data is goed verwerkt',
            LOGO: 'Logo',
            PROJECT_LOGO: 'Project logo',
            PROJECT_TITLE: 'Project titel',
            LAYER_TITLE: 'Kaartlaag titel',
            LAYER_DESCRIPTION: 'Kaartlaag beschrijving',
            FIT_TO_MAP: 'Passend maken',
            FIT_TO_MAP_HELP: 'Pas het zoombereik van de kaart aan zodat alle items zichtbaar zijn bij het activeren van de kaartlaag.',
            ENABLED: 'Standaard geactiveerd',
            ENABLED_HELP: 'Indien geselecteerd wordt de kaartlaag bij het openen van het project automatisch geactiveerd',
            SELECT_OR_CREATE_GROUP: 'Kies of creëer een thema',
            SELECT_OR_CREATE_SECTION: 'Kies of creëer een sectie',
            SELECT_GEOMETRYTYPE_FIRST: 'Kies eerst een gebiedsindeling/geometrie',
            NOTHING_TO_SELECT: 'Er hoeft niets geselecteerd te worden',
            NO_COLUMN_SELECTED: 'niets geselecteerd',
            SELECT_NR_COLUMNS: '{{(nr == 1 ? nr + " kolom" : nr + " kolommen")}} geselecteerd',
            SHOW_HIDE_COLUMN_TITLES: 'Toon/verberg kolom titels',
            TABLE_HELP: 'Hieronder wordt de tabel met uw data getoond. Er wordt aangegeven welke rijen of kolommen u dient te selecteren.',
            ICON_IMAGE: 'Icoon afbeelding',
            ICON_DIMENSIONS: 'Afmetingen',
            ICON_HEIGHT: 'Hoogte',
            ICON_WIDTH: 'Breedte',
            FILL_COLOR: 'Vulkleur',
            STROKE_COLOR: 'Lijnkleur',
            SELECTED_STROKE_COLOR: 'Lijnkleur (geselecteerd)',
            STROKE_WIDTH: 'Lijndikte',
            SELECTED_STROKE_WIDTH: 'Lijndikte (geselecteerd)',
            TRANSPARENCY: 'Transparantie',
            CORNER_RADIUS: 'Afronding hoeken (%)',
            CLUSTERING_OPTIONS: 'Groepering opties',
            CLUSTER_TOGGLE: 'Groepering aan/uit',
            CLUSTERING: 'Groepeer kaartitems',
            CLUSTER_LEVEL: 'Vanaf zoomniveau',
            DATA_RANGE: 'Data bereik',
            ADVANCED_SETTINGS: 'Geavanceerde instellingen',
            ADVANCED_ACTIONS: 'Geavanceerde acties',
            SHOW_PROJECT: 'Open het aangemaakte project',
            SHOW_TABLE: 'Toon de data in een tabel',
            TOO_MANY_COLS: 'Teveel kolommen',
            TOO_MANY_COLS_MSG: 'Er zijn teveel kolommen geselecteerd. Deselecteer een kolom voordat een nieuwe kolom geselecteerd kan worden.',
            FILE_TOO_LARGE: 'Bestand is te groot',
            FILE_TOO_LARGE_MSG: 'De bestandsgrootte overschrijdt de limiet van {{size}} kB. Kies een kleiner bestand.',
            UNKNOWN_FORMAT: 'Onbekend bestandstype',
            UNKNOWN_FORMAT_MSG: 'Kies een ondersteund bestandstype ({{type}})',
            VISIBILITY: 'Zichtbaarheid',
            VISIBLE_IN_TOOLTIP: 'Toon eigenschap in tooltip',
            PROJECTS_LIST: 'Overzicht projecten',
            PROJECTS_REFRESH: 'Vernieuw overzicht',
            CREATE_NEW_PROJECT: 'Nieuw project aanmaken',
            CREATE_NEW_LAYER: 'Maak nieuwe kaartlaag',
            CREATE_NEW_GROUP: 'Maak nieuw thema',
            GROUP: 'Thema',
            EDIT_PROJECT: 'Project aanpassen',
            UPLOAD_SUCCESS: 'Kaartlaag aangemaakt',
            UPLOAD_SUCCESS_MSG: 'De kaartlaag is aangemaakt. Klik op onderstaande link om het project te openen.',
            INVALID_INPUT: 'Deze titel is ongeldig. Gebruik minstens 2 karakters en geen aanhalingstekens.',
            VALID_INPUT: 'Deze titel is beschikbaar, uw project kan worden aangemaakt.',
            CHECKING: 'Wordt gecontroleerd...',
            CAN_VIEW: 'Bekijk',
            CAN_EDIT: 'Bewerk',
            CANCEL: 'Annuleren',
            EDIT: 'Bewerken',
            SELECT: 'Selecteer',
            EDIT_LAYER: 'Kies een kaartlaag om te bewerken',
            SAVE_AND_OPEN: 'Opslaan en resultaat bekijken',
            OPEN_RESULT: 'Resultaat bekijken',
            LAST_STEP_MSG: 'Dit is de laatste stap voor u uw kaart kunt bekijken. Druk op \'Converteer\' om uw data om te zetten naar een kaart. Zodra dit proces gereed is kunt u uw kaart openen door op \'Resultaat bekijken\' te klikken.',
            GENERATE_MAP: 'Genereer de kaart',
            ERROR_GETTING_LAYER: 'Fout bij ophalen kaartlaag',
            MANAGE_RIGHTS: 'Beheer project',
            NO_NAMELABEL_SELECTED: 'Geen titel geselecteerd',
            NO_LAYERS: 'Geen kaartlagen gevonden',
            COPY_LAYER: 'Dupliceer deze kaartlaag',
            DELETE_LAYER: 'Verwijder deze kaartlaag',
            DELETE: 'Verwijderen',
            CLONE: 'Dupliceren',
            REALLY_DELETE_LAYER: 'Wil je deze kaartlaag echt verwijderen? Dit kan niet ongedaan worden gemaakt!',
            REALLY_CLONE_PROJECT: 'Wil je dit project echt dupliceren? Dit kan enkele momenten duren.',
            REALLY_DELETE_PROJECT: 'Wil je dit project echt verwijderen? Dit kan niet ongedaan worden gemaakt!',
            REALLY_DELETE_GROUP: 'Wil je dit thema echt verwijderen? Dit verwijdert ook alle kaartlagen in het thema en kan niet ongedaan worden gemaakt!',
            LOGIN_WARNING: 'Niet ingelogd',
            MANAGE_PROJECT: 'Beheer toegangsrechten voor project',
            LOGIN_FIRST: 'Registreer of login om je kaarten te kunnen maken',
            USER: 'Gebruiker-email',
            RIGHTS: 'Toegangsrechten',
            EXISTING_USERS: 'Gebruikers met toegang',
            SHARED_WITH: 'Gedeeld met',
            EDIT_RIGHTS: 'Rechten aanpassen',
            ADD_USER: 'Gebruiker toevoegen',
            NONE: 'Geen',
            READ: 'Bekijken',
            AUTHOR: 'Bekijken en bewerken',
            MANAGE: 'Bekijken, bewerken en beheren',
            NO_MEMBERS: 'Dit project is niet gedeeld met andere gebruikers',
            UPDATE: 'Toepassen',
            AUTODETECT_TYPES: 'Detecteer types',
            AUTODETECT_TYPES_HELP: 'Detecteer van alle eigenschappen welk van type ze zijn, bijv. nummer, tekst, hyperlink, etc.',
            DELETE_USERS: 'Gebruiker verwijderen',
            DELETE_USER_RIGHTS: 'Verwijder alle rechten van deze gebruiker',
            DEFAULT_STYLE_PROPERTY: 'Standaard legenda',
            EXIT_WIZARD: 'Keer terug naar het hoofdscherm',
            DELETE_PROJECT: 'Verwijder het project. Kan niet ongedaan worden gemaakt!',
            CLONE_PROJECT: 'Dupliceer het project inclusief alle thema\'s en lagen.',
            MANAGE_PROJECT_HELP: 'Pas de toegangsrechten per gebruiker aan voor dit project. Ook biedt dit scherm de mogelijkheid om het project te verwijderen.',
            EDIT_LAYER_HELP: 'Kies een kaartlaag om te bewerken, verwijderen of maak een nieuwe kaartlaag.',
            DATA_NOT_CONVERTED_CORRECTLY: 'Niet alle data was correct geconverteerd. Klik hier voor meer informatie',
            DATA_CONVERTED_CORRECTLY: 'Data is correct geconverteerd',
            ERROR_GETTING_FEATURE_TYPE: 'Fout bij het ophalen van de kaartlaag-stijl',
            MISSING_LOCATIONS: 'Missende locaties',
            NO_LEGEND_AVAILABLE: 'Er is geen legenda beschikbaar voor de huidige kaart.',
            SHOW_LABELS: 'Toon plaatsnamen',
            CHOOSE_BASELAYER: 'Kies een kaartweergave',
            BASELAYER_NOT_AVAILABLE: 'Kaartweergave niet beschikbaar',
            BASELAYER_NOT_AVAILABLE_WITH_LABELS: 'Deze kaartweergave is niet beschikbaar met plaatsnamen',
            BASELAYER_NOT_AVAILABLE_WITHOUT_LABELS: 'Deze kaartweergave is niet beschikbaar zonder plaatsnamen',
            TOON_INFO: 'Toon info',
            NO_LAYER_ACTIVE: 'Er is geen kaartlaag actief',
            FILTERS: 'Filters',
            NO_FILTERS: 'U heeft geen filters actief',
            LAYERS: 'Kaartlagen',
            DATA: 'Informatie',
            DOWNLOAD_SELECTION_AS: 'Download deze selectie als',
            IE_DETECTED: 'Internet Explorer gedetecteerd',
            IE_DETECTED_MSG: 'Gebruik aub een moderne browser (e.g. Chrome, Firefox, Opera) om optimaal gebruik te kunnen maken van deze applicatie.',
            PRIVACY_STATEMENT: 'Privacy Statement',
            LAST_UPDATED: 'Laatst gewijzigd: {{_updatedString}}'
        };
    }
}
