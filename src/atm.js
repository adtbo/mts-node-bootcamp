import inquirer from 'inquirer';
import menu from './menu.js1';

const correctPIN = '1234'; // Hardcoded PIN
let balance = 1000; // Initial account balance

function validatePIN(pin) {
  return pin === correctPIN;
}

function checkBalance() {
  console.log(`Your current balance is: $${balance}`);
}

function deposit(amount) {
  balance += amount;
  console.log(`Deposited: $${amount}. New balance: $${balance}`);
}

function withdraw(amount) {
  if (amount > balance) {
    console.log('Insufficient funds.');
  } else {
    balance -= amount;
    console.log(`Withdrawn: $${amount}. New balance: $${balance}`);
  }
}

function login() {
  inquirer.prompt([
    {
      type: 'password',
      name: 'pin',
      message: 'Enter your PIN:',
      mask: '*'
    }
  ]).then(answers => {
    if (validatePIN(answers.pin)) {
      console.log('PIN accepted. Welcome!');
      menu.displayMenu();
    } else {
      console.log('Invalid PIN. Please try again.');
      login();
    }
  });
}

export default {
  checkBalance,
  deposit,
  withdraw,
  login
};