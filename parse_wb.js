const http = require('http');
const port = 3000;

const server = http.createServer(async (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
});

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

server.on('request', handleRequest);

async function getStoreId(storeName) {
  const getStoresData = await fetch('https://static-basket-01.wbbasket.ru/vol0/data/stores-data.json')
    .then((res) => res.json())
    .then((data) => data);

  for (const store of getStoresData) {
    if (store.name === storeName) {
      return store.id;
    }
  }
}

async function handleGetQuantityProduct(storeId) {
  const getProductsList = await fetch(
    'https://card.wb.ru/cards/v1/detail?appType=1&curr=rub&dest=-1257786&spp=27&nm=190456385;166416619;160738996;183271022;183270278;183269075;183266945;166417437;146972802;190879343;178144226;178142953;182770058;160737571;189785767;36328331;154611222;190627235;160740830;173462958;67508839'
  )
    .then((res) => res.json())
    .then((res) => res.data.products);

  let quantityProduct = 0;

  for (const product of await getProductsList) {
    for (const sizes of product.sizes) {
      for (const stocks of sizes.stocks) {
        if (stocks.wh === storeId) {
          quantityProduct += stocks.qty;
        }
      }
    }
  }

  return quantityProduct;
}

async function handleRequest(request, response) {
  const STORE_NAME = 'Казань WB';

  try {
    const storeId = await getStoreId(STORE_NAME);
    const quantityProduct = await handleGetQuantityProduct(storeId);

    response.write(JSON.stringify(quantityProduct));
  } catch (err) {
    response.write('Error: ' + err.message);
  }

  response.end();
}

