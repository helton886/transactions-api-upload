import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  categoryName: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    categoryName,
  }: Request): Promise<Transaction> {
    const categoryRepository = getRepository(Category);
    const transactionRepository = getCustomRepository(TransactionsRepository);
    if (type === 'outcome') {
      const balance = await transactionRepository.getBalance();
      if (balance.total < value)
        throw new AppError("You can't outcome your total balance.");
    }

    let category = await categoryRepository.findOne({
      title: categoryName,
    });
    if (!category) {
      category = await categoryRepository.create({ title: categoryName });
      await categoryRepository.save(category);
    }
    const transaction = await transactionRepository.create({
      title,
      value,
      type,
      category,
    });

    await transactionRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
