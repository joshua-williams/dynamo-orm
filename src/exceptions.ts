export class DynamormException extends Error {
  constructor(message) {
    super(message);
  }
}

export class TableNotFoundException extends DynamormException {
  constructor(message) {
    super(message);
  }
}

export class ServiceUnavailableException extends DynamormException {
  constructor(message) {
    super(message);
  }
}

export class PrimaryKeyException extends DynamormException {
  constructor(message) {
    super(message);
  }
}
