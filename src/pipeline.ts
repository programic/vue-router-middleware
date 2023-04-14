import type { RouteLocationNormalized } from 'vue-router';
import type {
  Destination,
  Middleware,
  Next,
  RoutingContext,
} from './index.d';

export default class Pipeline {
  private destination?: RouteLocationNormalized;
  private context?: RoutingContext;
  protected pipestack: Middleware[] = [];

  public send(passable: RouteLocationNormalized, context: RoutingContext): this {
    this.destination = passable;
    this.context = context;

    return this;
  }

  public through(pipes: Middleware[]): this {
    this.pipestack = pipes;

    return this;
  }

  public async then(destination: Next): Promise<Destination> {
    if (this.destination === undefined || this.context === undefined) {
      throw new Error('A destination and routing context is required to run a pipeline.');
    }

    const pipeline = this.pipes.reduceRight(this.carry(), this.prepareDestination(destination));

    return pipeline(this.destination);
  }

  public async thenReturn(): Promise<Destination> {
    return this.then(async (destination: Destination) => destination);
  }

  public get pipes(): Middleware[] {
    return this.pipestack;
  }

  protected prepareDestination(destinationCallback: Next): (destination: RouteLocationNormalized) => Promise<Destination> {
    return async (destination: RouteLocationNormalized): Promise<Destination> => {
      return destinationCallback(destination);
    };
  }

  protected carry(): (stack: Next, pipe: Middleware) => (destination: RouteLocationNormalized) => Promise<Destination> {
    return (stack: Next, pipe: Middleware) => {
      return async (destination: RouteLocationNormalized): Promise<Destination> => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          return pipe.handle(destination, stack, this.context!);
        } catch (error) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          return this.handleError(error, destination, this.context!);
        }
      };
    };
  }

  protected handleCarry(carry: Destination): Destination {
    return carry;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected handleError(error: unknown, passable: Destination, _context: RoutingContext): Destination {
    throw error;

    return passable;
  }
}
