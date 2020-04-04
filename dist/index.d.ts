interface FlycacherOptions {
    /** When the size of the cache exceeds this, the cache will be pruned. */
    capacity: number;
    /** The number of records to prune when capacity is reached. */
    prune: number;
    /** The TTL of each cache entry in milliseconds. If omitted, entries will never expire. */
    ttl?: number;
}
/**
 * A lightweight capcity-based key-value cache store.
 */
declare class Flycacher<K, V> {
    /** The Map used internally for the cache. */
    private readonly values;
    /** The maximum capacity of the cache, beyond which pruning will occur. */
    private readonly capacity;
    /** The amount to prune in the event of going over capacity. */
    private readonly pruneAmount;
    /** The TTL of each cache entry in milliseconds. */
    private readonly ttl;
    /** The TTL of the oldest (first) record in the cache as of the last prune call. */
    private oldest;
    /** The callback that provides entries when cache misses occur. */
    private readonly missCallback;
    /**
     * Construct a new cache instance.
     * @param missCallback function called in the event of a cache miss to fetch the missing entry.
     * @param options the options for this instance.
     */
    constructor(missCallback: ((key: K) => Promise<V> | V), options: FlycacherOptions);
    clear(): void;
    delete(key: K): void;
    get(key: K): Promise<V>;
    prune(): void;
}
declare const _default: typeof Flycacher & {
    default: typeof Flycacher;
    Flycacher: typeof Flycacher;
};
export = _default;
