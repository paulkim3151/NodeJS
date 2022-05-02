import 'regenerator-runtime';
import 'dotenv/config';
import './db';
import './models/Video';
import './models/User';
import './models/Comment';
import app from './server';

const PORT = 3151;

const handleListening = () => console.log('✅ Server listening...');

app.listen(PORT, handleListening);