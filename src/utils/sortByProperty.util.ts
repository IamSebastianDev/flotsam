/** @format */

export const sortByProperty = <T>(property: keyof T, order: 'ASC' | 'DESC') => {
    return (first: T, second: T) => {
        let sortOrder = order === 'ASC' ? 1 : -1;
        return (first[property] < second[property] ? -1 : first[property] > second[property] ? 1 : 0) * sortOrder;
    };
};
