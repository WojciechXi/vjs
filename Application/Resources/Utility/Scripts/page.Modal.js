class ModalPage extends Page {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.AlignItems = 'center';

        object.Padding = 1;
        object.ZIndex = 1000;

        object.BackgroundColor = 'rgba(0, 0, 0, 0.5)';
        object.ContentView.BackgroundColor = 'var(--pageBackground)';
        object.ContentView.Color = 'var(--pageColor)';
        object.ContentView.Width = '100%';
        object.ContentView.MaxWidth = 1080;

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
            alignItems: 'center',
            width: '100%',
            maxWidth: 1080,
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