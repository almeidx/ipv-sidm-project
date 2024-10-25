export enum WebSocketMessageType {
	/**
	 * Sent by the client to identify itself to the server.
	 */
	Identify = 0,
	/**
	 * Sent by the server to acknowledge the client's identification.
	 */
	Identified = 1,
	/**
	 * Sent by the client to keep the connection alive.
	 */
	Ping = 2,
	/**
	 * Sent by the server to keep the connection alive.
	 */
	Pong = 3,
	/**
	 * Sent by the server to instruct the client to disconnect.
	 */
	Die = 4,
	/**
	 * Sent by the client to send data to the server.
	 */
	Data = 5,
}
