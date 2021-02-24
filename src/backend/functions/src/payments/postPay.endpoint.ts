import { Request, Response } from 'express';
import { Endpoint, RequestType } from '../functionParser/endpoint';

export default new Endpoint(
    'postPay',
    RequestType.GET,
    (req: Request, res: Response) => {
        res.send({
            payments: [
                { id: 1, name: 'Steak with Jalepeno' },
                { id: 2, name: 'Kiwi and Yoghur bowl' },
            ]
        });
    }
)