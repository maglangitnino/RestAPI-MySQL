import mysql from 'mysql';
import { Product, Products, UnitProduct } from './product.interface';
import { v4 as uuidv4 } from 'uuid';

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'maglangitrestapi',
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to the database!');
});

async function loadProducts(): Promise<Products> {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM products', (err, rows) => {
        if (err) reject(err);
        const products: Products = {};
        rows.forEach((row: any) => {
          products[row.id] = { id: row.id, ...row };
        });
        resolve(products);
      });
    });
  }

async function saveProducts(products: Products): Promise<void> {
    for (const product of Object.values(products)) {
      await new Promise((resolve, reject) => {
        connection.query(
          'INSERT INTO products (id, name, price, quantity, image) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = ?, price = ?, quantity = ?, image = ?',
          [
            product.id,
            product.name,
            product.price,
            product.quantity,
            product.image,
            product.name,
            product.price,
            product.quantity,
            product.image,
          ],
          (err, res) => {
            if (err) reject(err);
            resolve(res);
          }
        );
      });
    }
  }

export const findAll = async (): Promise<UnitProduct[]> => {
  const products = await loadProducts();
  return Object.values(products);
};

export const findOne = async (id: string): Promise<UnitProduct> => {
  const products = await loadProducts();
  return products[id];
};

export const create = async (productInfo: Product): Promise<null | UnitProduct> => {
  const id = uuidv4();
  const products = await loadProducts();

  if (products[id]) {
    throw new Error('Product with this id already exists');
  }

  const newProduct: UnitProduct = {
    id,
    name: productInfo.name,
    price: productInfo.price,
    quantity: productInfo.quantity,
    image: productInfo.image,
  };

  await saveProducts({ [id]: newProduct });
  return newProduct;
};

function random() {
  return Math.floor(Math.random() * 1000000).toString();
}

export const update = async (
    id: string,
    updateValues: Product
  ): Promise<UnitProduct | null> => {
    const products = await loadProducts();
    const product = products[id];
    if (!product) {
      return null;
    }
    const updatedProduct = {
      ...product,
      ...updateValues,
    };
    await saveProducts({ ...products, [id]: updatedProduct });
    return updatedProduct;
  };

export const remove = async (id: string): Promise<null | void> => {
  const products = await loadProducts();
  const product = products[id];
  if (!product) {
    return null;
  }
  await new Promise((resolve, reject) => {
    connection.query('DELETE FROM products WHERE id = ?', [id], (err, res) => {
      if (err) reject(err);
      delete products[id];
      saveProducts(products).then(resolve, reject);
    });
  });
};