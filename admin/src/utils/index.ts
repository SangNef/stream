export const getAccessTokenFromLS = () =>
    localStorage.getItem('accessToken') || '';