import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Column,
  JoinTable,
} from 'typeorm';

import Customer from '@modules/customers/infra/typeorm/entities/Customer';
import OrdersProducts from '@modules/orders/infra/typeorm/entities/OrdersProducts';

@Entity('orders')
class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(_ => Customer, { eager: true })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column('uuid')
  customer_id: string;

  @OneToMany(() => OrdersProducts, orderProducts => orderProducts.order, {
    eager: true,
    cascade: ['insert', 'update'],
  })
  @JoinTable()
  order_products: OrdersProducts[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export default Order;
