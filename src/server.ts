import app from "./app";
import config from "./config";
import { initDB } from "./db";

const port = config.port;

const main = async () => {
  await initDB();
  app.listen(port, () => {
    console.log(`app is listening port ${config.port}`);
  });
};

main();
