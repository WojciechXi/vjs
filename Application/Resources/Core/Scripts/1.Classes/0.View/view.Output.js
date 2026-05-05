class Output extends View {

    get ElementTag() { return 'output'; }

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Value', data.value ?? '', function (property, oldValue, newValue) {
            object.Prop('value', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });
    }

}