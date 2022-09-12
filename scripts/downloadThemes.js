// search marketplace api and download theme files
import https from 'https';
import fs from 'fs';
import path from 'path';
import URL from 'url';

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

    let response = '';
    res.on('data', d => {
      response += d;
    });
    res.on('end', () => {
      try {
        let parsed = JSON.parse(response);
        if(res.statusCode !== 200) {
          console.log(`[${res.statusCode}]: ${url}`);
          return reject({statusCode: res.statusCode, response})
        }
        return resolve(parsed);
      } catch (err) {
        if(res.statusCode === 200) {
          return resolve(response);
        }
        console.log(`[${res.statusCode}]: ${url}`);
        return reject(response);
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


const requestEither = async (basepath1, basepath2, path) => {
  try {
    let result = await request(URL.resolve(basepath1, path));
    console.log('selected', basepath1, URL.resolve(basepath1, path));
    return [basepath1, result];
  } catch (err) {
    let result = await request(URL.resolve(basepath2, path));
    console.log('selected', basepath2, URL.resolve(basepath2, path));
    return [basepath2, result];
  }
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
            extensionName: e.extensionName,
            shortDescription: e.shortDescription,
            publisherName: e.publisher?.publisherName,
            manifest: e.versions[0]?.files?.find(f => f.assetType === "Microsoft.VisualStudio.Code.Manifest")?.source,
            installs: e.statistics?.find(s => s.statisticName === 'install')?.value,
            ratings: e.statistics?.find(s => s.statisticName === 'ratingcount')?.value,
            avg_rating: e.statistics?.find(s => s.statisticName === 'averagerating')?.value,
            weighted_rating: e.statistics?.find(s => s.statisticName === 'weightedRating')?.value,
          }) + "\n");
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
  const extensions = fs.readFileSync(marketplace_results_file).toString('utf8').split("\n").map(rawLine => {
    if(!rawLine) { return null }
    let line = rawLine;

    try {
      return JSON.parse(line);
    } catch (err) {
      console.log(err, line);
      return null;
    }
  }).filter(r=>r);

  const attribution_file = path.resolve('./themes', '_ATTRIBUTION.md');
  fs.writeFileSync(attribution_file, `# Theme Attribution
  Themes are imported from vscode extension themes. 
  The following is a list of theme files authorship.
  `);

  const used_extensions = [];

  let i = 0;
  for(let extension of extensions) {
    if(extension.ratings > 10 || extension.installs > 15000) {
      const manifest_file = path.resolve('./themes/manifests', `${extension.extensionId}.json`);
      if(!fs.existsSync(manifest_file)) {
        console.log(`fetching manifest ${i} of ${extensions.length}, ${extension.displayName}: rated ${extension.weighted_rating} (${extension.ratings} ratings), ${extension.installs} installs`);
        const manifest = await request(extension.manifest);
        fs.writeFileSync(manifest_file, JSON.stringify(manifest));
      }

      const manifest = JSON.parse(fs.readFileSync(manifest_file).toString('utf8'));
      if(typeof manifest !== 'object') {
        continue;
      }
      if(manifest.repository?.type !== 'git' || !manifest.repository?.url || manifest.repository?.url?.indexOf('https://github.com') === -1) {
        continue;
      }
      if(! manifest?.contributes?.themes) {
        continue;
      }
      let files = manifest.contributes.themes.filter(t => {
        let [name, ext] = path.basename(t.path).split('.');
        return ext === 'json'
      });
      if(files.length < 1) {
        continue;
      }

      let repo = manifest.repository?.url.replace('https://github.com/', '').replace(/\.git$/, '');
      console.log('repo', repo);
      let raw_main = `https://raw.githubusercontent.com/${repo}/main/`;
      let raw_master = `https://raw.githubusercontent.com/${repo}/master/`;

      let basepath = null;
      let written = 0;
      do {
        try {
          let file = files.shift();
          let theme_file = path.resolve('./themes/sources', extension.extensionName + '-' + path.basename(file.path));
          if (fs.existsSync(theme_file)) {
            written += 1;
            continue;
          }

          let response;
          if(basepath === null) {
            let [correctBasepath, requestResult] = await requestEither(raw_main, raw_master, file.path);
            basepath = correctBasepath;
            response = requestResult;
          } else {
            response = await request(URL.resolve(basepath, file.path));
          }

          console.log('writing', URL.resolve(basepath, file.path), theme_file);
          fs.writeFileSync(theme_file, typeof response === 'object' ? JSON.stringify(response, null, 2) : response);
          written += 1;
        } catch (err) {
          console.error(err);
        }
      } while (files.length > 0);

      if(written > 0) {
        fs.appendFileSync(attribution_file, `
### ${extension.displayName}
* Publisher: ${extension.publisherName}
* Repository: ${manifest.repository?.url}
        `);
        used_extensions.push(extension);
      }

      // https://raw.githubusercontent.com/Ballerini-Theme/visual-studio-code/main/themes/ballerini-theme.json
      // console.log('retrieving', [raw_main, raw_master], files.map(f => URL.resolve(raw_main, f.path)), files.map(f => URL.resolve(raw_master, f.path)))
      // console.log('manifest', manifest);
      // console.log('contributes', manifest.contributes.themes);
    }
    i+=1;
  }

  fs.writeFileSync(path.resolve('./themes/meta.ts'), `
export const ThemeMeta = ${JSON.stringify(used_extensions, null, 2)}  
  `);
  /*
  extensionId: e.extensionId,
  displayName: e.displayName,
  shortDescription: e.shortDescription,
  manifest: e.versions[0]?.files.find(f => f.assetType === "Microsoft.VisualStudio.Code.Manifest")?.source,
  installs: e.statistics.find(s => s.statisticName === 'install')?.value,
  ratings: e.statistics.find(s => s.statisticName === 'ratingcount')?.value,
  avg_rating: e.statistics.find(s => s.statisticName === 'averagerating')?.value,
  weighted_rating: e.statistics.find(s => s.statisticName === 'weightedRating')?.value,
 */

})();
