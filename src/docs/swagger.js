const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");

const openapiSpec = YAML.load(path.join(__dirname, "openapi.yaml"));

const setupSwagger = (app) => {
	app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapiSpec));
	app.get("/openapi.json", (req, res) => res.json(openapiSpec));
};

module.exports = setupSwagger;
