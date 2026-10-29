// A typed token: the symbol identifies the service, the phantom `T` carries its type.
export type ServiceKey<T> = symbol & { __type?: T };

export function createServiceKey<T>(description: string): ServiceKey<T> {
  return Symbol(description) as ServiceKey<T>;
}
