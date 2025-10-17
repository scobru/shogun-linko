// Stub for node:net module
// Provides minimal exports to satisfy imports from node-fetch

// isIP function checks if a string is a valid IP address
export function isIP(input) {
  if (!input) return 0;
  
  // Check if it's IPv4
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(input)) {
    const parts = input.split('.');
    if (parts.every(part => parseInt(part) <= 255)) {
      return 4;
    }
  }
  
  // Check if it's IPv6 (simplified)
  if (input.includes(':')) {
    return 6;
  }
  
  return 0;
}

export default {
  isIP
};

