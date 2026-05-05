class IFrame extends View {

    get ElementTag() { return 'iframe'; }

    Init(data = {}) {
        super.Init(data);
        let object = this;
        new Property(object, 'Source', data.source ?? '', function (property, oldValue, newValue) {
            object.Attr('src', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });
    }

}