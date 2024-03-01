export interface Product {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }
  
  export interface Products {
    [key: string]: UnitProduct;
  }
  
  export interface UnitProduct {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }