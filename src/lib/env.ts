import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .string()
    .min(10)
    .max(11)
    .refine(
      (value) => {
        return value === "development" || value === "production";
      },
      {
        message: "NODE_ENV must be either 'development' or 'production'.",
      }
    ),
  CLIENT_URL: z.string().min(1, "Client URL is required!"),
  STRIPE_API_KEY: z.string().min(1, "Stripe API key is required!"),
  PAYPAL_CLIENT_ID: z.string().min(1, "Paypal client ID is required!"),
  PAYPAL_CLIENT_SECRET: z.string().min(1, "Paypal client secret is required!"),
});

export const env = envSchema.parse(process.env);

export type Env = z.infer<typeof envSchema>;
