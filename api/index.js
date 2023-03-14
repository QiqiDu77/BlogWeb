import express from 'express';
import postRoutes from './routes/posts.js';
import userRoutes from './routes/users.js';
import authRoutes from './routes/auth.js';
import cookieParser from 'cookie-parser';
import multer from 'multer';

const app = express();
app.use(express.json());
app.use(cookieParser());

//上传文件
const storage = multer.diskStorage({
  //上传文件的存储地址,必须要有这个文件存在才行
  destination: function (req, file, cb) {
    cb(null, '../client/public/upload');
  },
  filename: function (req, file, cb) {
    //这里就是给图片加上日期等字符串，下面给的更简单
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    // cb(null, file.fieldname + '-' + uniqueSuffix);
    cb(null, Date.now() + file.originalname);
  },
});
const upload = multer({ storage });
app.post('/api/upload', upload.single('file'), function (req, res) {
  // req.file is the `file` file
  // req.body will hold the text fields, if there were any
  const file = req.file;
  res.status(200).json(file.filename);
});

app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

app.listen(8080, () => {
  console.log('Connected success!');
});
