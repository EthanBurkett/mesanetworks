import { UAParser } from "ua-parser-js";

export interface DeviceInfo {
  deviceType?: string;
  deviceName?: string;
  browser?: string;
  os?: string;
}

export function parseUserAgent(userAgent: string): DeviceInfo {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  return {
    deviceType: result.device.type || "desktop",
    deviceName: result.device.model || result.device.vendor || "Unknown Device",
    browser: result.browser.name
      ? `${result.browser.name} ${result.browser.version || ""}`.trim()
      : undefined,
    os: result.os.name
      ? `${result.os.name} ${result.os.version || ""}`.trim()
      : undefined,
  };
}
