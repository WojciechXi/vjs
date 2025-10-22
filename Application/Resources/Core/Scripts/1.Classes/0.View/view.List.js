class List extends View {

    Init(data = {}) {
        super.Init(data);
        let object = this;
        new Property(object, 'ListStyleType', data.listStyleType ?? null, object.OnPropertyChanged);
        new Property(object, 'ListStyleImage', data.listStyleImage ?? null, object.OnPropertyChanged);
        new Property(object, 'ListStylePosition', data.listStylePosition ?? null, object.OnPropertyChanged);
    }

    Bind() {
        super.Bind();
        let object = this;
        new Binding(object, 'ListStyleType', function (sender, data) {
            object.Css('list-style-type', data.value);
        });
        new Binding(object, 'ListStyleImage', function (sender, data) {
            object.Css('list-style-image', data.value);
        });
        new Binding(object, 'ListStylePosition', function (sender, data) {
            object.Css('list-style-position', data.value);
        });
    }

    get ElementTag() { return 'ul'; }

}