/** @format */

/**
 * @description
 * Utility function to sort an object by a property
 *
 * @param { string } property - the property to sort by in an object
 * @param { 'ASC' | 'DESC' } order - the order to sort
 *
 * @returns { (any, any) => number } the sort function
 */

export const sortByProperty = <T>(property: keyof T, order: 'ASC' | 'DESC') => {
    return (first: T, second: T) => {
        let sortOrder = order === 'ASC' ? 1 : -1;
        return (first[property] < second[property] ? -1 : first[property] > second[property] ? 1 : 0) * sortOrder;
    };
};
