/** @format */

import { Rejector } from '../types';

/**
 * @description
 * Utility function to safely execute an operation and rejecting a outer Promise when an error is caught.
 *
 * @param { Rejector } rejector - the function used to reject the outer Promise when an error is caught
 * @param { (...args: any[]) => Promise<any> } operation - the operation to perform
 *
 * @returns { Promise<void> }
 */

export const safeAsyncAbort = async <T extends (...args: any[]) => Promise<any>>(
    rejector: Rejector,
    operation: T
): Promise<void> => {
    try {
        return await operation();
    } catch (error) {
        rejector(error);
    }
};
