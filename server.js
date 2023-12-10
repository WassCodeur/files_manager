import express from 'express';
import routers from './routes/index';

const app = express();

const port = process.env.PORT || 5000;

routers(app);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
