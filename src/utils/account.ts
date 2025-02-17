import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Account } from '../class/account.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const accountsFilePath = path.join(__dirname, '..', 'data', 'accounts.json');

export async function loadAccounts(): Promise<Account[]> {
  const data = await fs.readFile(accountsFilePath, 'utf-8');
  return JSON.parse(data).map((acc: any) => new Account(acc.accountNumber, acc.pin, acc.balance));
}

export async function saveAccounts(account: Account): Promise<void> {
  const accounts = await loadAccounts()
  const selectedAccount = accounts.find(acc => acc.accountNumber === account.accountNumber);
  if (selectedAccount) {
    selectedAccount.balance = account.balance
  }

  await fs.writeFile(accountsFilePath, JSON.stringify(accounts, null, 2));
}