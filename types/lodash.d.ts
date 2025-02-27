declare module 'lodash/debounce' {
    const debounce: <T extends (...args: any[]) => any>(
        func: T,
        wait?: number,
        options?: {
            leading?: boolean;
            trailing?: boolean;
            maxWait?: number;
        }
    ) => T & { cancel(): void };
    export default debounce;
} 