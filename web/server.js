const http = require('http')
const url = require('url');

const host = 'localhost'
const port = 2020

module.exports = {
   startServer(client) {
      const server = http.createServer((req, res) => {
         switch (req.url) {
            case '/':
               res.writeHead(200, { 'Content-Type': 'text/plain' });
               res.end(`My first server!\n ${client}`);
               break;
         }
      });

      server.listen(port, host, () => {
         console.log(`Server is running on http://${host}:${port}`);
      });
   },
}