const express = require('express');
const app = express();

// Use the port assigned by Render, or fall back to a default port for local development.
const port = process.env.PORT || 3001;

app.get('/', (req, res) => {
    res.send('Hello from the server!');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
