export class Account {
  public accountNumber: string;
  public pin: string;
  public balance: number;

  constructor(accountNumber: string, pin: string, balance: number) {
    this.accountNumber = accountNumber;
    this.pin = pin;
    this.balance = balance;
  }

  deposit(amount: number): void {
    this.balance += amount;
  }

  withdraw(amount: number): boolean {
    if (amount > this.balance) {
      return false;
    }
    this.balance -= amount;
    return true;
  }
}