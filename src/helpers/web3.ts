import Web3 from 'web3';

export function makeBatchRequest(web3: Web3, calls: Web3Call[]): Promise<any[]> {
  let batch = new web3.BatchRequest();

  let promises = calls.map(call => {
    return new Promise((res, rej) => {
      let req = call.method.request(call.params, (err, data) => {
        if (err) rej(err);
        else res(data);
      });
      batch.add(req);
    });
  });
  batch.execute();

  return Promise.all(promises);
}

export interface Web3Call {
  method: any;
  params: any;
}
