class ServerError {
  public readonly message: string;
  public readonly statusCode: number;

  constructor(message = 'Internal server error.', statusCode = 500) {
    this.message = message;
    this.statusCode = statusCode;
  }
}

export default ServerError;
