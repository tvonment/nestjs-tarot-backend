import { WebSocket } from 'ws';

const testWebSocket = async () => {
    const socket = new WebSocket('ws://localhost:3000'); // Connect to Furhat Gateway

    socket.on('open', () => {
        console.log('WebSocket connection established.');

        // Simulate sending a fortune request
        socket.send(
            JSON.stringify({
                event: 'fortuneRequest',
                data: { userId: 'user123', message: 'Tell me my fortune.' },
            }),
        );
    });

    // Listen for responses
    socket.on('message', (message) => {
        console.log('Received:', message.toString());
        socket.close();
    });

    socket.on('close', () => {
        console.log('WebSocket connection closed.');
    });
};

// Run the test
testWebSocket();