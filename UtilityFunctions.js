const os = require("node:os");

function getIPAddress() {
  const interfaces = os.networkInterfaces();

  let serverNetworks = [];
  for (const key in interfaces) {
    let netType = key;
    let netTypeArr = interfaces[key];
    for (let i = 0; i < netTypeArr.length; i++) {
      if (netTypeArr[i].family == "IPv4") {
        let temObj = { address: netTypeArr[i].address, name: netType };
        serverNetworks.push(temObj);
      }
    }
  }
  serverNetworks = serverNetworks.filter((ele) => ele.address != "127.0.0.1");
  serverNetworks.sort((a, b) => {
    let type1 = a.name.toUpperCase();
    let type2 = b.name.toUpperCase();
    return type1 > type2 ? -1 : 1;
  });
  serverNetworks.push({ address: "127.0.0.1", name: "Localhost" });

  return serverNetworks;
}

module.exports = { getIPAddress };
