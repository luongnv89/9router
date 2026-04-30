/**
 * Filters providers based on their configuration and activity status.
 * Used to ensure only valid, configured connections are shown in the UI.
 * 
 * @param {Array} connections - List of provider connection objects
 * @returns {Array} Filtered list of active and configured providers
 */
export function filterActiveProviders(connections) {
  if (!connections) return [];
  return connections.filter(c => {
    // 1. Explicitly inactive providers are excluded
    if (c.isActive === false) return false;

    // 2. Providers with failed/unvalidated test status are excluded
    // Note: null/undefined testStatus is treated as active for backward compatibility
    if (c.testStatus && c.testStatus !== "active" && c.testStatus !== "success") return false;

    // 3. Providers without any credentials (API key or OAuth token) are excluded
    const hasKey = c.apiKey || c.providerSpecificData?.apiKey;
    const hasOAuth = c.oauthState || c.providerSpecificData?.token;

    return !!(hasKey || hasOAuth);
  });
}
