/*
 *  Flycacher - Node.js caching library
 *  Copyright (C) 2020 Brenden Campbell
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Lesser General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Lesser General Public License for more details.
 *
 *  You should have received a copy of the GNU Lesser General Public License
 *  along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

interface FlycacherOptions {
    /** When the size of the cache exceeds this, the cache will be pruned. */
    capacity: number;
    /** The number of records to prune when capacity is reached. */
    prune: number;
    /** The TTL of each cache entry in milliseconds. If omitted, entries will never expire. */
    ttl?: number;
}

interface Entry<T> {
    value: T;
    entered: number;
}

/**
 * A lightweight capcity-based key-value cache store.
 */
class Flycacher<K, V> {
    /** The Map used internally for the cache. */
    private readonly values: Map<K, Entry<V>> = new Map();
    /** The maximum capacity of the cache, beyond which pruning will occur. */
    private readonly capacity: number;
    /** The amount to prune in the event of going over capacity. */
    private readonly pruneAmount: number;
    /** The TTL of each cache entry in milliseconds. */
    private readonly ttl: number | null;
    /** The TTL of the oldest (first) record in the cache as of the last prune call. */
    private oldest: number = Date.now();

    /** The callback that provides entries when cache misses occur. */
    private readonly missCallback: ((key: K) => Promise<V> | V);

    /**
     * Construct a new cache instance.
     * @param missCallback function called in the event of a cache miss to fetch the missing entry.
     * @param options the options for this instance.
     */
    constructor(missCallback: ((key: K) => Promise<V> | V), options: FlycacherOptions) {
        this.missCallback = missCallback;
        this.capacity = options.capacity;
        this.pruneAmount = options.prune;
        this.ttl = options.ttl || null;
    }

    clear() {
        this.values.clear();
    }

    delete(key: K) {
        this.values.delete(key);
    }

    async get(key: K): Promise<V> {
        this.prune();
        const hit = this.values.get(key);
        if (hit) {
            return hit.value;
        }
        const value = await this.missCallback(key);
        this.values.set(key, { entered: Date.now(), value: value });
        return value;
    }

    prune() {
        if (this.values.size > this.capacity) {
            for (const key of this.values.keys()) {
                this.values.delete(key);
                if (this.values.size <= this.capacity - this.pruneAmount) {
                    break;
                }
            }
        }
        if (this.ttl && this.values.size > 0 && this.ttl > 0) {
            const expiry = Date.now() - this.ttl;
            if (this.oldest < expiry) {
                for (const [key, value] of this.values) {
                    if (value.entered < expiry) {
                        this.values.delete(key);
                    } else {
                        this.oldest = value.entered;
                        break;
                    }
                }
            }
            if (this.values.size === 0) {
                this.oldest = Date.now();
            }
        }
    }
}

export = Object.assign(Flycacher, { default: Flycacher, Flycacher });
