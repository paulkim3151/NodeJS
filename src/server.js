import express from "express";

const app = express();
const PORT = 3151;

const handleListening = () => console.log("Server listening...");
const handleHome = (req, res) => {
	return res.send("<h1>Here you are.</h1>");
}

const handleLogin = (req, res) => {
	return res.send("Login Page");
}

app.listen(PORT, handleListening);

app.get("/", handleHome);
app.get("/login", handleLogin);

