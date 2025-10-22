class Audio extends View {

    Init(data = {}) {
        super.Init(data);
        let object = this;
        new Property(object, 'Source', data.source ?? '', object.OnPropertyChanged);
    }

    Bind() {
        super.Bind();
        let object = this;
        new Binding(object, 'Source', function (sender, data) {
            object.Attr('src', data.value);
        });
    }

    get ElementTag() { return 'audio'; }

}