import { io } from "socket.io-client";

// Địa chỉ backend của chúng ta
const SOCKET_URL = "http://localhost:5000";

const socket = io(SOCKET_URL, {
    autoConnect: false, // Chỉ kết nối khi cần thiết (ví dụ khi vào trang làm bài)
});

export default socket;
