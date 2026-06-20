export enum ErrorCode {
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  TRANSACTION_NOT_FOUND = 'TRANSACTION_NOT_FOUND',
  FUND_NOT_FOUND = 'FUND_NOT_FOUND',
  CANNOT_DELETE_DEFAULT_FUND = 'CANNOT_DELETE_DEFAULT_FUND',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
}

export class BusinessError extends Error {
  code: ErrorCode;

  constructor(code: ErrorCode, message?: string) {
    super(message || code);
    this.name = 'BusinessError';
    this.code = code;
    // Set prototype explicitly to ensure instanceof works correctly in TS/JS
    Object.setPrototypeOf(this, BusinessError.prototype);
  }
}
