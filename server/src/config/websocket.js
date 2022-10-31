const { LoginHistory } = require("@byjus-orders/nexemplum/ums");

const bunyan = require("../lib/bunyan-logger");

const logger = bunyan("websocket-logger");

module.exports = (io) => {
  // whenever we receive a `connection` event
  // our async function is then called
  io.on("connection", async (socket) => {
    // we should see this printed out whenever we have
    // a successful connection
    logger.info("Client Successfully Connected");

    // we then send out a new message to the
    // `chat` channel with "Hello World"
    // Our clientside should be able to see
    // this and print it out in the console
    io.emit("weclome", "Hello user");

    socket.on("loggedIn", async (user) => {
      // Invalidate all the inactive sessions
      await LoginHistory.updateMany(
        {
          email: user.email,
          isActive: true,
        },
        {
          isActive: false,
          endTime: new Date(),
        }
      );
      // Put new active session entry
      const loginHistory = new LoginHistory({
        email: user.email,
        socketId: socket.id,
        isActive: true,
        startTime: new Date(),
      });
      await loginHistory.save();
      logger.info(`User loggedIn ${user.email}}`);
    });

    socket.on("disconnect", async () => {
      // End the session
      await LoginHistory.findOneAndUpdate(
        {
          socketId: socket.id,
        },
        {
          isActive: false,
          endTime: new Date(),
        }
      );
      logger.info("Client Successfully Disconnected");
    });
  });
};
