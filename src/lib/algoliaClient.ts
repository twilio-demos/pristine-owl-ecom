import algoliasearch from 'algoliasearch/lite';

export const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '64RBY11HKZ',
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY || '2581cbcad24bee1434196b09b98ce5c4'
);

export default searchClient;
