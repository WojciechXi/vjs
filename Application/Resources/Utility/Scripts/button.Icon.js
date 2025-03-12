class ButtonIcon extends Button {

    Init(data = {}) {
        super.Init(data);
        let object = this;
        new Property(object, 'Icon', data.icon ?? '', object.OnPropertyChanged);
        new Property(object, 'IconColor', data.iconColor ?? '#000000', object.OnPropertyChanged);
        new Property(object, 'Content', data.content ?? [], object.OnPropertyChanged);
    }

    Render() {
        let object = this;

        object.Children = [
            object.ElementIconContainer,
            new Layout({
                width: '0%',
                flexGrow: 1,
                callback: function (view) {
                    new Binding(object, 'Content', function (sender, data) {
                        view.Children = object.Content;
                    });
                },
            }),
        ];
    }

    get ElementIconContainer() {
        let object = this;
        return object.elementIconContainer ?? (object.elementIconContainer = new Layout({
            color: 'white',
            borderRadius: 0.5,
            width: '2rem',
            height: '2rem',
            justifyContent: 'center',
            alignItems: 'center',
            children: [
                object.ElementIcon,
            ],
            callback: function (view) {
                new Binding(object, 'Icon', function (sender, property) {
                    view.Display = object.Icon ? null : 'none';
                });
                new Binding(object, 'IconColor', function (sender, property) {
                    view.BackgroundColor = object.IconColor;
                });
            },
        }));
    }

    get ElementIcon() {
        let object = this;
        return object.elementIcon ?? (object.elementIcon = new Icon({
            callback: function (view) {
                new Binding(object, 'Icon', function (sender, property) {
                    view.Text = object.Icon;
                });
            },
        }));
    }

}