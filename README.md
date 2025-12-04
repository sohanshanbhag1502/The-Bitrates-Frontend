# AV Sync Detector Frontend Microservice

This is the frontend microservice of AV Sync Detector. 

## Frameworks and Libraries Used
- [React.js + Vite](https://vitejs.dev/) - Frontend framework
- [Socket.io](https://socket.io/) - For real time task updates using sockets

## Instructions to run the app

### Run in Development Mode

1. Create a .env file with following vars:
    ```Dotenv
    VITE_APP_API_URL
    VITE_APP_SOCKET_URL
    ```

2. Install all the dependencies using the following command:
    ```bash
    npm install
    ```

3. Run the following command to start the server in dev mode
    ```bash
    npm run dev
    ```

### Run in Production Mode

1. Create a .env file with following vars:
    ```Dotenv
    VITE_APP_API_URL
    VITE_APP_SOCKET_URL
    ```

2. Install all the dependencies using the following command:
    ```bash
    npm ci
    ```

3. Run the following command to build for production
    ```bash
    npm run build
    ```

4. The build files will be generated in the `dist` folder. You can serve these files using any static file server such as nginx.

<br>

Alternatively if you have Docker installed, you can directly deploy the app in production using the following command:

    ```bash
    docker run -p 80:80 --env-file .env shanbhagsohan/av-sync-detector-bitrates:vite-service
    ```
**Note**: Ensure that `.env` file is in present with the above listed environment variables when you run the above command.

To Deploy all the services using Docker Compose, refer to the backend [README](https://github.com/sohanshanbhag1502/The-Bitrates-Backend/tree/main/README.md) file.