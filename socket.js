import { Server } from "socket.io";

let io;
let merchant_socket = {};
function createSocket(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin:
                process.env.NODE_ENV === "production"
                    ? false
                    : ["http://localhost:5173"],
        },
    });
    io.on("connection", (socket) => {
        console.log("a user connected");
        socket.on("register", (merchantId) => {
            if (!merchant_socket[merchantId]) {
                merchant_socket[merchantId] = [];
            }
            merchant_socket[merchantId] = [...merchant_socket[merchantId], socket.id];
            console.log(merchant_socket);
        });
        socket.on("disconnect", () => {
            console.log("user disconnected");
            for (const key in merchant_socket) {
                merchant_socket[key] = merchant_socket[key].filter((id) => id !== socket.id);
            }
            console.log(merchant_socket);
        });
    });
}

function getIo() {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
}

export { createSocket, getIo, merchant_socket };
