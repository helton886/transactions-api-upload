import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';

interface Request {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    const transactionsRepository = await getRepository(Transaction);
    const findTrasactionToDelete = await transactionsRepository.findOne({ id });
    if (findTrasactionToDelete) {
      await transactionsRepository.remove(findTrasactionToDelete);
    } else {
      throw new AppError('Transaction not found.');
    }
  }
}

export default DeleteTransactionService;
