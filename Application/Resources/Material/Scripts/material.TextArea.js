class TextAreaMaterial extends Layout {

    get ElementTag() {
        return 'text-area-material';
    }

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Placeholder', data.placeholder ?? '', object.OnPropertyChanged);
        new Property(object, 'Value', data.value ?? '', object.OnPropertyChanged);
    }

    Render() {
        let object = this;
        object.Children = [
            new Textarea({
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
        ];
    }

}