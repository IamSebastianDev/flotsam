/** @format */

/**
 * @description
 * Utility function to safely execute a operation and rejecting a outer Promise when an error is caught.
 *
 * @param { (reason: unknown) => void } reject - the function used to reject the outer Promise when an error is caught
 * @param { (...args: any[]) => Promise<any> } operation - the operation to perform
 *
 * @returns { Promise<void> }
 */

export const safeAsyncAbort = async <T extends (...args: any[]) => Promise<any>>(
    reject: (reason: unknown) => void,
    operation: T
): Promise<void> => {
    try {
        return await operation();
    } catch (error) {
        reject(error);
    }
};
