/** @format */

export type Handler<T> = {
    subscriptionId: ObjectId;
    action: (value: T, previousValue?: T) => void;
};
