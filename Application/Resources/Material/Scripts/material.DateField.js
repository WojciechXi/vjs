class DateFieldMaterial extends Layout {

    get ElementTag() {
        return 'date-field-material';
    }

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Value', data.value ?? '', object.OnPropertyChanged);
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
                    new Binding(object, 'Value', function (sender, data) {
                        view.Value = object.Value;
                    });
                },
            }),
        ];
    }

}