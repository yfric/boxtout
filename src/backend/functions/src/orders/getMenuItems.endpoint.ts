import { Request, Response } from 'express';
import { Endpoint, RequestType } from '../functionParser/endpoint';

export default new Endpoint(
  'getMenu',
  RequestType.GET,
  (req: Request, res: Response) => {
    res.send({
      orders: [
        { id: 1, name: 'Steak with Jalepeno' },
        { id: 2, name: 'Kiwi and Yoghur bowl' },
      ]
    });
  }
)