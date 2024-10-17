import { fastifyCors } from "@fastify/cors";
import { fastifyJwt } from "@fastify/jwt";
import { fastifySensible } from "@fastify/sensible";
import { fastify } from "fastify";
import { type ZodTypeProvider, serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { env } from "#lib/env.ts";
import { getStatus } from "#routes/get-status.ts";
import { registerUser } from "#routes/register-user.ts";
import { loginUser } from "#routes/login-user.ts";
import {receiveDataSocket} from "#routes/socket.ts";
import {fastifyWebsocket} from '@fastify/websocket';

const app = fastify().withTypeProvider<ZodTypeProvider>();


app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);


await app.register(fastifySensible);
await app.register(fastifyCors);
await app.register(fastifyJwt, { secret: env.JWT_SECRET });
await app.register(fastifyWebsocket, {
    options: { maxPayload: 1048576 }
  });



await app.register(getStatus);
await app.register(registerUser);
await app.register(loginUser);
await app.register(receiveDataSocket);

await app.listen({ port: 3333 });

console.log("Server is running on port 3333");
