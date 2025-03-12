class Layout extends View {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Direction', data.direction ?? null, object.OnPropertyChanged);
        new Property(object, 'ChildrenLoop', data.childrenLoop ?? null, object.OnPropertyChanged);
        new Property(object, 'Children', data.children ?? [], object.OnPropertyChanged, function (children) {
            if (!children) return [];

            if (object.ChildrenLoop) {
                let newChildren = [];
                children.forEach(function (child, index) {
                    newChildren[index] = object.ChildrenLoop(child);
                });
                return newChildren;
            }
            return children;
        });
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'Direction', function (sender, data) {
            object.Css('flex-direction', data.value);
        });
        new Binding(object, 'Children', function (sender, data) {
            object.RenderChildren();
        });
    }

    RenderChildren() {
        let object = this;
        object.Element.innerHTML = null;
        object.Children.forEach(function (child) {
            if (child) child.Parent = object;
        });
    }

    Clear() {
        let object = this;
        object.Children.forEach(function (child) {
            if (child) child.Parent = null;
        });
    }

    AddChild(child) {
        let object = this;
        object.Children.Add(child);
        object.Element.appendChild(child.Element);
        child.Parent = object;
        object.OnLayoutChange.Invoke(object, {});
    }

    RemoveChild(child) {
        let object = this;
        object.Children.Remove(child);
        child.Parent = null;
        object.OnLayoutChange.Invoke(object, {});
    }

    get ElementTag() { return 'layout'; }

}