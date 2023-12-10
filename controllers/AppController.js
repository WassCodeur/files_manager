import { redisClient } from '../utils/redis';
import { dbClient } from '../utils/db';

export default class AppController {
  static getStatus(req, res) {
    const redis = redisClient.isAlive();
    const db = dbClient.isAlive();
    const sttus = {
      redis,
      db,
    };
    res.status(200).send(sttus);
    // console.log(sttus)
  }

  static getStats(req, res) {
    const users = dbClient.nbUsers();
    const files = dbClient.nbFiles();
    Promise.all([users, files])
      .then(([countUsers, countFiles]) => {
        const stats = {
          users: countUsers,
          files: countFiles,
        };
        res.status(200).send(stats);
      });
  }
}

// export const App = new AppController()
// export default App
