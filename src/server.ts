import app from './app'

//Setting up default port for the server to listen to on default port 3000
const PORT = process.env.PORT ? number(process.env.PORT);


// Listening to the server on the specified port
app.listen(PORT,() => {
    console.log(`Server is running on http://localhost:${PORT}`);
})