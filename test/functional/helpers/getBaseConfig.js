import { edgeConfigId } from "./edgeInfo";
import edgeDomainThirdParty from "./constants/configParts/edgeDomainThirdParty";

const edgeBasePath = process.env.EDGE_BASE_PATH;

export default (orgId, configId = edgeConfigId) => {
  const config = {
    edgeConfigId: configId,
    orgId: orgId || "334F60F35E1597910A495EC2@AdobeOrg",
    // Default `edgeDomain` to 3rd party; override in specific test if needed.
    ...edgeDomainThirdParty
  };

  if (edgeBasePath) {
    config.edgeBasePath = edgeBasePath;
  }

  return config;
};
