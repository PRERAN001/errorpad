import 'dotenv/config';
import { createAppServer } from './app.js';

const port = process.env.PORT || 8000;

const start = async () => {
  try {
    const { httpServer } = await createAppServer();

    httpServer.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

start();
