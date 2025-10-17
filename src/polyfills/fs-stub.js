// Stub for node:fs module
// Provides minimal exports to satisfy imports from fetch-blob

export function statSync() {
  throw new Error('fs.statSync is not available in browser environment');
}

export function createReadStream() {
  throw new Error('fs.createReadStream is not available in browser environment');
}

export const promises = {
  readFile: () => Promise.reject(new Error('fs.promises.readFile is not available in browser environment')),
  writeFile: () => Promise.reject(new Error('fs.promises.writeFile is not available in browser environment')),
  stat: () => Promise.reject(new Error('fs.promises.stat is not available in browser environment')),
};

export default {
  statSync,
  createReadStream,
  promises
};

