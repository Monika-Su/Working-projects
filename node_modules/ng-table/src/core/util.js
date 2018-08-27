/**
 * @private
 */
export function convertSortToOrderBy(sorting) {
    var result = [];
    for (var column in sorting) {
        result.push((sorting[column] === "asc" ? "+" : "-") + column);
    }
    return result;
}
/**
 * @private
 */
export function isGroupingFun(val) {
    return typeof val === 'function';
}
//# sourceMappingURL=util.js.map