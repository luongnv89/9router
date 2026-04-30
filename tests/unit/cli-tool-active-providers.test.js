import { describe, it, expect } from "vitest";

function getActiveProviders(connections) {
  return connections.filter(c => {
    if (c.isActive === false) return false;
    if (c.testStatus && c.testStatus !== "active" && c.testStatus !== "success") return false;
    const hasKey = c.apiKey || c.providerSpecificData?.apiKey;
    const hasOAuth = c.oauthState || c.providerSpecificData?.token;
    return hasKey || hasOAuth;
  });
}

describe("getActiveProviders", () => {
  const makeConnection = (overrides = {}) => ({
    _id: "conn-1",
    provider: "openai",
    name: "Test Provider",
    isActive: true,
    testStatus: "active",
    apiKey: "sk-test",
    providerSpecificData: {},
    oauthState: null,
    ...overrides,
  });

  it("excludes connections with isActive=false", () => {
    const connections = [makeConnection({ isActive: false })];
    expect(getActiveProviders(connections)).toHaveLength(0);
  });

  it("excludes unconfigured providers without API key or OAuth token", () => {
    const connections = [makeConnection({ apiKey: null, oauthState: null, providerSpecificData: {} })];
    expect(getActiveProviders(connections)).toHaveLength(0);
  });

  it("excludes providers with failed test status", () => {
    const connections = [makeConnection({ testStatus: "error", apiKey: "sk-test" })];
    expect(getActiveProviders(connections)).toHaveLength(0);
  });

  it("excludes providers with testStatus=pending", () => {
    const connections = [makeConnection({ testStatus: "pending", apiKey: "sk-test" })];
    expect(getActiveProviders(connections)).toHaveLength(0);
  });

  it("includes active providers with valid API key", () => {
    const connections = [makeConnection({ apiKey: "sk-live-xxx" })];
    expect(getActiveProviders(connections)).toHaveLength(1);
  });

  it("includes active providers with success testStatus", () => {
    const connections = [makeConnection({ testStatus: "success", apiKey: "sk-xxx" })];
    expect(getActiveProviders(connections)).toHaveLength(1);
  });

  it("includes active providers with OAuth token", () => {
    const connections = [makeConnection({ apiKey: null, oauthState: "token-xxx" })];
    expect(getActiveProviders(connections)).toHaveLength(1);
  });

  it("includes active providers with providerSpecificData.apiKey", () => {
    const connections = [makeConnection({ apiKey: null, oauthState: null, providerSpecificData: { apiKey: "sk-xxx" } })];
    expect(getActiveProviders(connections)).toHaveLength(1);
  });

  it("includes active providers with providerSpecificData.token", () => {
    const connections = [makeConnection({ apiKey: null, oauthState: null, providerSpecificData: { token: "oauth-token-xxx" } })];
    expect(getActiveProviders(connections)).toHaveLength(1);
  });

  it("returns only configured providers among a mix", () => {
    const connections = [
      makeConnection({ _id: "c1", apiKey: "sk-openai" }),
      makeConnection({ _id: "c2", provider: "anthropic", apiKey: "sk-ant" }),
      makeConnection({ _id: "c3", provider: "unconf", apiKey: null, oauthState: null, providerSpecificData: {} }),
    ];
    expect(getActiveProviders(connections)).toHaveLength(2);
  });

  it("treats null testStatus as active (undefined not filtered out)", () => {
    const connections = [makeConnection({ testStatus: null, apiKey: "sk-live" })];
    expect(getActiveProviders(connections)).toHaveLength(1);
  });
});
