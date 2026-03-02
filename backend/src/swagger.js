import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'Finance Tracker API',
    version: '1.0.0'
  },
  host: 'localhost:5000',
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'Authorization'
    }
  }
};

const outputFile = './src/swagger.json';

const routes = ['./src/app.js'];

swaggerAutogen()(outputFile, routes, doc);