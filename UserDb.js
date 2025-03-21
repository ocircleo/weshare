const { v4: uuidv4 } = require("uuid");
const pcNames = [
  "ZeusCore",
  "ApolloRig",
  "AthenaNode",
  "PoseidonPC",
  "HadesEngine",
  "AresMachine",
  "HermesUnit",
  "OdinSystem",
  "ThorTower",
  "LokiConsole",
  "FreyaSetup",
  "TitanPrime",
  "KrakenNode",
  "MedusaGear",
  "CyclopsPC",
  "GorgonFrame",
  "MinotaurBase",
  "CentaurStation",
  "GriffinRig",
  "PhoenixMachine",
  "PegasusTower",
  "HydraCore",
  "CerberusPC",
  "ValkyrieUnit",
  "SpartanGear",
  "AchillesNode",
  "PerseusFrame",
  "ChimeraRig",
  "AtlasSystem",
  "PrometheusConsole",
  "NebulaCore",
  "SupernovaRig",
  "QuasarNode",
  "PulsarPC",
  "MeteorEngine",
  "AsteroidMachine",
  "CometUnit",
  "GalaxySystem",
  "CosmosTower",
  "EclipseConsole",
  "OrionSetup",
  "AndromedaPrime",
  "CentauriNode",
  "SolarGear",
  "LunarPC",
  "StarlightFrame",
  "ApolloBase",
  "VoyagerStation",
  "PioneerRig",
  "ExplorerMachine",
  "NomadCore",
  "AstroTower",
  "MarinerPC",
  "NautilusUnit",
  "TritonGear",
  "JupiterNode",
  "SaturnFrame",
  "TitanRig",
  "NeptuneSystem",
  "UranusConsole",
  "PlutoSetup",
  "EventHorizonPrime",
  "WormholeNode",
  "BlackHoleGear",
  "DarkMatterPC",
  "QuantumCore",
  "NeutronRig",
  "ProtonNode",
  "ElectronPC",
  "PhotonEngine",
  "FusionMachine",
  "PlasmaUnit",
  "XenonSystem",
  "RadonTower",
  "TitaniumConsole",
  "CobaltSetup",
  "LithiumPrime",
  "SiliconNode",
  "GrapheneGear",
  "CarbonPC",
  "NanoFrame",
  "AIronBase",
  "CyberStation",
  "ByteRig",
  "BitMachine",
  "TerabyteCore",
  "ExabyteTower",
  "OmegaPC",
  "NeuralUnit",
  "QuantumGear",
  "HyperionNode",
  "SingularityFrame",
  "VertexRig",
  "ApexSystem",
  "HorizonConsole",
];
let index = 0;
const users = [];
const generateUser = (role) => {
  if (index == pcNames.length) index = 0;
  let newUser = { name: pcNames[index], id: uuidv4(), role: role };
  index++;
  users.push(newUser);
  return newUser;
};
const generateUserName = (id) => {
  if (index == pcNames.length) index = 0;
  let newUser = { name: pcNames[index], id, role: role };
  index++;
  users.push(newUser);
  return newUser;
};
const getUser = (id) => {
  let temUser = users.find((ele) => ele.id == id);
  if (!temUser) temUser = generateUser(id);
  if(!temUser.name) temUser = generateUserName(id);
  return temUser;
};
module.exports = { generateUser, getUser };
