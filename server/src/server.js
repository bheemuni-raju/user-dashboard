'use strict';

require("dotenv").config();

if (process.env.NEW_RELIC_LICENSE_KEY) {
  require('newrelic'); // eslint-disable-line
}

const tracer = require('./utils/ddtraceInit.js');

const { initLogger } = require('@byjus-orders/byjus-logger');

const { contextMiddleware, correlationMiddleware, logger } = initLogger({
  pretty: false,
  redact: [],
  env: process.env.NODE_ENV,
  injectToLogsFromContext: ['tenant-id','tenant-name'],
}, {
  service: "ums",
});

/* function to determine if there was an error. 
It should take a status code as its only parameter and 
return true for success or false for errors. */
tracer.use('express', {
  server: {
    validateStatus: code => !(code >= 400 && code < 600)
  }
})

const Promise = require('bluebird');
//const redis = Promise.promisifyAll(require('redis'));
const Redis = require('ioredis');
const mongoose = require('mongoose'); // eslint-disable-line
const http = require('http'); // eslint-disable-line
const socketIO = require('socket.io'); // eslint-disable-line
const socketIOSession = require('express-socket.io-session'); // eslint-disable-line
const config = require('./config'); // eslint-disable-line
const MongoClient = require('mongodb').MongoClient;

// const bunyan = require("./lib/bunyan-logger");
// const logger = bunyan("server.js");

process.on('unhandledRejection', err => console.error(err));
mongoose.Promise = global.Promise;
const mongooseOptions = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
};

mongoose.connect(config.db, mongooseOptions);
const db = mongoose.connection;

db.on('error', err => {
  console.error('Mongoose error', err);
});

db.once('open', async () => {
  const client = await MongoClient.connect(config.dbUrl, { useUnifiedTopology: true });
  mongoose.leado = await mongoose.createConnection(config.leadoDb, mongooseOptions);
  mongoose.friendlyPotato = await mongoose.createConnection(config.friendlyPotato, mongooseOptions);
  mongoose.scAchieve = await mongoose.createConnection(config.scAchieveDb, mongooseOptions);
  mongoose.mkms = await mongoose.createConnection(config.mkmsDb, mongooseOptions);

  global.byjus = {};
  global.byjus['nativeClient'] = client;

  let redisClient;

  if (process.env.NODE_ENV !== "local") {
    //redisClient = redis.createClient({ url: config.redisUri });

    redisClient = new Redis.Cluster(
      [
        {
          host: config.redisUri,
          port: process.env.REDIS_PORT
        },
      ],
      {
        redisOptions: { keepAlive: 200 }
      }
    );

    redisClient.on("close", () => {
      logger.info({ method: "onClose" }, "Redis Connection Closed");
    });
  }

  global.byjus['redisClient'] = redisClient;

  /**
   * Don't remove or reorder following 2 lines, it impact application bootstrap activity
   */
  require('@byjus-orders/nexemplum'); // eslint-disable-line
  const setupExpress = require('./config/express'); // eslint-disable-line

  /**Setting up oh client and attaching it to global.byjus */
  if (!["local", "uat"].includes(process.env.NODE_ENV)) {
    const { setupOHToken } = require('./config/setupToken');
    const ohClient = await setupOHToken();
    global.byjus['ohClient'] = ohClient;
  }

  const io = socketIO({ path: '/nucleusapi/socket.io' });
  const app = setupExpress(io, contextMiddleware, correlationMiddleware, logger);
  const server = http.createServer(app).listen(config.port);

  io.listen(server);

  console.info('Connected to db', config.db);
  console.info('Application started on port', config.port);
});