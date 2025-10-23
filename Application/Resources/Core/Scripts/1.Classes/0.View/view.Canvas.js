class Canvas extends View {

    get ElementTag() { return 'canvas'; }

    Init(data = {}) {
        super.Init(data);
        let object = this;

        if (data.onDraw) object.OnDraw.Listen(data.onDraw);
    }

    get OnDraw() {
        let object = this;
        return object.onDraw ?? (object.onDraw = new Callback());
    }

    Draw() {
        let object = this;
        object.ClearRect(0, 0, object.Element.width, object.Element.height);
        object.OnDraw.Invoke(object, object.Context);
    }

    get Context() {
        let object = this;
        return object.context ?? (object.context = object.Element.getContext('2d'));
    }

    ClearRect(x, y, w, h) {
        let object = this;
        object.Context.clearRect(x, y, w, h);
    }

    DrawImage(image, x, y, width, height) {
        let object = this;
        object.Context.drawImage(image, x, y, width, height);
    }

}