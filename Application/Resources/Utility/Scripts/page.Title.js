class TitlePage extends Page {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Title', data.title ?? 'Tytuł', object.OnPropertyChanged);
        new Property(object, 'ActionButtons', data.actionButtons ?? [], object.OnPropertyChanged);
    }

    Render() {
        let object = this;

        object.Children = [
            object.TitleView,
            object.ContentView,
        ];
    }

    get TitleView() {
        let object = this;
        return object.titleView ?? (object.titleView = new Row({
            backgroundColor: 'var(--pageBackground)',
            color: 'var(--pageColor)',
            width: '100%',
            alignItems: 'center',
            children: [
                new Row({
                    alignItems: 'center',
                    callback: function (view) {
                        new Binding(object, 'ActionButtons', function (sender, data) {
                            view.Children = object.ActionButtons;
                        });
                    },
                }),
                new Label({
                    width: '0%',
                    flexGrow: 1,
                    justifyContent: 'center',
                    children: [
                        new Text({
                            textAlign: 'center',
                            callback: function (view) {
                                new Binding(object, 'Title', function (sender, property) {
                                    view.Text = object.Title;
                                });
                            },
                        }),
                    ],
                }),
                new Link({
                    classes: ['button'],
                    onClick: function (sender, event) {
                        object.Pull();
                    },
                    children: [
                        new Layout({
                            borderRadius: 0.5,
                            width: '2rem',
                            height: '2rem',
                            justifyContent: 'center',
                            alignItems: 'center',
                            children: [
                                new Icon({ text: 'close' }),
                            ],
                        }),
                    ],
                }),
            ],
        }));
    }

}