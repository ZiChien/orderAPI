import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express from "express";
import http from "http";
import cors from "cors";
import { typeDefs, resolvers } from "./schema/index.js";
import { createSocket } from "./socket.js";

const app = express();
const httpServer = http.createServer(app);
createSocket(httpServer);
const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});
// Ensure we wait for our server to start
await server.start();

// Set up our Express middleware to handle CORS, body parsing,
// and our expressMiddleware function.
app.use(
  "/graphql",
  cors(),
  express.json(),
  // expressMiddleware accepts the same arguments:
  // an Apollo Server instance and optional configuration options
  expressMiddleware(server, {
    context: async ({ req }) => ({ token: req.headers.token }),
  })
);
app.get("/sss", (req, res) => {
  res.send("Hello World!");
});

// Modified server startup
const port = parseInt(process.env.PORT) || 4000;
await new Promise((resolve) => httpServer.listen({ port}, resolve));

console.log(`🚀 Server ready at http://localhost:4000/`);
