class Canvas extends View {

    get ElementTag() { return 'canvas'; }

    get OnDraw() { return this.onDraw ?? (this.onDraw = new Callback()); }
    get Context() { return this.context ?? (this.context = this.Element.getContext('2d')); }

    Init(data = {}) {
        super.Init(data);
        let object = this;

        if (data.onDraw) object.OnDraw.Listen(data.onDraw);
    }

    Draw() {
        let object = this;
        object.ClearRect(0, 0, object.Element.width, object.Element.height);
        object.OnDraw.Invoke(object, object.Context);
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