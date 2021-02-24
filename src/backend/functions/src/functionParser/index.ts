import * as express from 'express';
import * as bodyParser from "body-parser";
import * as functions from 'firebase-functions';
import { glob } from 'glob';
import * as path from 'path';
import { Endpoint, RequestType } from './endpoint';

/**
 * This class helps with setting up the exports for the cloud functions deployment.
 *
 * It takes in exports and then adds the required groups and their functions to it for deployment
 * to the cloud functions server.
 */
export class FunctionParser {
  rootPath: string;
  exports: any;

  constructor(rootPath: string, exports: any, buildReactive: boolean = true, buildEndpoints: boolean = true) {
    if (!rootPath) {
      throw 'rootPath is required to find the functions.'
    }
    this.rootPath = rootPath;
    this.exports = exports;
    if (buildReactive) {
      this.buildReactiveFunctions();
    }
    if (buildEndpoints) {
      this.buildRestfulApi();
    }
  }

  /**
   * Looks for all files with .function.js and exports them on the group they belong to
   */
  private buildReactiveFunctions() {
    console.log('ExportHelper - Build reactive cloud functions ... ');
    const glob = require("glob");
    // Get all the files that has .function in the file name
    const functionFiles = glob.sync(`${this.rootPath}/**/*.function.js`, { cwd: this.rootPath, ignore: './node_modules/**' });

    for (let i = 0, fl = functionFiles.length; i < fl; i++) {
      const file = functionFiles[i];
      const filePath = path.parse(file);
      const groupName = filePath.dir.split('/').pop() || 'noGroup';
      const functionName = file.split('/')[3].slice(0, -12); // Strip off '.function.js'

      if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === functionName) {
        if (!this.exports[groupName]) {
          // This creates exports['orders']
          this.exports[groupName] = {};
        }

        console.log(`ExportHelper - Add reactive function ${functionName} to group ${groupName}`);

        this.exports[groupName] = {
          ...this.exports[groupName],
          ...require(file)
        }
      }
    }
    console.log('ExportHelper - Reactive functions added to exports');
  }

  /**
   * Looks at all .endpoint.js files and adds them to the group they belong in
   */
  private buildRestfulApi() {
    console.log('ExportHelper - Build api cloud functions ... ');
    const apiFiles = glob.sync(`${this.rootPath}/**/*.endpoint.js`, { cwd: this.rootPath, ignore: './node_modules/**' });
    const app = express();

    const groupRouters: Map<string, express.Router> = new Map();

    for (let f = 0, fl = apiFiles.length; f < fl; f++) {
      const file = apiFiles[f];
      const filePath = path.parse(file);
      const groupName = filePath.dir.split('/').pop() || 'noGroup';
      let router = groupRouters.get(groupName);

      if (!router) {
        router = express.Router();
        groupRouters.set(groupName, router);
      }

      try {
        this.buildEndpoint(file, router);

      } catch (e) {
        console.log(`Failed to add the endpoint defined in ${file} to the ${groupName} Api. `, e);
      }

      app.use('/', router);
      app.use(bodyParser.json());
      app.use(bodyParser.urlencoded({ extended: false }));

      console.log(`ExportHelper - Add api for ${groupName}`);

      this.exports[groupName] = {
        ...this.exports[groupName],
        "api": functions.https.onRequest(app),
      }
    }
    console.log(`ExportHelper - Api function added to exports ... `);
  }

  /**
   * Parses a .endpoint.js file and sets the endpoint path on the provided router
   */
  private buildEndpoint(file: string, router: express.Router) {
    console.log(`buildEndpoint: ${file}`);
    var endpoint = require(file).default as Endpoint;
    const name = endpoint.name;

    var handler: any = endpoint.handler;

    switch (endpoint.requestType) {
      case RequestType.GET:
        router.get(`/${name}`, handler);
        break;
      case RequestType.POST:
        router.post(`/${name}`, handler);
        break;
      case RequestType.PUT:
        router.put(`/${name}`, handler);
        break;
      case RequestType.DELETE:
        router.delete(`/${name}`, handler);
        break;
      case RequestType.PATCH:
        router.patch(`/${name}`, handler);
        break;
      default:
        throw new Error(`Unsupported requestType defined for endpoint. Please make sure that the endpoint file exports a RequestType using the constants in src/system/constants/requests.ts. We need this value to automatically add the endpoing to the api.`);
    }
    console.log(`Added functionName: ${name} as ${endpoint.requestType} endpoint.`);
  }

}
