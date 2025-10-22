class InputNumber extends Input {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.Type = 'number';

        new Property(object, 'Min', data.min ?? null, object.OnPropertyChanged);
        new Property(object, 'Max', data.max ?? null, object.OnPropertyChanged);
        new Property(object, 'Step', data.step ?? 1, object.OnPropertyChanged);
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'Min', function (sender, data) {
            object.Prop('min', object.Min);
        });
        new Binding(object, 'Max', function (sender, data) {
            object.Prop('max', object.Max);
        });
        new Binding(object, 'Step', function (sender, data) {
            object.Prop('step', object.Step);
        });
    }

}