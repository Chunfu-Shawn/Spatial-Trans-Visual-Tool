export class StaticServerApi {
  getDatasetsPromise() {
    // set read path: localhost:3000/datasets.json
    return fetch('https://rhesusbase.com:9999/datasets.json').then((response) => {
      const results = response.json();
      for (let i = 0; i < results.length; i++) {
        results[i].access = 'direct';
      }
      return results;
    });
  }

  getCategoryNamesPromise() {
    return Promise.resolve([]);
  }

  getViewsPromise() {
    return Promise.resolve([]);
  }
}
