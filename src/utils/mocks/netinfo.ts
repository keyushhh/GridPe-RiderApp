const NetInfo = {
    addEventListener: (fn: (state: any) => void) => {
        // Return an unsubscribe function
        return () => {};
    },
    fetch: async () => ({ type: 'none', isConnected: false })
};

export default NetInfo;
