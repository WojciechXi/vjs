class Navigator extends Layout {

    static get Instance() {
        return this.instance ?? (this.instance = new Navigator());
    }

    static Push(page) {
        this.Instance.AddChild(page);
    }

    static PushAfter(page, after) {
        this.Instance.AddChild(page);
    }

    static PopPage(page) {
        let index = this.Instance.Children.indexOf(page);
        if (index >= 0) this.Instance.Children[index].Pull();
    }

    static Pop() {
        let index = this.Instance.Children.length - 1;
        if (index >= 0) this.Instance.Children[index].Pull();
    }

    static PopTo(index = 1) {
        while (this.Instance.Children.length > index) this.Instance.Pop();
    }

    static Clear() {
        while (this.Instance.Children.length > 0) this.Instance.Pop();
    }

    get ElementTag() {
        return 'navigator';
    }

    Init(data = {}) {
        super.Init(data);
        let object = this;
    }

    Render() {
        let object = this;

        if (App.Instance) App.Instance.AddChild(object);
        else document.body.appendChild(object.Element);
    }

}