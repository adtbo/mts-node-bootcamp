import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Transaction } from '../class/transaction.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const transactionsDir = path.join(__dirname, '..', 'data', 'transactions');

export async function ensureTransactionsDir() {
  try {
    await fs.access(transactionsDir);
  } catch {
    await fs.mkdir(transactionsDir);
  }
}

export async function loadTransactions(accountNumber: string): Promise<Transaction[]> {
  const filePath = path.join(transactionsDir, `${accountNumber}.json`);
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data).map((txn: any) => new Transaction(txn.accountNumber, txn.type, txn.amount, new Date(txn.date)));
  } catch {
    return [];
  }
}

async function saveTransactions(accountNumber: string, transactions: Transaction[]): Promise<void> {
  const filePath = path.join(transactionsDir, `${accountNumber}.json`);
  await fs.writeFile(filePath, JSON.stringify(transactions, null, 2));
}

export async function addTransaction(accountNumber: string, transaction: Transaction): Promise<void> {
  const transactions = await loadTransactions(accountNumber);
  transactions.push(transaction);
  await saveTransactions(accountNumber, transactions);
}