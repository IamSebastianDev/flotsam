/** @format */

export { Flotsam } from './lib';
export {
    Like,
    Is,
    Exactly,
    GreaterThan,
    LessThan,
    In,
    GreaterThanOrEqual,
    LessThanOrEqual,
    Unsafe,
    NotEqual,
} from './lib/Evaluators';

export type { Collection, ObjectId, JSONDocument } from './lib';
export type {
    FlotsamInit,
    FlotsamEvent,
    Subscriber,
    Unsubscriber,
    EvaluatorFunction,
    Document,
    DocumentInit,
    QueueTask,
    Rejector,
} from './types';
