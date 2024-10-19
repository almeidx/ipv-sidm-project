import { fastifyCors } from "@fastify/cors";
import { fastifyJwt } from "@fastify/jwt";
import { fastifySensible } from "@fastify/sensible";
import { fastifyWebsocket } from "@fastify/websocket";
import { fastify } from "fastify";
import { type ZodTypeProvider, serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { env } from "#lib/env.ts";
import { getStatus } from "#routes/get-status.ts";
import { createSensor } from "#routes/sensors/create-sensor.ts";
import { getSensorData } from "#routes/sensors/data/get-sensor-data.ts";
import { getSensorsData } from "#routes/sensors/data/get-sensors-data.ts";
import { getSensors } from "#routes/sensors/get-sensors.ts";
import { login } from "#routes/users/login.ts";
import { signUp } from "#routes/users/sign-up.ts";
import { webSocketRoute } from "#routes/ws.ts";

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.setErrorHandler((error, request, reply) => {
	console.error(error);
	reply.send({ error: error.message });
});

await app.register(fastifySensible);
await app.register(fastifyCors);
await app.register(fastifyJwt, { secret: env.JWT_SECRET });
await app.register(fastifyWebsocket, {
	options: {
		maxPayload: 1024 * 1024, // 1mb
	},
});

await app.register(async (instance) => {
	// sensors/data
	await instance.register(getSensorData);
	await instance.register(getSensorsData);

	// sensors
	await instance.register(getSensors);
	await instance.register(createSensor);

	// users
	await instance.register(signUp);
	await instance.register(login);

	await instance.register(getStatus);
	await instance.register(webSocketRoute);
});

await app.listen({ host: '0.0.0.0', port: 3333 });

console.log("Server is running on port 3333");
