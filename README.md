# Data-Driven Decision Support Systems for Mobile Workforce Management

Practical Project for the SIDM (Sistemas de Informação em Dispositivos Móveis) Course at the Instituto Politécnico de Viseu.

## Project Structure

This project is structure in three main folders:

- **backend**: Manages database interactions and handles communication with the frontend and sensors.
- **mobile**: Interfaces with the API to provide user interaction and functionality.
- **simulator**: Simulates sensors by connecting to the API and sending data.

## How to run

### Production mode

Download the Android APK, dataflow.apk in this folder.

The backend API is hosted on <https://sidm-api.almeidx.dev>.

### Development mode

This section will guide you through the process of running the project.

#### 1. Backend

This requires **Node.js LTS** (Long-Term Support) which, at the time of this commit, is version 22.11.0.

1. Navigate to the `backend` folder.
1. Run [`corepack enable`][corepack] and then `corepack install` to install and setup [`pnpm`][pnpm].
1. Run `pnpm install --frozen-lockfile` to install the dependencies.
1. Run `pnpm start` to start the server.

The server will now be running on `http://localhost:3333`.

#### 2. Simulator

The backend should be started before running the simulator.

1. Navigate to the `simulator` folder.
1. Run `pnpm install --frozen-lockfile`
1. Run `pnpm start-devices`

#### 3. Mobile

The backend should be started before running the mobile app.

1. Navigate to the `mobile` folder.
1. Run `pnpm install --frozen-lockfile`
1. Run the app:
	- On own device via the Expo Go app: `pnpm start`
	- On Android emulator: `pnpm android`

[corepack]: https://nodejs.org/docs/v22.11.0/api/corepack.html
[pnpm]: https://pnpm.io/
