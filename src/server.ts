import app from './app';

// setting up default port for the server to listen on, either from environment variable or defaulting to 3000
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

// Listening to the server on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
