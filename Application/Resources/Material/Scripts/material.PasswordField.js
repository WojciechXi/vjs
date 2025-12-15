class PasswordFieldMaterial extends Layout {

    get ElementTag() {
        return 'password-field-material';
    }

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Icon', data.icon ?? null, object.OnPropertyChanged);
        new Property(object, 'Autocomplete', data.autocomplete ?? null, object.OnPropertyChanged);
        new Property(object, 'Placeholder', data.placeholder ?? null, object.OnPropertyChanged);
        new Property(object, 'Value', data.value ?? null, object.OnPropertyChanged);

        if (data.onInput) object.OnInput.Listen(data.onInput);
        if (data.onChange) object.OnChange.Listen(data.onChange);
        if (data.onPaste) object.OnPaste.Listen(data.onPaste);
    }

    get OnInput() { return this.onInput ?? (this.onInput = new Callback()); }
    get OnChange() { return this.onChange ?? (this.onChange = new Callback()); }
    get OnPaste() { return this.onPaste ?? (this.onPaste = new Callback()); }

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
                flexGrow: 1,
                children: [
                    new Input({
                        type: 'password',
                        onInput: function (sender, event) {
                            object.Value = sender.Value;
                            object.OnInput.Invoke(object, event);
                        },
                        onChange: function (sender, event) {
                            object.Value = sender.Value;
                            object.OnChange.Invoke(object, event);
                        },
                        onPaste: function (sender, event) {
                            object.Value = sender.Value;
                            object.OnPaste.Invoke(object, event);
                        },
                        callback: function (view) {
                            new Binding(object, 'Autocomplete', function (sender, data) {
                                view.Autocomplete = object.Autocomplete;
                            });

                            new Binding(object, 'Name', function (sender, data) {
                                view.Name = object.Name;
                            });

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
                            object.OnInput.Invoke(object, event);
                            object.OnChange.Invoke(object, event);
                        },
                        callback: function (view) {
                            new Binding(object, 'Value', function (sender, data) {
                                view.Display = object.Value ? null : 'none';
                            });
                        },
                    }),
                ],
            }),
        ];
    }

}