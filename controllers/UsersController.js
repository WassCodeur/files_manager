import sha1 from 'sha1';
import { ObjectId } from 'mongodb';
import { dbClient } from '../utils/db';
import { redisClient } from '../utils/redis';

export default class UsersController {
  static postNew(req, res) {
    if (req.body.email === undefined || req.body.email === '') {
      res.status(400).send({ error: 'Missing email' });
    } else if (req.body.password === undefined || req.body.password === '') {
      res.status(400).send({ error: 'Missing password' });
    } else {
      const hashPass = sha1(req.body.password);
      dbClient.findUser({ email: req.body.email })
        .then((data) => {
          if (data.length >= 1) {
            res.status(400).send({ error: 'Already exist' });
          } else {
            const data = {
              email: req.body.email,
              password: hashPass,
            };
            const add = dbClient.addUser(data);
            Promise.resolve(add);
            dbClient.findUser({ email: req.body.email })
              .then((data) => {
                if (data.length === 1) {
                  const newUser = {
                    id: data[0]._id,
                    email: data[0].email,
                  };
                  res.status(201).send(newUser);
                }
              });
          }
        });
    }
  }

  static getMe(req, res) {
    const key = `auth_${req.headers['x-token']}`;
    redisClient.get(key)
      .then((id) => {
        if (id !== null) {
          const _id = new ObjectId(id);
          dbClient.findUser({ _id })
            .then((data) => {
              if (data.length === 1) {
                const user = {
                  id: data[0]._id.toString(),
                  email: data[0].email,
                };
                res.status(200).send(user);
              } else {
                res.status(401).send({ error: 'Unauthorized' });
              }
            });
        } else {
          res.status(401).send({ error: 'Unauthorized' });
        }
      });
  }
}
