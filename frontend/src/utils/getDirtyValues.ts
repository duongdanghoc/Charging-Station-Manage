// Hàm lọc ra các field bị thay đổi
function getDirtyValues<T extends Record<string, any>>(
    dirtyFields: Record<string, any>,
    allValues: T
): Partial<T> {
    const changedValues: Partial<T> = {};

    Object.keys(dirtyFields).forEach((key) => {
        // Chỉ lấy những key có trong dirtyFields
        const k = key as keyof T;
        changedValues[k] = allValues[k];
    });

    return changedValues;
}

export { getDirtyValues };
