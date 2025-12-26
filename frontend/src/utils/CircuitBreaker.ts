// CircuitBreaker.ts - Circuit Breaker Pattern Implementation
interface CircuitBreakerOptions {
  failureThreshold: number;      // Number of failures before opening circuit
  timeoutMs: number;             // Timeout period before attempting to close circuit
  successThreshold: number;      // Number of successful calls to close circuit
}

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failureCount: number = 0;
  private lastFailureTime: number | null = null;
  private successCount: number = 0;

  constructor(private options: CircuitBreakerOptions) {}

  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      // Check if enough time has passed to try again
      if (this.lastFailureTime && Date.now() - this.lastFailureTime >= this.options.timeoutMs) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();

      // Success
      if (this.state === 'HALF_OPEN') {
        this.successCount++;
        if (this.successCount >= this.options.successThreshold) {
          this.close();
        }
      } else {
        this.failureCount = 0; // Reset failure count on success
      }

      return result;
    } catch (error) {
      // Failure
      this.failureCount++;
      this.lastFailureTime = Date.now();

      if (this.state === 'HALF_OPEN') {
        // Failure in half-open state, reopen circuit
        this.open();
      } else if (this.failureCount >= this.options.failureThreshold) {
        // Threshold reached, open circuit
        this.open();
      }

      throw error;
    }
  }

  private open(): void {
    this.state = 'OPEN';
    this.successCount = 0;
  }

  private close(): void {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
  }

  private halfOpen(): void {
    this.state = 'HALF_OPEN';
    this.successCount = 0;
  }

  getState(): CircuitState {
    return this.state;
  }

  getFailureCount(): number {
    return this.failureCount;
  }

  reset(): void {
    this.close();
  }
}

// Factory function to create a circuit breaker with default options
export const createCircuitBreaker = (options?: Partial<CircuitBreakerOptions>): CircuitBreaker => {
  const defaultOptions: CircuitBreakerOptions = {
    failureThreshold: 5,      // 5 consecutive failures
    timeoutMs: 60000,         // 1 minute timeout
    successThreshold: 3,      // 3 consecutive successes to close
    ...options
  };

  return new CircuitBreaker(defaultOptions);
};

// Decorator function to wrap API calls with circuit breaker
export const withCircuitBreaker = <T>(
  fn: () => Promise<T>,
  circuitBreaker: CircuitBreaker
): (() => Promise<T>) => {
  return async (): Promise<T> => {
    return circuitBreaker.call(fn);
  };
};

export default CircuitBreaker;