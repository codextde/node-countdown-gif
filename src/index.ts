import express from 'express';
import path from 'path';
import { Request, Response } from 'express';
import GifGenerator from './gif-generator';

const app = express();
const tmpDir = path.join(process.cwd(), 'tmp');
const publicDir = path.join(__dirname, 'public');

app.use(express.static(publicDir));
app.use(express.static(tmpDir));

// Root route
app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(publicDir, 'index.html'));
});

// Generate and download the GIF
app.get('/generate', (req: Request, res: Response) => {
    const { time, width, height, color, bg, name, frames } = req.query as { [key: string]: string };

    if (!time) {
        throw new Error('Time parameter is required.');
    }
    const generator = new GifGenerator;

    generator.init(time, parseInt(width), parseInt(height), color, bg, name, parseInt(frames), () => {
        const filePath = path.join(tmpDir, `${name}.gif`);
        res.download(filePath);
    });
});

// Serve the GIF to a browser
app.get('/serve', (req: Request, res: Response) => {
    const { time, width, height, color, bg, name, frames } = req.query as { [key: string]: string };

    if (!time) {
        throw new Error('Time parameter is required.');
    }
    const generator = new GifGenerator;

    generator.init(time, 200, 200, 'ffffff', '000000', 'Test', 30, () => {
        const filePath = path.join(tmpDir, `${name}.gif`);
        res.sendFile(filePath);
    });
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Express server listening on port ${port} in ${app.settings.env} mode`);
});

export default app;
