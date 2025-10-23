class ConfirmPage extends Page {

    Init(data = {}) {
        data.zIndex = data.zIndex ?? 1000;
        super.Init(data);
        let object = this;

        object.BackgroundColor = 'transparent';
        object.Padding = 1;

        object.In = new Anim(125, function (sender, data) {
            let opacity = data.t;
            let scale = Math.Lerp(0.5, 1, data.t);
            let y = data.i * -100;
            object.Opacity = opacity;
            object.ContentView.Transform = `scale(${scale}) translateY(${y}%)`;
        });

        object.Out = new Anim(125, function (sender, data) {
            let opacity = data.i;
            let scale = Math.Lerp(1, 0.5, data.t);
            let y = data.t * -100;
            object.Opacity = opacity;
            object.ContentView.Transform = `scale(${scale}) translateY(${y}%)`;
        });

        object.ContentView.BoxShadow = '0rem 0.5rem 1rem rgba(0, 0, 0, 0.5)';
        object.ContentView.BackgroundColor = 'var(--pageBackground)';
        object.ContentView.Color = 'var(--pageColor)';
        object.ContentView.MaxWidth = 720;

        new Property(object, 'Icon', data.Icon ?? 'info', object.OnPropertyChanged);
        new Property(object, 'Header', data.header ?? '', object.OnPropertyChanged);
        new Property(object, 'Body', data.body ?? '', object.OnPropertyChanged);
        new Property(object, 'Footer', data.footer ?? '', object.OnPropertyChanged);

        object.OnClick.Listen(function (sender, event) {
            if (event.target != object.Element) return;
            object.Pull();
        });

        if (data.onCancel) object.OnCancel.Listen(data.onCancel);
        if (data.onConfirm) object.OnConfirm.Listen(data.onConfirm);
    }

    Render() {
        let object = this;

        object.Content = [
            new Row({
                padding: 0.5,
                alignItems: 'center',
                width: '100%',
                children: [
                    new Column({
                        padding: 0.5,
                        children: [
                            new Icon({
                                fontSize: 3,
                                callback: function (text) {
                                    new Binding(object, 'Icon', function (sender, data) {
                                        text.Text = object.Icon;
                                    });
                                },
                            }),
                        ],
                    }),
                    new Column({
                        width: '0%',
                        flexGrow: 1,
                        padding: 0.5,
                        children: [
                            new Text({
                                callback: function (text) {
                                    new Binding(object, 'Header', function (sender, data) {
                                        text.Text = object.Header;
                                    });
                                },
                            }),
                            new Text({
                                fontSize: 0.8,
                                callback: function (text) {
                                    new Binding(object, 'Body', function (sender, data) {
                                        text.Text = object.Body;
                                    });
                                },
                            }),
                            new Text({
                                fontSize: 0.6,
                                callback: function (text) {
                                    new Binding(object, 'Footer', function (sender, data) {
                                        text.Text = object.Footer;
                                    });
                                },
                            }),
                            new Row({
                                justifyContent: 'flex-end',
                                children: [
                                    new Link({
                                        classes: ['button'],
                                        children: [
                                            new Text({
                                                text: 'Anuluj',
                                            }),
                                        ],
                                        onClick: function (button, event) {
                                            object.Pull();
                                            object.OnCancel.Invoke(object, event);
                                        },
                                    }),
                                    new Link({
                                        classes: ['button'],
                                        children: [
                                            new Text({
                                                text: 'Potwierdź',
                                            }),
                                        ],
                                        onClick: function (button, event) {
                                            object.Pull();
                                            object.OnConfirm.Invoke(object, event);
                                        },
                                    }),
                                ],
                            }),
                        ],
                    }),
                ],
            }),
        ];

        object.Children = [
            object.ContentView,
        ];
    }

    get OnCancel() {
        let object = this;
        return object.onCancel ?? (object.onCancel = new Callback());
    }

    get OnConfirm() {
        let object = this;
        return object.onConfirm ?? (object.onConfirm = new Callback());
    }

}