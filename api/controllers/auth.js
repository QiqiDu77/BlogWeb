import { db } from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { response } from 'express';

//注册
export const register = (req, res) => {
  //判断是不是有已经存在
  const q = 'SELECT * FROM users WHERE email = ? or username = ?';

  db.query(q, [req.body.email, req.body.username], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length) return res.status(409).json('User already exists!');

    //Hash the password and create a user
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    const q = 'INSERT INTO users(username,email,password) VALUES (?)';
    const values = [req.body.username, req.body.email, hash];

    db.query(q, [values], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json('User has been created.');
    });
  });
};
export const login = (req, res) => {
  //检查用户
  const q = 'SELECT * FROM users WHERE username=?';

  db.query(q, [req.body.username], (err, data) => {
    if (err) return res.json(err);
    if (data.length === 0) return res.status(404).json('用户不存在!');
    //检查密码
    const isPasswordCorrect = bcrypt.compareSync(
      req.body.password,
      data[0].password
    );
    if (!isPasswordCorrect) return res.status(400).json('用户名或者密码错误');
    //将获取的信息存入cookie中
    const token = jwt.sign({ id: data[0].id }, 'jwtkey');
    const { password, ...other } = data[0];

    res
      .cookie('access_token', token, {
        httpOnly: true,
      })
      .status(200)
      .json(data[0]);
  });
};
export const logout = (req, res) => {
  res
    .clearCookie('access_token', {
      sameSite: 'none',
      secure: true,
    })
    .status(200)
    .json('User has been logged out');
};
