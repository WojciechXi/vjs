class Text extends View {

    get ElementTag() { return 'text'; }

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Text', data.text ?? '', function (property, oldValue, newValue) {
            object.InnerHTML = newValue;
            object.OnPropertyChanged(property, oldValue, newValue);
        });
    }

}