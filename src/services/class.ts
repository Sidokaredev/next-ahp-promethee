/**
 * Class
 */
export class OpsError {
  name: string;
  message: string;
  cause: string;
  constructor(message: string, additional: {
    name: string;
    cause: string;
  } = {
      name: "unnamed",
      cause: "unknown cause",
    }) {
    this.message = message;
    this.cause = additional.cause;
    this.name = additional.name;
  }
}