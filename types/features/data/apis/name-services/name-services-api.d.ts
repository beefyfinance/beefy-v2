import { type Address } from 'viem';
export declare class NameServicesApi {
    /** Get the domain for an address */
    resolveAddressToDomain(address: string): Promise<string | undefined>;
    /** Get the address for a domain */
    resolveDomainToAddress(domain: string): Promise<Address | undefined>;
    protected getDomainTld(domain: string): string | undefined;
}
