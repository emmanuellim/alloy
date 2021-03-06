import { t, ClientFunction } from "testcafe";
import createNetworkLogger from "../../../helpers/networkLogger";
import { responseStatus } from "../../../helpers/assertions/index";
import createFixture from "../../../helpers/createFixture";
import configureAlloyInstance from "../../../helpers/configureAlloyInstance";
import createResponse from "../../../../../src/core/createResponse";
import getResponseBody from "../../../helpers/networkLogger/getResponseBody";
import cookies from "../../../helpers/cookies";
import {
  compose,
  orgMainConfigMain,
  consentPending,
  debugEnabled
} from "../../../helpers/constants/configParts";

const config = compose(
  orgMainConfigMain,
  consentPending,
  debugEnabled
);

const {
  IAB_CONSENT_IN_PERSONAL_DATA
} = require("../../../helpers/constants/consent");

const networkLogger = createNetworkLogger();

createFixture({
  title:
    "C224672: Passing the `gdprContainsPersonalData` flag should return in the response.",
  requestHooks: [
    networkLogger.setConsentEndpointLogs,
    networkLogger.edgeEndpointLogs
  ]
});

test.meta({
  ID: "C224672",
  SEVERITY: "P0",
  TEST_RUN: "REGRESSION"
});

const triggerSetConsent = ClientFunction(
  () => window.alloy("setConsent", IAB_CONSENT_IN_PERSONAL_DATA),
  { dependencies: { IAB_CONSENT_IN_PERSONAL_DATA } }
);

const sendEvent = ClientFunction(() => window.alloy("sendEvent"));

test("Test C224672: Passing the `gdprContainsPersonalData` flag should return in the response", async () => {
  await configureAlloyInstance("alloy", config);
  await triggerSetConsent();

  await t.expect(networkLogger.setConsentEndpointLogs.requests.length).eql(1);
  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);

  const consentRawResponse = JSON.parse(
    getResponseBody(networkLogger.setConsentEndpointLogs.requests[0])
  );

  const consentResponse = createResponse(consentRawResponse);

  // 1. The set-consent response should contain the Consent cookie: { general: in }
  const consentCookieName = "kndctr_334F60F35E1597910A495EC2_AdobeOrg_consent";
  const consentCookieValue = await cookies.get(consentCookieName);

  await t.expect(consentCookieValue).ok("No consent cookie found.");
  await t.expect(consentCookieValue).eql("general=in");

  // 2. The set-consent response payload contains the consent handle in XDM format
  const consentHandle = consentResponse.getPayloadsByType("privacy:consent");

  await t.expect(consentHandle.length).gte(0);
  await t.expect(consentHandle[0]).eql({
    consentStandard: "IAB TCF",
    consentStandardVersion: "2.0",
    consentStringValue: "CO052l-O052l-DGAMBFRACBgAIBAAAAAAIYgEawAQEagAAAA",
    containsPersonalData: true,
    gdprApplies: true
  });

  // 3. The ECID should exist in the response payload as well, if queried
  const identityHandle = consentResponse.getPayloadsByType("identity:result");
  await t.expect(identityHandle.length).eql(2);

  await sendEvent();
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);
});
