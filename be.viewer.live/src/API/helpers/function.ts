// value có giá trị là 0, false (tất cả các trường hợp viết in hoa)
// sẽ trả về false. Các trường hợp còn lại (bao gồm cả không có giá trị)
// đều trả về true.
export const stringToBoolean = (value: string) => {
    if (value === undefined || value === null) return true;
    const normalizedValue = value.toLowerCase().trim();
    return !(normalizedValue === "0" || normalizedValue === "false");
}