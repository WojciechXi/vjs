class Layout extends View {

    get ElementTag() { return 'layout'; }

    Init(data = {}) {
        super.Init(data);

        const object = this;
        object.childrenLoop = data.childrenLoop ?? null;
        object.children = [];
        object.Children = data.children;

        new Property(object, 'Direction', data.direction ?? null, function (property, oldValue, newValue) {
            object.Css('flex-direction', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });
    }

    get Children() {
        const object = this;
        return object.children ?? (object.children = []);
    }

    set Children(newChildren) {
        const object = this;
        object.SetChildren(newChildren);
    }

    SetChildren(newChildren, useChildrenLoop = true, dispose = false) {
        const object = this;
        object.Clear(dispose);
        if (newChildren instanceof View) {
            object.AttachChild(newChildren);
        } else if (Array.isArray(newChildren)) {
            newChildren.forEach(function (newChild, index) {
                if (useChildrenLoop && object.childrenLoop) newChild = object.childrenLoop(newChild, index);
                if (newChild) object.AttachChild(newChild);
            });
        } else if (newChildren instanceof Object) {
            Object.keys(newChildren).forEach(function (key, index) {
                let newChild = newChildren[key];
                if (useChildrenLoop && object.childrenLoop) newChild = object.childrenLoop(newChild, key, index);
                if (newChild) object.AttachChild(newChild);
            });
        }
    }

    Clear(dispose = false) {
        const object = this;
        object.Element.innerHTML = null;
        object.Children.forEach(function (child) {
            if (!child) return;
            if (dispose && child.Dispose) child.Dispose();
            else if (child.Remove) child.Remove();
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

        if (!object.Element || !object.Element.appendChild) return false;
        if (!child || !child.Element) return false;

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

    Dispose() {
        if (this.isDisposed) return;

        const object = this;
        for (let child of object.children) child.Dispose();
        super.Dispose();
    }

}