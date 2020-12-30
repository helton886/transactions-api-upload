import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import uploadConfig from '../config/upload';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface CsvFile {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  categoryName: string;
}
class ImportTransactionsService {
  async execute(fileName: string): Promise<Transaction[]> {
    const csvPath = path.join(uploadConfig.directory, fileName);
    const csvFileExists = await fs.promises.stat(csvPath);
    if (csvFileExists) {
      const createTransactionService = new CreateTransactionService();
      const readCSVStream = fs.createReadStream(csvPath);
      const parseStream = csvParse({
        from_line: 2,
        ltrim: true,
        rtrim: true,
      });

      const parseCSV = readCSVStream.pipe(parseStream);

      const lines: CsvFile[] = [];

      parseCSV.on('data', line => {
        const [title, type, value, categoryName] = line;
        if (!title || !type || !value || !categoryName) return;
        lines.push({ title, type, value, categoryName });
      });
      await new Promise(resolve => {
        parseCSV.on('end', resolve);
      });
      const transactions: Transaction[] = [];
      for (const line of lines) {
        const transaction = await createTransactionService.execute(line);
        transactions.push(transaction);
      }

      await fs.promises.unlink(csvPath);
      return transactions;
    }
    throw new AppError("file doesn't exists.");
  }
}

export default ImportTransactionsService;
