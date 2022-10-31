const { Orderhive } = require("@byjus-orders/tyrion-plugins");
const { ByjusConfig } = require("@byjus-orders/nexemplum/oms");

const setupOHToken = async () => {
  const OrderHiveConfig = await ByjusConfig.findOne({
    formattedAppName: "ORDERHIVE",
    formattedModuleName: "ORDERHIVE_API_CONFIG",
  });
  if (OrderHiveConfig) {
    const { configs = [] } = OrderHiveConfig;
    const { clientId, clientSecret, url } = configs[0];
    const ohClient = new Orderhive({ clientId, clientSecret, url });
    await ohClient.init();
    return ohClient;
  }

  throw new Error(`Orderhive config is missing`);
};

module.exports = {
  setupOHToken,
};
