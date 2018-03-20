module ZodkRightPanel {

    var DEFAULT_SECTION_ID = '__info';
    var DEFAULT_SECTION_TYPE: IPropertyTableSectionType = 'table';
    var DEFAULT_SECTION_TITLE = '';
    var STREETVIEW_IMG_URL = 'https://maps.googleapis.com/maps/api/streetview?size=360x220&location=';
    var STREETVIEW_LINK_URL = 'http://maps.google.com/maps?q=';

    export interface IPropertyTableSection {
        title: string;
        id: string;
        headers: string[];
        rows: IPropertyTableRow[];
        type: IPropertyTableSectionType;
        group: csComp.Services.ProjectGroup;
    }

    export interface IPropertyTableRow {
        title: string;
        label: string;
        type: string;
        values: any[];
        description: string;
        property: csComp.Services.IPropertyType;
        coProperty: csComp.FeatureProps.CallOutProperty;
    }

    export type IPropertyTableSectionType = 'table' | 'full-row';

    export class PropertyTable {
        public layerTitle: string;
        public title: string;
        public sections: IPropertyTableSection[] = [];
        public streetview: string;
        public showRapportLink: boolean;
        public fullRows: string[] = [];

        constructor(private layerService: csComp.Services.LayerService, private timeoutService: ng.ITimeoutService) {
            this.clearTable();
        }

        public clearTable() {
            this.title = '';
            this.sections.length = 0;
            this.createSection(DEFAULT_SECTION_TITLE, DEFAULT_SECTION_TYPE, DEFAULT_SECTION_ID);
        }

        private createSection(title: string,  type ? : IPropertyTableSectionType, id ? : string, group?: csComp.Services.ProjectGroup): IPropertyTableSection {
            let section: IPropertyTableSection = {
                title: title,
                id: id || title,
                headers: [],
                rows: [],
                type: type || 'table',
                group: group
            };
            this.sections.push(section);
            return section;
        }

        private findOrCreateSection(id: string): IPropertyTableSection {
            let section = _.findWhere(this.sections, {
                'id': id
            });
            if (!section) {
                section = this.createSection(id);
            }
            return section;
        }

        private removeDuplicateAndEmptyRows() {
            this.sections.forEach((section, index) => {
                section.rows = _.chain(section.rows).uniq(false, (row) => {
                    return row.label;
                }).filter((row) => {
                    return row.values.length > 0;
                }).value();
            });
            this.sections = this.sections.filter((section) => {
                return section.rows.length > 0;
            });
        }

        public displayFeature = _.throttle(this.displayFeatureDebounced, 0);

        private displayFeatureDebounced(fts: IFeature[]) {
            if (!fts || !_.isArray(fts) || fts.length < 1) return;
            this.timeoutService(() => {
                this.clearTable();
                let fType = this.layerService.getFeatureType(fts[0]);
                let pTypes = _.uniq(csComp.Helpers.getPropertyTypes(fType, null));
                this.title = this.getDisplayTitle(fts);
                this.layerTitle = fts[0].layer.title
                this.fillPropertyTable(fts, pTypes);
                this.removeDuplicateAndEmptyRows();
                console.log(`Display ${fts.length} features in ${this.sections.length} sections`);
            }, 0);
        }

        private fillPropertyTable(fts: IFeature[], pTypes: IPropertyType[]) {
            let virtualFeature = this.joinFeatures(fts, pTypes);
            let pTypesDict = _.object(_.pluck(pTypes, 'label'), pTypes);
            let linkedFeatures = [];
            pTypes.forEach((pt: IPropertyType) => {
                if (pt.visibleInCallOut && virtualFeature.properties.hasOwnProperty(pt.label) && !(linkedFeatures.indexOf(pt.label) >= 0)) {
                    let sectionId = pt.section || DEFAULT_SECTION_ID;
                    let section = this.findOrCreateSection(sectionId);

                    // TODO, do this on create
                    section.group = fts[0].layer.group;

                    let value;
                    switch (pt.type) {
                        case 'image':
                            value = `<img src='${virtualFeature.properties[pt.label]}' style='max-height:100%;max-width:100%;'></img>`;
                            break;
                        case 'url':
                            section.type = 'full-row';
                            value = `<a href='${virtualFeature.properties[pt.label]}'</a>`;
                            break;
                        default:
                            value = csComp.Helpers.convertPropertyInfo(pt, virtualFeature.properties[pt.label]);
                            break;
                    }

                    let cop: csComp.FeatureProps.CallOutProperty = {
                        key: pt.title,
                        value: value,
                        property: pt.label,
                        canFilter: this.canFilter(pt),
                        canStyle: this.canStyle(pt),
                        canShowStats: true,
                        feature: fts[0],
                        isFilter: true,
                        isSensor: false,
                        propertyType: pt
                    };
                    section.rows.push({
                        title: pt.title,
                        label: pt.label,
                        type: pt.type,
                        values: (value != null ? [value] : []),
                        description: pt.description,
                        property: pt,
                        coProperty: cop
                    });
                    // Add linkedFeature if present (e.g. percentage icw amount)
                    if (pt['linkedFeature'] && virtualFeature.properties.hasOwnProperty(pt['linkedFeature'])) {
                        _.last(section.rows).values.push(csComp.Helpers.convertPropertyInfo(pTypesDict[pt['linkedFeature']], virtualFeature.properties[pt['linkedFeature']]));
                        linkedFeatures.push(pt['linkedFeature']);
                        if (section.headers.length === 0) {
                            section.headers.push('Aantal');
                            section.headers.push('%');
                        }
                    }
                }
            });
        }

        private joinFeatures(fts: IFeature[], pTypes: IPropertyType[]): IFeature {
            if (fts.length === 1) return fts[0];
            let virtualFeature = < IFeature > {};
            virtualFeature.layer = < csComp.Services.ProjectLayer > {};
            virtualFeature.layer.typeUrl = fts[0].fType.id.split('#').shift();
            virtualFeature.properties = {};
            pTypes.forEach((pt: IPropertyType) => {
                fts.forEach((f: IFeature) => {
                    if (f.properties.hasOwnProperty(pt.label)) {
                        if (!virtualFeature.properties.hasOwnProperty(pt.label)) {
                            if (typeof f.properties[pt.label] === 'string') {
                                virtualFeature.properties[pt.label] = ' - ';
                            } else {
                                virtualFeature.properties[pt.label] = f.properties[pt.label];
                            }
                        } else {
                            if (typeof f.properties[pt.label] !== 'string') {
                                virtualFeature.properties[pt.label] += f.properties[pt.label];
                            }
                        }
                    }
                });
            });
            this.layerService.evaluateFeatureExpressions( < csComp.Services.Feature > virtualFeature);
            return virtualFeature;
        }

        private getDisplayTitle(fts: IFeature[]): string {
            if (fts.length === 1) {
                return csComp.Helpers.getFeatureTitle(fts[0]);
            } else {
                let title = '';
                fts.forEach((f, index, arr) => {
                    title += csComp.Helpers.getFeatureTitle(f);
                    if (index < arr.length - 2) {
                        title += ', ';
                    } else if (index === arr.length - 2) {
                        title += ' en ';
                    } else {
                        title += ' samengevoegd.';
                    }
                });
                return title;
            }
        }

        private canStyle(pt: IPropertyType): boolean {
            if (pt.canStyle == null)
                return pt.type == "number";
            return pt.canStyle;
        }

        private canFilter(pt: IPropertyType): boolean {
            if (pt.canFilter == null)
                 return pt.type == "number";
            return pt.canFilter;
        }
    }
}
