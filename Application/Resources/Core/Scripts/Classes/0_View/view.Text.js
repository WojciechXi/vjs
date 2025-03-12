class Text extends View {

    Init(data = {}) {
        super.Init(data);
        let object = this;
        new Property(object, 'Text', data.text ?? '', object.OnPropertyChanged);
    }

    Bind() {
        super.Bind();
        let object = this;
        new Binding(object, 'Text', function (sender, data) {
            object.Element.innerHTML = object.Text;
        });
    }

    get ElementTag() { return 'text'; }

}