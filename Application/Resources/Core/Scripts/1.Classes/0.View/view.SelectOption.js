class SelectOption extends View {

    get ElementTag() { return 'option'; }

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Text', data.text ?? '', function (property, oldValue, newValue) {
            object.Prop('text', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });

        new Property(object, 'Value', data.value ?? '', function (property, oldValue, newValue) {
            object.Prop('value', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });
    }

}