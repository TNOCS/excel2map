import Winston = require('winston');
import * as csweb from "csweb";
import * as BAG from "./public/BagDatabase/BagDatabase";

Winston.remove(Winston.transports.Console);
Winston.add(Winston.transports.Console, <Winston.ConsoleTransportOptions>{
    colorize: true,
    label: 'csWeb',
    prettyPrint: true
})

var cs = new csweb.csServer(__dirname, <csweb.csServerOptions>{
    port: 3003,
    swagger : false,
    //connectors: { mqtt: { server: 'localhost', port: 1883 }, mongo: { server : '127.0.0.1', port: 27017} }
});
cs.start(() => {
    this.config = new csweb.ConfigurationService('./configuration.json');
    this.config.add('server', 'http://localhost:' + cs.options.port);
    var bagDatabase = new BAG.BagDatabase(this.config);
    var mapLayerFactory = new csweb.MapLayerFactory(<any>bagDatabase, cs.messageBus, cs.api);

    cs.server.post('/projecttemplate', (req, res) => mapLayerFactory.process(req, res));
    // cs.server.post('/bagcontours', (req, res) => mapLayerFactory.processBagContours(req, res));
    console.log('Excel2map functions started');
    //    //{ key: "imb", s: new ImbAPI.ImbAPI("app-usdebug01.tsn.tno.nl", 4000),options: {} }
    //    var ml = new MobileLayer.MobileLayer(api, "mobilelayer", "/api/resources/SGBO", server, messageBus, cm);
});
