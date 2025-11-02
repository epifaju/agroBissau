// Payment Error Types
export class PaymentError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'PaymentError';
  }
}

export class PaymentValidationError extends PaymentError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400, false);
    this.name = 'PaymentValidationError';
  }
}

export class PaymentAPIError extends PaymentError {
  constructor(
    message: string,
    statusCode: number = 500,
    retryable: boolean = true
  ) {
    super(message, 'API_ERROR', statusCode, retryable);
    this.name = 'PaymentAPIError';
  }
}

export class PaymentVerificationError extends PaymentError {
  constructor(message: string, retryable: boolean = true) {
    super(message, 'VERIFICATION_ERROR', 500, retryable);
    this.name = 'PaymentVerificationError';
  }
}

export class PaymentTimeoutError extends PaymentError {
  constructor(message: string = 'Payment request timeout') {
    super(message, 'TIMEOUT_ERROR', 504, true);
    this.name = 'PaymentTimeoutError';
  }
}

