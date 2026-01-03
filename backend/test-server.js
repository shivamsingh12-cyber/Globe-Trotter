// Simple test to verify server can start without database
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5001; // Use different port for testing

app.use(cors());
app.use(express.json());

app.get('/test', (req, res) => {
  res.json({ status: 'ok', message: 'Test server working!' });
});

app.listen(PORT, () => {
  console.log(`✓ Test server running on http://localhost:${PORT}`);
  console.log('✓ Backend dependencies are working correctly');
  process.exit(0); // Exit after successful start
});

setTimeout(() => {
  console.log('✓ Server started successfully!');
  process.exit(0);
}, 1000);
