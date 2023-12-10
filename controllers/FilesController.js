import { ObjectId } from 'mongodb';
import { dbClient } from '../utils/db';
import { redisClient } from '../utils/redis';

export default class FilesController {
  static postUpload(req, res) {
    const key = `auth_${req.headers['x-token']}`;
    redisClient.get(key)
      .then((id) => {
        if (id !== null) {
          const _id = new ObjectId(id);
          dbClient.findUser({ _id })
            .then((data) => {
              if (data.length === 1) {
                const newFile = {
                  userId: _id.toString(),
                  name: req.body.name,
                  type: req.body.type,
                  isPublic: req.body.isPublic || false,
                  parentId: req.body.parentId || 0,
                  data: req.body.data,
                };
                Promise.resolve(dbClient.addFile(newFile));
                dbClient.findFile({ name: req.body.name })
                  .then((data) => {
                    if (data.length === 1) {
                      const file = {
                        id: data[0]._id.toString(),
                        userId: data[0].userId,
                        name: data[0].name,
                        type: data[0].type,
                        isPublic: data[0].isPublic,
                        parentId: data[0].parentId,
                      };
                      res.status(201).send(file);
                    }
                  });
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
