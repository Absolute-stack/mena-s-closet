import { v2 as cloudinary } from 'cloudinary';

let isConfigured = false;
let configPromise = null;

function getCredentials() {
  let cachedCreds = null;
  return function creds() {
    if (cachedCreds) return cachedCreds;
    const { CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET } = process.env;

    if (!CLOUD_NAME || !CLOUD_API_KEY || !CLOUD_API_SECRET) {
      throw new Error(
        'Cloudinary credentials:CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET are missing from .env '
      );
    }

    cachedCreds = { CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET };
    return cachedCreds;
  };
}

async function withTime(promise, ms = 5000) {
  let timeoutId;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error('Cloudinary connection timed out'));
    }, ms);
  });

  return Promise.race([promise, timeoutPromise]).finally(() =>
    clearTimeout(timeoutId)
  );
}

async function connectCloud() {
  if (isConfigured) {
    console.log('☁️Using existing Cloudinary config');
  }

  if (configPromise) return configPromise;

  configPromise = (async function setupCloudinaryConfig() {
    try {
      const creds = getCredentials()();

      cloudinary.config({
        cloud_name: creds.CLOUD_NAME,
        api_key: creds.CLOUD_API_KEY,
        api_secret: creds.CLOUD_API_SECRET,
        secure: true,
      });
      await withTime(cloudinary.api.ping());
      isConfigured = true;
      console.log('☁️Cloudinary connected successfully');
    } catch (error) {
      console.error(
        `❌Error occured trying to setup cloudinary:${error.message}`
      );
    }
  })();
  return configPromise;
}

export default connectCloud;
