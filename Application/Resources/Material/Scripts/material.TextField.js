class TextFieldMaterial extends Layout {

    get ElementTag() {
        return 'text-field-material';
    }

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Icon', data.icon ?? null, object.OnPropertyChanged);
        new Property(object, 'Placeholder', data.placeholder ?? '', object.OnPropertyChanged);
        new Property(object, 'Value', data.value ?? '', object.OnPropertyChanged);
    }

    Render() {
        let object = this;
        object.Children = [
            new Icon({
                callback: function (view) {
                    new Binding(object, 'Icon', function (sender, data) {
                        view.Text = object.Icon;
                        view.Display = object.Icon ? null : 'none';
                    });
                },
            }),
            new Row({
                children: [
                    new Input({
                        onInput: function (sender, event) {
                            object.Value = sender.Value;
                        },
                        onChange: function (sender, event) {
                            object.Value = sender.Value;
                        },
                        onPaste: function (sender, event) {
                            object.Value = sender.Value;
                        },
                        callback: function (view) {
                            new Binding(object, 'Value', function (sender, data) {
                                view.Value = object.Value;
                            });
                        },
                    }),
                    new Text({
                        callback: function (view) {
                            new Binding(object, 'Placeholder', function (sender, data) {
                                view.Text = object.Placeholder;
                            });
                        },
                    }),
                    new Icon({
                        text: 'close',
                        onClick: function (sender, event) {
                            object.Value = '';
                        },
                    }),
                ],
            }),
        ];
    }

}