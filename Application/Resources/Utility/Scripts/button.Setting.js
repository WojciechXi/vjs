class ButtonSetting extends Button {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Icon', data.icon ?? '', object.OnPropertyChanged);
        new Property(object, 'IconColor', data.iconColor ?? '#000000', object.OnPropertyChanged);
        new Property(object, 'Header', data.header ?? '', object.OnPropertyChanged);
        new Property(object, 'Text', data.text ?? '', object.OnPropertyChanged);
    }

    Render() {
        let object = this;

        object.Children = [
            new Layout({
                color: 'white',
                borderRadius: 0.5,
                width: '2rem',
                height: '2rem',
                justifyContent: 'center',
                alignItems: 'center',
                children: [
                    new Icon({
                        callback: function (view) {
                            new Binding(object, 'Icon', function (sender, property) {
                                view.Text = object.Icon;
                            });
                        },
                    }),
                ],
                callback: function (view) {
                    new Binding(object, 'Icon', function (sender, property) {
                        view.Display = object.Icon ? null : 'none';
                    });
                    new Binding(object, 'IconColor', function (sender, property) {
                        view.BackgroundColor = object.IconColor;
                    });
                },
            }),
            new Layout({
                width: '0%',
                flexGrow: 1,
                children: [
                    new Text({
                        callback: function (view) {
                            new Binding(object, 'Header', function (sender, property) {
                                view.Text = object.Header;
                            });
                        },
                    }),
                    new Text({
                        fontSize: 0.6,
                        callback: function (view) {
                            new Binding(object, 'Text', function (sender, property) {
                                view.Text = object.Text;
                            });
                        },
                    }),
                ],
            }),
        ];
    }

}