export const convertFormatDate = async () => {
    let iso8601 = await getDateISO8601();
    let longDate = iso8601.replace(/[\-:]/g, "");
    let shortDate = longDate.slice(0, 8);
    return { longDate, shortDate };
};
export const getDateISO8601 = async () => {
    let iso8601 = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
    return iso8601;
};

export const convertUnixTimeStamp = async () => {
    const milliseconds = await getTimeMilliseconds();
    const seconds = Math.floor(milliseconds / 1000);
    return { milliseconds, seconds };
};
export const getTimeMilliseconds = async () => {
    return new Date().getTime();
};

export const getDateKst = async (): Promise<string> => {
    const OFFSET = 9 * 60 * 60 * 1000;
    let init = new Date();
    init.setTime(init.getTime() + OFFSET);
    return init.toISOString().replace(/\.\d{3}Z$/, "");
};
