export enum RequestType {
    GET = "GET", POST = "POST", PUT = "PUT", DELETE = "DELETE", PATCH = "PATCH"
};

interface ExpressHandler {
    (req: any, res: any): any
}

export class Endpoint {
    name: string;
    handler: Function;
    requestType: RequestType;

    constructor(name: string, requestType: RequestType, handler: ExpressHandler) {
        if (!name || name.length < 1) {
            throw 'Please provide the endpoint name. Endpoint name cannot be blank.';
        };
        if (!handler) {
            throw 'Please provide a endpoint request handler.';
        }
        this.name = name;
        this.handler = handler;
        this.requestType = requestType;
    }
}