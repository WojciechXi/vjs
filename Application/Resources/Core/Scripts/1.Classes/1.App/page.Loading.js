class LoadingPage extends Page {

    Init(data = {}) {
        data.alignItems = 'center';
        data.justifyContent = 'center';
        super.Init(data);
    }

    Render() {
        const object = this;
        object.Children = new Loading({
            width: '4rem', maxWidth: '100%',
        });
    }

}