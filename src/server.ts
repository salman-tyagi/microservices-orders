import http from 'node:http';

import { app } from './app';

export let server: http.Server;

export function startServer() {
  const PORT = 3000;

  server = app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
}
