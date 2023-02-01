/** @format */

export type Subscriber<T> = {
    dispose: () => void;
    once: () => void;
};
