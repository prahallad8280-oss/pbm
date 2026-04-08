import dotenv from "dotenv";

dotenv.config();

const requiredVariables = ["MONGO_URI", "JWT_SECRET"];
const missingVariables = requiredVariables.filter((name) => !process.env[name]);

if (missingVariables.length) {
  throw new Error(`Missing required environment variables: ${missingVariables.join(", ")}`);
}

if (process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters long.");
}

