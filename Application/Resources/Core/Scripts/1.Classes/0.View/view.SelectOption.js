class SelectOption extends View {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Text', data.text ?? '', object.OnPropertyChanged);
        new Property(object, 'Value', data.value ?? '', object.OnPropertyChanged);
        new Property(object, 'Selected', data.selected ?? false, object.OnPropertyChanged);
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'Text', function (sender, data) {
            object.Prop('text', object.Text);
        });
        new Binding(object, 'Value', function (sender, data) {
            object.Prop('value', object.Value);
        });
        new Binding(object, 'Selected', function (sender, data) {
            object.Prop('selected', object.Selected);
        });
    }

    get ElementTag() { return 'option'; }

}