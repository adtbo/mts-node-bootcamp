import inquirer from 'inquirer';
import atm from './atm.js';

function displayMenu() {
  inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        'Check Balance',
        'Deposit',
        'Withdraw',
        'Exit'
      ]
    }
  ]).then(answers => {
    switch (answers.action) {
      case 'Check Balance':
        atm.checkBalance();
        displayMenu();
        break;
      case 'Deposit':
        inquirer.prompt([
          {
            type: 'number',
            name: 'amount',
            message: 'Enter the amount to deposit:'
          }
        ]).then(depositAnswer => {
          atm.deposit(depositAnswer.amount);
          displayMenu();
        });
        break;
      case 'Withdraw':
        inquirer.prompt([
          {
            type: 'number',
            name: 'amount',
            message: 'Enter the amount to withdraw:'
          }
        ]).then(withdrawAnswer => {
          atm.withdraw(withdrawAnswer.amount);
          displayMenu();
        });
        break;
      case 'Exit':
        console.log('Thank you for using the ATM. Goodbye!');
        process.exit();
        break;
    }
  });
}

export default {
    displayMenu
};