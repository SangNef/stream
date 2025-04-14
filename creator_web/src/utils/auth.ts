export const getAccessTokenFromLS = () =>
    localStorage.getItem('accessToken') || '';
export const setAccessToken = (accessToken: string) => {
    console.log('accessToken', accessToken);
    localStorage.setItem('accessToken', accessToken);
};
export const clearAccessToken = () => {
    localStorage.removeItem('accessToken');
};
export const getVietnamTimeString = (): string => {
    const now = new Date();
    const vietnamOffsetMs = 7 * 60 * 60 * 1000;
    const vietnamTime = new Date(now.getTime() + vietnamOffsetMs - now.getTimezoneOffset() * 60 * 1000);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const year = vietnamTime.getFullYear();
    const month = pad(vietnamTime.getMonth() + 1);
    const day = pad(vietnamTime.getDate());
    const hour = pad(vietnamTime.getHours());
    const minute = pad(vietnamTime.getMinutes());
    const second = pad(vietnamTime.getSeconds());
  
    return `${year}_${month}_${day} ${hour}:${minute}:${second}`;
  };