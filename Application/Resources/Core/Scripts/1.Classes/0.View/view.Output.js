class Output extends View {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Value', data.value ?? '', object.OnPropertyChanged);
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'Value', function (sender, data) {
            object.Prop('value', object.Value);
        });
    }

    get ElementTag() { return 'output'; }

}