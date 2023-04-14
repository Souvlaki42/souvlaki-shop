import { cleanEnv } from "envalid";
import { port, str, url } from "envalid/dist/validators";

export default cleanEnv(process.env, {
    STRIPE_API_KEY: str(),
    PORT: port(),
    CLIENT_URL: url(),
    // SESSION_SECRET: str(),
    // EMAIL_HOST: host(),
    // EMAIL_PORT: port(),
    // EMAIL_USER: email(),
    // EMAIL_PASS: str(),
});