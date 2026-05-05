class Audio extends View {

    get ElementTag() { return 'audio'; }

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Source', data.source ?? null, function (property, oldValue, newValue) {
            object.Attr('src', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });
    }

}