import "./db"
import Video from "./models/Video"
import app from "./server"

const PORT = 3151;

const handleListening = () => console.log('✅ Server listening...');

app.listen(PORT, handleListening);