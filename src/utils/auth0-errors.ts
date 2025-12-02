/** Extracts a clean error message from Auth0 error objects */
export function parseAuth0Error(error: any): string {
  // Handle axios errors from Auth0 API
  if (error.response?.data) {
    const data = error.response.data;

    // Auth0 signup errors
    if (data.message) return data.message;
    if (data.error_description) return data.error_description;
    if (data.description) return data.description;

    // Auth0 error object format
    if (data.error && typeof data.error === "string") {
      return data.error;
    }
  }

  // Handle Auth0 SDK errors (old format)
  if (error.message && error.message.includes("Body: {")) {
    try {
      const bodyMatch = error.message.match(/Body: (\{[\s\S]*\})/);
      if (bodyMatch) {
        const parsed = JSON.parse(bodyMatch[1]);
        return parsed.message || parsed.error_description || error.message;
      }
    } catch {
      return error.message;
    }
  }

  if (error.message) {
    return error.message;
  }

  return error.toString();
}
