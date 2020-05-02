import multer from 'multer'
import { extname, resolve } from 'path'
import crypto from 'crypto'

export default {
  storage: multer.diskStorage({
    destination: resolve(__dirname, '..', '..', 'tmp', 'uploads'),
    filename: (request, file, callback) => {
      crypto.randomBytes(16, (error, response) => {
        if (error) return callback(error);

        return callback(null, response.toString('hex') + extname(file.originalname));
      });
    },
  }),
}


