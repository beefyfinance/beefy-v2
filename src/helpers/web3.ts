import Web3 from 'web3';

export function makeBatchRequest(web3: Web3, calls: any[], params: any[]): Promise<any[]> {
  let batch = new web3.BatchRequest();

  let promises = calls.map((call, index) => {
    return new Promise((res, rej) => {
      let req = call.request(params[index], (err, data) => {
        if (err) rej(err);
        else res(data);
      });
      batch.add(req);
    });
  });
  batch.execute();

  return Promise.all(promises);
}
