export default class MusicProvider {

    static sharedProvider() {
        if(!MusicProvider.instance) {
            MusicProvider.instance = new MusicProvider();
        }
        return MusicProvider.instance;
    }

    configure(token) {
        window.MusicKit.configure({
            developerToken: token,
            app: {
                name: 'Appsfly Music',
                build: '2018.6.9'
            }
        });
    }

    getMusicInstance() {
        return window.MusicKit.getInstance();
    }
}