const http = require('https');
const fs = require('fs');

const config = require('../../config');

/**
 * requests token to be used for bearer token authentication
 *
 * @param {string} username gitlab username
 * @param {string} password gitlab password
 * @param {string} gitlabHost gitlab host name
 *
 * @return {promise}
 */
const authenticate = (username, password, gitlabHost) => {
  const promise = new Promise((resolve, reject) => {
    const headers = {
      'content-type': 'application/json',
    };

    const options = {
      hostname: gitlabHost,
      method: 'POST',
      path: `/oauth/token?grant_type=password&username=${username}&password=${password}`,
      port: null,
      headers,
    };

    const req = http.request(options, (res) => {
      const chunks = [];

      res.on('data', (chunk) => {
        chunks.push(chunk);
      });

      res.on('end', () => {
        const body = Buffer.concat(chunks);
        resolve(JSON.parse(body.toString()));
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.end();
  });

  return promise;
};

/**
 * Downloads compressed project file from gitlab
 *
 * @param {string} token authorization bearer token
 * @param {string} projectUri gitlab project URI
 * @param {string} gitlabHost gitlab host
 *
 * @return {promise}
 */
const downloadProject = (token, projectId, branch, outputPath) => {
  const path = `/api/${config.GITLAB_API_VERSION}/projects/${projectId}/repository/archive?sha=${branch}`;

  return new Promise((resolve, reject) => {
    const options = {
      host: config.GITLAB_HOST,
      port: null,
      method: 'GET',
      path,
      headers: { Authorization: `Bearer ${token}` },
    };

    const file = fs.createWriteStream(outputPath);
    const req = http.request(options, (res) => {
      res.pipe(file);
      file.on('finish', () => {
        resolve(true);
      });
    });

    req.on('error', (e) => {
      fs.unlink(outputPath); // Delete the file async. (But we don't check the result)
      reject(e);
    });

    req.end();
  });
};

module.exports = {
  authenticate,
  downloadProject,
};
