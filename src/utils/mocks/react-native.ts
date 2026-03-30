export const Linking = {
    openURL: async () => {},
    sendIntent: async () => {}
};

export const Platform = {
    OS: 'web',
    select: (obj: any) => obj.web || obj.default
};

export default {
    Linking,
    Platform
};
