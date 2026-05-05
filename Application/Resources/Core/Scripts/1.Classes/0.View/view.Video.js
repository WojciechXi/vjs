class Video extends View {

    get ElementTag() { return 'video'; }

    Init(data = {}) {
        super.Init(data);
        let object = this;
        new Property(object, 'Source', data.source ?? '', function (property, oldValue, newValue) {
            object.Attr('src', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });
    }

}