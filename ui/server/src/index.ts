import express from 'express';
import cors from 'cors';
import { startBalancesWatcher, stopBalancesWatcher } from './utils/eth-workers';

import { router } from './router';

const PORT = process.env.PORT || 9000;

const app = express();

app.use(cors({
  exposedHeaders: ['x-auth-token']
}));
app.use(express.urlencoded());
app.use(express.json());
app.use('/api', router);
app.use(logErrors);

function logErrors(err, req, res, next) {
  console.error(err.stack)
  next(err)
}


const server = app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
  startBalancesWatcher();
});
server.on('close', async function () {
  console.log('Stopping ...');
  stopBalancesWatcher();  
});



export { app, server };
