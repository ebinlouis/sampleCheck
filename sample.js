import express from 'express';
const app = express(); // Initialize Express app

// Define a simple route
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Start the server
const PORT = process.env.PORT || 3000; // Use environment port or default to 3000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
