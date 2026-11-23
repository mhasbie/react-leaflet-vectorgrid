const fs = require('fs');
const http = require('http');
const path = require('path');

const routes = {
	'/': [path.join(__dirname, 'index.html'), 'text/html; charset=utf-8'],
	'/index.html': [path.join(__dirname, 'index.html'), 'text/html; charset=utf-8'],
	'/fixture.js': [path.join(__dirname, 'dist', 'fixture.js'), 'text/javascript; charset=utf-8'],
	'/leaflet.css': [path.join(__dirname, '..', '..', 'node_modules', 'leaflet', 'dist', 'leaflet.css'), 'text/css; charset=utf-8']
};

http.createServer((request, response) => {
	const route = routes[new URL(request.url, 'http://127.0.0.1').pathname];
	if (!route) {
		response.writeHead(404);
		response.end('Not found');
		return;
	}

	fs.readFile(route[0], (error, content) => {
		if (error) {
			response.writeHead(500);
			response.end(error.message);
			return;
		}
		response.writeHead(200, { 'Content-Type': route[1] });
		response.end(content);
	});
}).listen(4173, '127.0.0.1');
