class Layout extends View {
    Init(data = {}) {
        super.Init(data);
        const object = this;
        object.childrenLoop = data.childrenLoop ?? null;
        object.children = [];
        object.Children = data.children;
        new Property(object, 'Direction', data.direction ?? null, object.OnPropertyChanged);
    }
    Bind() {
        super.Bind();
        const object = this;
        new Binding(object, 'Direction', function (sender, data) {
            object.Css('flex-direction', data.value);
        });
    }
    get Children() {
        const object = this;
        return object.children ?? (object.children = []);
    }
    set Children(newChildren) {
        const object = this;
        object.Clear();
        if (Array.isArray(newChildren)) {
            newChildren.forEach(function (newChild, index) {
                if (object.childrenLoop) newChild = object.childrenLoop(newChild, index);
                if (newChild) object.AttachChild(newChild);
            });
        } else if (newChildren instanceof Object) {
            Object.keys(newChildren).forEach(function (key, index) {
                let newChild = newChildren[key];
                if (object.childrenLoop) newChild = object.childrenLoop(newChild, key, index);
                if (newChild) object.AttachChild(newChild);
            });
        }
    }
    Clear() {
        const object = this;
        object.Element.innerHTML = null;
        object.Children.forEach(function (child) {
            if (child) child.Remove();
        });
        object.children = [];
    }
    AddChild(child, index = -1) {
        const object = this;
        return object.AttachChild(child, index);
    }
    RemoveChild(child) {
        const object = this;
        return object.DetachChild(child);
    }
    AttachChild(child, index = -1) {
        const object = this;

        if (!object.Element.appendChild) return false;

        if (child.Parent) child.Parent.RemoveChild(child);

        if (index == 0) object.Children.unshift(child);
        else if (index > 0) object.Children.splice(index, 0, child);
        else object.Children.push(child);

        if (index == 0) object.Element.prepend(child.Element);
        else if (index > 0 && object.Children[index - 1]) object.Children[index - 1].Element.after(child.Element);
        else object.Element.appendChild(child.Element);

        object.OnLayoutChange.Invoke(object, {});
        child.Parent = object;
        return true;

    }
    DetachChild(child) {
        const object = this;
        const index = object.Children.indexOf(child);
        object.Children.splice(index, 1);
        object.OnLayoutChange.Invoke(object, {});
        child.Element.remove();
        child.Parent = object;
        return true;
    }
    get ElementTag() { return 'layout'; }

    Dispose() {
        const object = this;
        for (let child of object.children) child.Dispose();
        super.Dispose();
    }
}