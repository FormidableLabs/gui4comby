// search marketplace api and download theme files
import https from 'https';
import fs from 'fs';
import path from 'path';

const request = (url, data) => {
  const body = JSON.stringify(data);
  const options = {
    method: data ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
       ...(data ? {
         'Content-Length': body.length
       } : {})
      ,
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(url, options, res => {
    console.log(`statusCode: ${res.statusCode}`);

    let response = '';
    res.on('data', d => {
      response += d;
    });
    res.on('end', () => {
      try {
        let parsed = JSON.parse(response);
        if(res.statusCode !== 200) { reject({statusCode: res.statusCode, response})}
        resolve(parsed);
      } catch (err) {
        resolve(response);
      }
    });
  });

    req.on('error', error => {
      reject(error);
    });

    if(data){
      req.write(body);
    }
    req.end();
  });
}

(async ()=>{
  const marketplace_results_file = path.resolve('./themes/marketplace.results');
  if (!fs.existsSync(marketplace_results_file)) {
    let fetch = true;
    let pageNumber = 1;
    let pageSize = 100;
    do {
      try {
        console.log('marketplace api fetch: ', {pageNumber, pageSize})
        let response = await request('https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery', {
          filters: [
            {
              criteria: [
                {
                  filterType: 8,
                  value: "Microsoft.VisualStudio.Code"
                },
                {
                  filterType: 10,
                  value: "theme"
                },
                {
                  filterType: 12,
                  value: '37888',
                }
              ],
              pageNumber,
              pageSize,
              direction: 2,
              sortBy: 4, // 4 = downloads, 12 = rating
              sortOrder: 0
            }
          ],
          assetTypes: [],
          flags: 870,
        });
        let results = response.results[0];
        let result_metadata = results?.resultMetadata.find(r => r.metadataType === 'ResultCount');
        let count = result_metadata?.metadataItems.find(i => i.name === 'TotalCount').count;

        results.extensions.forEach((e, i) => {
          console.log(`processing ${(pageNumber-1) * pageSize + i} of ${count} - ${e.displayName} : ${e.extensionId}`);
          fs.appendFileSync(marketplace_results_file, JSON.stringify({
            extensionId: e.extensionId,
            displayName: e.displayName,
            shortDescription: e.shortDescription,
            manifest: e.versions[0]?.files.find(f => f.assetType === "Microsoft.VisualStudio.Code.Manifest")?.source
          }));
        });

        fetch = count > pageNumber * pageSize;
        pageNumber += 1;
      } catch (err) {
        console.log('api error retrieving page', pageNumber, err);
        fetch = false;
      }
    } while (fetch);
  }
  // load marketplace.results file
  const results = fs.readFileSync(marketplace_results_file).toString('utf8').split("}{").map(rawLine => {
    if(!rawLine) { return null }
    let line = '{' + rawLine.trim('{').trim('}') + '}';
    try {
      return JSON.parse(line);
    } catch (err) {
      return null;
    }
  }).filter(r=>r);

  let i = 0;
  for(let result of results) {
    console.log(`fetching manifest ${i++} of ${results.length}`);
    const manifest_file = path.resolve('./themes/manifests', `${result.extensionId}.json`);
    if(!fs.existsSync(manifest_file)) {
      const manifest = await request(result.manifest);
      fs.writeFileSync(manifest_file, JSON.stringify(manifest));
    }
  }

  /*
  extensionId: e.extensionId,
  displayName: e.displayName,
  shortDescription: e.shortDescription,
  manifest: e.versions[0]?.files.find(f => f.assetType === "Microsoft.VisualStudio.Code.Manifest")?.source
 */

})();
