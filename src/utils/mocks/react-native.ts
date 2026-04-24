export const Linking = {
    openURL: async (url: string) => {},
    sendIntent: async (action: string, extras?: any) => {}
};

export const Platform = {
    OS: 'web',
    select: (obj: any) => obj.web || obj.default
};

export default {
    Linking,
    Platform
};
