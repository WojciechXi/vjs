class DateFieldMaterial extends Layout {

    get ElementTag() {
        return 'date-field-material';
    }

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Icon', data.icon ?? null, object.OnPropertyChanged);
        new Property(object, 'Autocomplete', data.autocomplete ?? null, object.OnPropertyChanged);
        new Property(object, 'Placeholder', data.placeholder ?? null, object.OnPropertyChanged);
        new Property(object, 'Value', data.value ?? null, object.OnPropertyChanged);
    }

    Render() {
        let object = this;
        object.Children = [
            new Input({
                type: 'date',
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
        ];
    }

}