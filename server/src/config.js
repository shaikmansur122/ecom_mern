export const PORT = Number(process.env.PORT) || 5000;
export const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/shopnest';
export const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-secret';
// Set by the root Dockerfile (single-container hosting). Locally, nginx serves the React build instead.
export const PUBLIC_DIR = process.env.PUBLIC_DIR || '';
