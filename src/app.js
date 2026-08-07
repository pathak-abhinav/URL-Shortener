const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const config = require("./config");
const connectMongo = require("./database/mongodb");
const router = require("./router");
const setupSwagger = require("./docs/swagger");

class Server {
	constructor() {
		this.app = express();
		this.port = config.server.http.port;
		this.initMiddleware();
		this.initDatabase();
		this.initRoutes();
	}

	initMiddleware() {
		this.app.use(express.json()); // JSON parsing
		this.app.use(cookieParser());

		// Enable CORS if configured
		if (config.cors.enabled) {
			this.app.use(
				cors({
					origin: config.cors.origin,
					methods: config.cors.methods,
					allowedHeaders: config.cors.headers,
					credentials: config.cors.credentials
				})
			);
		}
	}

	initDatabase() {
		connectMongo(); // Connect to MongoDB
	}

	initRoutes() {
		setupSwagger(this.app);
		this.app.use("/", router); // Load all routes
	}

	start() {
		this.app.listen(this.port, () => {
			console.log(`Server is running on http://localhost:${this.port}`);
			console.log(`API docs available at http://localhost:${this.port}/api-docs`);
		});
	}

	getAppInstance() {
		return this.app;
	}
}

module.exports = Server;
