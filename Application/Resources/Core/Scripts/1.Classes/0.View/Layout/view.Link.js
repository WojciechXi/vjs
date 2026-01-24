class Link extends Layout {

    get ElementTag() { return 'a'; }

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Target', data.target ?? null, object.OnPropertyChanged);
        new Property(object, 'Href', data.href ?? null, object.OnPropertyChanged);
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'Target', function (sender, data) {
            object.Attr('target', object.Target);
        });
        new Binding(object, 'Href', function (sender, data) {
            object.Attr('href', object.Href);
        });
    }

}