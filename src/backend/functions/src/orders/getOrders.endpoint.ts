import { Request, Response } from 'express';
import { Endpoint, RequestType } from '../functionParser/endpoint';

// Each endpoint will be defined in its own file for long term maintenance.
export default new Endpoint(
  'getOrders',
  RequestType.POST,
  (req: Request, res: Response) => {
    res.send({
      orders: [
        { id: 1, name: 'Steak with Jalepeno' },
        { id: 2, name: 'Kiwi and Yoghur bowl' },
      ]
    });
  }
)