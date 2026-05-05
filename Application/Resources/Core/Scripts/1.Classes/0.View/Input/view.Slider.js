class Slider extends Input {

    Init(data = {}) {
        data.type = data.type ?? 'slider';
        super.Init(data);
        let object = this;

        new Property(object, 'Min', data.min ?? null, function (property, oldValue, newValue) {
            object.Prop('min', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });

        new Property(object, 'Max', data.max ?? null, function (property, oldValue, newValue) {
            object.Prop('max', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });

        new Property(object, 'Step', data.step ?? 1, function (property, oldValue, newValue) {
            object.Prop('step', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });
    }

}