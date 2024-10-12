import { z } from "zod";

const schema = z.object({
	DATABASE_URL: z.string().url(),
	PASSWORD_SALT: z.string().min(32),
	JWT_SECRET: z.string().min(32),
});

export const env = schema.parse(process.env);
