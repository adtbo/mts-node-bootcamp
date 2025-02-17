export class Transaction {
  public accountNumber: string;
  public type: string;
  public amount: number;
  public date: Date;

  constructor(accountNumber: string, type: string, amount: number, date: Date = new Date()) {
    this.accountNumber = accountNumber;
    this.type = type;
    this.amount = amount;
    this.date = date;
  }
}