import sha1 from 'sha1';
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { dbClient } from '../utils/db';
import { redisClient } from '../utils/redis';

export default class AuthController {
  static getConnect(req, res) {
    const authToken = (req.headers.authorization).split(' ')[1];
    const user = Buffer.from(authToken, 'Base64').toString('utf8');
    const [email, password] = user.split(':');
    const hashPass = sha1(password);
    dbClient.findUser({ email })
      .then((data) => {
        if (data.length === 1) {
          if (data[0].password === hashPass) {
            const token = uuidv4();
            const key = `auth_${token}`;
            const delay = 86400;
            redisClient.get(key)
              .then((_key) => {
                if (_key === null) {
                  const id = data[0]._id;
                  redisClient.set(key, id.toString(), delay);
                }
              });
            res.status(200).send({ token });
          } else {
            res.status(401).send({ error: 'Unauthorized' });
          }
        } else {
          res.status(401).send({ error: 'Unauthorized' });
        }
      });
  }

  static getDisconnect(req, res) {
    const key = `auth_${req.headers['x-token']}`;
    redisClient.get(key)
      .then((id) => {
        if (id !== null) {
          const _id = new ObjectId(id);
          dbClient.findUser({ _id })
            .then((data) => {
              if (data.length === 1) {
                Promise.resolve(redisClient.del(key));
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
