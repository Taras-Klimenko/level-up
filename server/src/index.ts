import express, { Request, Response, RequestHandler } from 'express';
import cors from 'cors';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from './trpc/router';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';

import { getAccessToken } from './utils/token';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: './uploads/', // Save to "uploads" folder
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname) || '.webm'; // Ensure .webm extension
    cb(null, file.fieldname + '-' + Date.now() + extension);
  },
});

const upload = multer({ storage });

const uploadHandler: RequestHandler = (req, res) => {
  const file = req.file as Express.Multer.File;
  if (!file) {
    res.status(400).json({ error: 'No audio file uploaded' });
    return;
  }

  res.json({ fileName: file.filename });
};

app.post('/upload', upload.single('audio'), uploadHandler);

app.use('/trpc', createExpressMiddleware({ router: appRouter }));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
