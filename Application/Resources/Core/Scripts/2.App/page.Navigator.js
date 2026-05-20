class Navigator extends Layout {

    static {
        const object = this;
        window.addEventListener('popstate', function (event) {
            event.preventDefault();
            if (object.Instance.Children.length <= 1) return;
            object.Pop();
        });
    }

    static get Instance() {
        const object = this;
        return object.instance ?? (object.instance = new Navigator());
    }

    static Push(page) {
        const object = this;
        object.Instance.AddChild(page);
        if (page.GetHistory) window.history.pushState(page.GetHistory(), '');
    }

    static PushAfter(page, after) {
        const object = this;
        object.Instance.AddChild(page);
    }

    static Pop(page = null, dispose = false) {
        const object = this;
        let index = page ? object.Instance.Children.indexOf(page) : object.Instance.Children.length - 1;
        if (index >= 0) object.Instance.Children[index].Pull(dispose);
    }

    static PopTo(index = 1, dispose = false) {
        const object = this;
        for (let page of object.Instance.Children) object.Pop(page, dispose);
    }

    static Clear(dispose = false) {
        const object = this;
        for (let page of object.Instance.Children) object.Pop(page, dispose);
    }

    get ElementTag() {
        return 'navigator';
    }

    Render() {
        let object = this;
        if (App.Instance) App.Instance.AddChild(object);
        else document.body.appendChild(object.Element);
    }

}