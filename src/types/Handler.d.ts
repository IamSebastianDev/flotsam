/** @format */

export type Handler<T> = {
    subscriptionId: ObjectId;
    handlerFunction: (value: T, previousValue?: T) => void;
};
