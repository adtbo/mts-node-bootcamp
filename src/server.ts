import http from 'http';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadAccounts, saveAccounts } from "./utils/account.ts";
import { ensureTransactionsDir, loadTransactions, addTransaction } from "./utils/transaction.ts";
import { Account } from './class/account.ts';
import { Transaction } from './class/transaction.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, 'public');

let currentAccount: Account | null = null;

ensureTransactionsDir();

const server = http.createServer(async (req, res) => {
  if (req.url === '/' && req.method === 'GET') {
    const filePath = path.join(publicDir, 'index.html');
    const data = await fs.readFile(filePath, 'utf-8');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(data);
  } else if (req.url === '/login.html' && req.method === 'GET') {
    const filePath = path.join(publicDir, 'login.html');
    const data = await fs.readFile(filePath, 'utf-8');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(data);
  } else if (req.url === '/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      const { accountNumber, pin } = JSON.parse(body);
      const accounts = await loadAccounts();
      const account = accounts.find(acc => acc.accountNumber === accountNumber && acc.pin === pin);
      if (account) {
        currentAccount = account;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } else {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false }));
      }
    });
  } else if (req.url === '/dashboard.html' && req.method === 'GET') {
    const filePath = path.join(publicDir, 'dashboard.html');
    const data = await fs.readFile(filePath, 'utf-8');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(data);
  } else if (req.url === '/account' && req.method === 'GET') {
    if (!currentAccount) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not logged in' }));
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        accountNumber: currentAccount.accountNumber,
        balance: currentAccount.balance
      }));
    }
  } else if (req.url === '/balance' && req.method === 'GET') {
    if (!currentAccount) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not logged in' }));
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ balance: currentAccount.balance }));
    }
  } else if (req.url === '/deposit' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      const { amount } = JSON.parse(body);
      if (!currentAccount) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not logged in' }));
      } else {
        currentAccount.deposit(amount);
        await saveAccounts(currentAccount);
        await addTransaction(currentAccount.accountNumber, new Transaction(currentAccount.accountNumber, 'deposit', amount));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: `Deposited $${amount}` }));
      }
    });
  } else if (req.url === '/withdraw' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      const { amount } = JSON.parse(body);
      if (!currentAccount) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not logged in' }));
      } else {
        const success = currentAccount.withdraw(amount);
        if (success) {
          await saveAccounts(currentAccount);
          await addTransaction(currentAccount.accountNumber, new Transaction(currentAccount.accountNumber, 'withdraw', amount));
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: `Withdrawn $${amount}` }));
        } else {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Insufficient funds' }));
        }
      }
    });
  } else if (req.url === '/transactions' && req.method === 'GET') {
    if (!currentAccount) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not logged in' }));
    } else {
      const transactions = await loadTransactions(currentAccount.accountNumber);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(transactions));
    }
  } else if (req.url === '/transactions.html' && req.method === 'GET') {
    const filePath = path.join(publicDir, 'transactions.html');
    const data = await fs.readFile(filePath, 'utf-8');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(data);
  }
  else if (req.url === '/export-csv' && req.method === 'GET') {
    if (!currentAccount) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not logged in' }));
    } else {
      const transactions = await loadTransactions(currentAccount.accountNumber);
      const csv = transactions.map(txn => `${txn.type},${txn.amount},${txn.date.toISOString()}`).join('\n');
      res.writeHead(200, {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="transactions.csv"'
      });
      res.end(`Type,Amount,Date\n${csv}`);
    }
  }
  else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});