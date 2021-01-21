import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';
import ICreateOrderDTO from '../dtos/ICreateOrderDTO';
import IUpdateProductsQuantityDTO from '../../products/dtos/IUpdateProductsQuantityDTO';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('Customer not found');
    }

    const productsFind = await this.productsRepository.findAllById(products);

    const orderCreate: ICreateOrderDTO = {
      customer,
      products: [],
    };
    const productsQuantityUpdate: IUpdateProductsQuantityDTO[] = [];

    products.forEach(product => {
      const item = productsFind.find(
        productFind => product.id === productFind.id,
      );

      if (!item) {
        throw new AppError('Cannot create an order for a inexistent product');
      }

      if (item.quantity < product.quantity) {
        throw new AppError('Quantity unavailable');
      }

      productsQuantityUpdate.push({
        id: item.id,
        quantity: item.quantity - product.quantity,
      });

      orderCreate.products.push({
        product_id: item.id,
        price: item.price,
        quantity: product.quantity,
      });
    });

    const order = await this.ordersRepository.create(orderCreate);
    await this.productsRepository.updateQuantity(productsQuantityUpdate);

    return order;
  }
}

export default CreateOrderService;
