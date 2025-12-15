class View {

    constructor(data = {}) {
        const object = this;

        object.Init(data);
        object.Bind();
        object.Render();

        if (data.callback) {
            requestAnimationFrame(function () {
                data.callback(object);
            });
        }
    }

    Init(data = {}) {
        const object = this;
        new Property(object, 'Parent', data.parent ?? null, object.OnPropertyChanged);
        new Property(object, 'Classes', data.classes ?? [], object.OnPropertyChanged);
        new Property(object, 'Name', data.name ?? null, object.OnPropertyChanged);
        new Property(object, 'Tooltip', data.tooltip ?? null, object.OnPropertyChanged);
        new Property(object, 'CanSelect', data.canSelect ?? false, object.OnPropertyChanged);
        new Property(object, 'IsSelected', data.isSelected ?? false, object.OnPropertyChanged);
        new Property(object, 'Disabled', data.disabled ?? null, object.OnPropertyChanged);
        new Property(object, 'Multiple', data.multiple ?? null, object.OnPropertyChanged);

        new Property(object, 'BackgroundColor', data.backgroundColor ?? null, object.OnPropertyChanged);
        new Property(object, 'BackgroundImage', data.backgroundImage ?? null, object.OnPropertyChanged);
        new Property(object, 'BackgroundSize', data.backgroundSize ?? null, object.OnPropertyChanged);
        new Property(object, 'BackgroundRepeat', data.backgroundRepeat ?? null, object.OnPropertyChanged);
        new Property(object, 'BackgroundPosition', data.backgroundPosition ?? null, object.OnPropertyChanged);
        new Property(object, 'BackgroundAttachment', data.backgroundAttachment ?? null, object.OnPropertyChanged);

        new Property(object, 'Border', data.border ?? null, object.OnPropertyChanged);
        new Property(object, 'BorderWidth', data.borderWidth ?? null, object.OnPropertyChanged);
        new Property(object, 'BorderStyle', data.borderStyle ?? null, object.OnPropertyChanged);
        new Property(object, 'BorderColor', data.borderColor ?? null, object.OnPropertyChanged);
        new Property(object, 'BorderLeft', data.borderLeft ?? null, object.OnPropertyChanged);
        new Property(object, 'BorderTop', data.borderTop ?? null, object.OnPropertyChanged);
        new Property(object, 'BorderRight', data.bordeRight ?? null, object.OnPropertyChanged);
        new Property(object, 'BorderBottom', data.borderBottom ?? null, object.OnPropertyChanged);
        new Property(object, 'BorderRadius', data.borderRadius ?? null, object.OnPropertyChanged);

        new Property(object, 'PointerEvents', data.pointerEvents ?? null, object.OnPropertyChanged);
        new Property(object, 'Cursor', data.cursor ?? null, object.OnPropertyChanged);
        new Property(object, 'Display', data.display ?? null, object.OnPropertyChanged);
        new Property(object, 'BoxShadow', data.boxShadow ?? null, object.OnPropertyChanged);
        new Property(object, 'Opacity', data.opacity ?? null, object.OnPropertyChanged);
        new Property(object, 'TextOverflow', data.textOverflow ?? null, object.OnPropertyChanged);
        new Property(object, 'Overflow', data.overflow ?? null, object.OnPropertyChanged);
        new Property(object, 'AlignSelf', data.alignSelf ?? null, object.OnPropertyChanged);
        new Property(object, 'AlignItems', data.alignItems ?? null, object.OnPropertyChanged);
        new Property(object, 'JustifyContent', data.justifyContent ?? null, object.OnPropertyChanged);
        new Property(object, 'FlexGrow', data.flexGrow ?? null, object.OnPropertyChanged);
        new Property(object, 'FlexShrink', data.flexShrink ?? null, object.OnPropertyChanged);
        new Property(object, 'FlexWrap', data.flexWrap ?? null, object.OnPropertyChanged);
        new Property(object, 'FlexOrder', data.flexOrder ?? null, object.OnPropertyChanged);
        new Property(object, 'Gap', data.gap ?? null, object.OnPropertyChanged);
        new Property(object, 'Resize', data.resize ?? null, object.OnPropertyChanged);
        new Property(object, 'Position', data.position ?? null, object.OnPropertyChanged);
        new Property(object, 'ZIndex', data.zIndex ?? null, object.OnPropertyChanged);
        new Property(object, 'Left', data.left ?? null, object.OnPropertyChanged);
        new Property(object, 'Top', data.top ?? null, object.OnPropertyChanged);
        new Property(object, 'Right', data.right ?? null, object.OnPropertyChanged);
        new Property(object, 'Bottom', data.bottom ?? null, object.OnPropertyChanged);
        new Property(object, 'Outline', data.outline ?? null, object.OnPropertyChanged);
        new Property(object, 'Margin', data.margin ?? null, object.OnPropertyChanged);
        new Property(object, 'Padding', data.padding ?? null, object.OnPropertyChanged);
        new Property(object, 'MinWidth', data.minWidth ?? null, object.OnPropertyChanged);
        new Property(object, 'Width', data.width ?? null, object.OnPropertyChanged);
        new Property(object, 'MaxWidth', data.maxWidth ?? null, object.OnPropertyChanged);
        new Property(object, 'MinHeight', data.minHeight ?? null, object.OnPropertyChanged);
        new Property(object, 'Height', data.height ?? null, object.OnPropertyChanged);
        new Property(object, 'MaxHeight', data.maxHeight ?? null, object.OnPropertyChanged);
        new Property(object, 'AspectRatio', data.aspectRatio ?? null, object.OnPropertyChanged);
        new Property(object, 'Color', data.color ?? null, object.OnPropertyChanged);
        new Property(object, 'LineHeight', data.lineHeight ?? null, object.OnPropertyChanged);
        new Property(object, 'VerticalAlign', data.verticalAlign ?? null, object.OnPropertyChanged);
        new Property(object, 'TextAlign', data.textAlign ?? null, object.OnPropertyChanged);
        new Property(object, 'TextTransform', data.textTransform ?? null, object.OnPropertyChanged);
        new Property(object, 'TextIdent', data.textIdent ?? null, object.OnPropertyChanged);
        new Property(object, 'LetterSpacing', data.letterSpacing ?? null, object.OnPropertyChanged);
        new Property(object, 'WordSpacing', data.wordSpacing ?? null, object.OnPropertyChanged);
        new Property(object, 'WhiteSpace', data.whiteSpace ?? null, object.OnPropertyChanged);
        new Property(object, 'TextAlignLast', data.textAlignLast ?? null, object.OnPropertyChanged);
        new Property(object, 'TextDecoration', data.textDecoration ?? null, object.OnPropertyChanged);
        new Property(object, 'TextShadow', data.textShadow ?? null, object.OnPropertyChanged);
        new Property(object, 'FontSize', data.fontSize ?? null, object.OnPropertyChanged);
        new Property(object, 'FontFamily', data.fontFamily ?? null, object.OnPropertyChanged);
        new Property(object, 'FontStyle', data.fontStyle ?? null, object.OnPropertyChanged);
        new Property(object, 'FontWeight', data.fontWeight ?? null, object.OnPropertyChanged);
        new Property(object, 'FontVariant', data.fontVariant ?? null, object.OnPropertyChanged);
        new Property(object, 'WritingMode', data.writingMode ?? null, object.OnPropertyChanged);
        new Property(object, 'Transition', data.transition ?? null, object.OnPropertyChanged);
        new Property(object, 'Transform', data.transform ?? null, object.OnPropertyChanged);

        if (data.onPropertyChange) object.OnPropertyChange.Listen(data.onPropertyChange);
        if (data.onLayoutChange) object.OnLayoutChange.Listen(data.onLayoutChange);

        if (data.onClick) object.OnClick.Listen(data.onClick);
        if (data.onDblClick) object.OnDblClick.Listen(data.onDblClick);
        if (data.onContextMenu) object.OnContextMenu.Listen(data.onContextMenu);

        if (data.onFocus) object.OnFocus.Listen(data.onFocus);
        if (data.onBlur) object.OnBlur.Listen(data.onBlur);

        if (data.onMouseWheel) object.OnMouseWheel.Listen(data.onMouseWheel);

        if (data.onMouseDown) object.OnMouseDown.Listen(data.onMouseDown);
        if (data.onMouseUp) object.OnMouseUp.Listen(data.onMouseUp);
        if (data.onMouseEnter) object.OnMouseEnter.Listen(data.onMouseEnter);
        if (data.onMouseMove) object.OnMouseMove.Listen(data.onMouseMove);
        if (data.onMouseOver) object.OnMouseOver.Listen(data.onMouseOver);
        if (data.onMouseLeave) object.OnMouseLeave.Listen(data.onMouseLeave);

        if (data.onTouchStart) object.OnTouchStart.Listen(data.onTouchStart);
        if (data.onTouchMove) object.OnTouchMove.Listen(data.onTouchMove);
        if (data.onTouchEnd) object.OnTouchEnd.Listen(data.onTouchEnd);
        if (data.onTouchCancel) object.OnTouchCancel.Listen(data.onTouchCancel);

        if (data.onDragStart) object.OnDragStart.Listen(data.onDragStart);
        if (data.onDragEnter) object.OnDragEnter.Listen(data.onDragEnter);
        if (data.onDragOver) object.OnDragOver.Listen(data.onDragOver);
        if (data.onDragLeave) object.OnDragLeave.Listen(data.onDragLeave);
        if (data.onDrop) object.OnDrop.Listen(data.onDrop);

        if (data.onKeyDown) object.OnKeyDown.Listen(data.onKeyDown);
        if (data.onKeyUp) object.OnKeyUp.Listen(data.onKeyUp);

        if (data.onRemove) object.OnRemove.Listen(data.onRemove);

        object.OnMouseDown.Listen(function (sender, event) {
            if (event.ctrlKey && object.CanSelect) {
                event.preventDefault();
                event.stopPropagation();
                object.IsSelected = !object.IsSelected;
            }
        });
    }

    Bind() {
        const object = this;
        new Binding(object, 'Classes', function (sender, data) {
            if (data.value && data.value.length) object.Attr('class', data.value.join(' '));
            else object.Attr('class', null);
        });
        new Binding(object, 'Name', function (sender, data) {
            object.Attr('name', object.Name);
        });
        new Binding(object, 'Tooltip', function (sender, data) {
            object.Attr('title', object.Tooltip);
        });
        new Binding(object, 'Disabled', function (sender, data) {
            object.Attr('disabled', object.Disabled);
        });
        new Binding(object, 'Multiple', function (sender, data) {
            object.Attr('multiple', object.Multiple);
        });
        new Binding(object, 'CanSelect', function (sender, data) {
            if (object.CanSelect) object.Attr('selectable', true);
            else object.Attr('selectable', null);
        });
        new Binding(object, 'IsSelected', function (sender, data) {
            if (object.IsSelected) object.Attr('is-selected', true);
            else object.Attr('is-selected', null);
        });

        new Binding(object, 'BackgroundColor', function (sender, data) {
            object.Css('background-color', object.BackgroundColor);
        });
        new Binding(object, 'BackgroundImage', function (sender, data) {
            object.Css('background-image', object.BackgroundImage);
        });
        new Binding(object, 'BackgroundSize', function (sender, data) {
            object.Css('background-size', object.BackgroundSize);
        });
        new Binding(object, 'BackgroundRepeat', function (sender, data) {
            object.Css('background-repeat', object.BackgroundRepeat);
        });
        new Binding(object, 'BackgroundPosition', function (sender, data) {
            object.Css('background-position', object.BackgroundPosition);
        });
        new Binding(object, 'BackgroundAttachment', function (sender, data) {
            object.Css('background-attachment', object.BackgroundAttachment);
        });

        new Binding(object, 'BorderLeft', function (sender, data) {
            object.Css('border-left', object.BorderLeft);
        });
        new Binding(object, 'BorderTop', function (sender, data) {
            object.Css('border-top', object.BorderTop);
        });
        new Binding(object, 'BorderRight', function (sender, data) {
            object.Css('border-right', object.BorderRight);
        });
        new Binding(object, 'BorderBottom', function (sender, data) {
            object.Css('border-bottom', object.BorderBottom);
        });
        new Binding(object, 'Border', function (sender, data) {
            object.Css('border', object.Border);
        });
        new Binding(object, 'BorderWidth', function (sender, data) {
            object.Css('border-width', object.BorderWidth);
        });
        new Binding(object, 'BorderStyle', function (sender, data) {
            object.Css('border-style', object.BorderStyle);
        });
        new Binding(object, 'BorderColor', function (sender, data) {
            object.Css('border-color', object.BorderColor);
        });
        new Binding(object, 'BorderWidth', function (sender, data) {
            object.Css('border-width', object.BorderWidth);
        });
        new Binding(object, 'BorderRadius', function (sender, data) {
            object.Css('border-radius', object.BorderRadius, 'rem');
        });

        new Binding(object, 'Display', function (sender, data) {
            object.Css('display', data.value);
        });
        new Binding(object, 'BoxShadow', function (sender, data) {
            object.Css('box-shadow', object.BoxShadow);
        });
        new Binding(object, 'PointerEvents', function (sender, data) {
            object.Css('pointer-events', object.PointerEvents);
        });
        new Binding(object, 'Cursor', function (sender, data) {
            object.Css('cursor', data.value);
        });
        new Binding(object, 'Opacity', function (sender, data) {
            object.Css('opacity', data.value);
        });
        new Binding(object, 'TextOverflow', function (sender, data) {
            object.Css('text-overflow', object.TextOverflow);
        });
        new Binding(object, 'Overflow', function (sender, data) {
            object.Css('overflow', object.Overflow);
        });
        new Binding(object, 'AlignSelf', function (sender, data) {
            object.Css('align-self', object.AlignSelf);
        });
        new Binding(object, 'AlignItems', function (sender, data) {
            object.Css('align-items', object.AlignItems);
        });
        new Binding(object, 'JustifyContent', function (sender, data) {
            object.Css('justify-content', data.value);
        });
        new Binding(object, 'FlexGrow', function (sender, data) {
            object.Css('flex-grow', data.value);
        });
        new Binding(object, 'FlexShrink', function (sender, data) {
            object.Css('flex-shrink', data.value);
        });
        new Binding(object, 'FlexWrap', function (sender, data) {
            object.Css('flex-wrap', data.value);
        });
        new Binding(object, 'FlexOrder', function (sender, data) {
            object.Css('order', object.FlexOrder);
        });
        new Binding(object, 'Gap', function (sender, data) {
            object.Css('gap', data.value, 'rem');
        });
        new Binding(object, 'Resize', function (sender, data) {
            object.Css('resize', object.Resize);
        });
        new Binding(object, 'Position', function (sender, data) {
            object.Css('position', data.value);
        });
        new Binding(object, 'ZIndex', function (sender, data) {
            object.Css('z-index', data.value);
        });
        new Binding(object, 'Left', function (sender, data) {
            object.Css('left', data.value, 'px');
        });
        new Binding(object, 'Top', function (sender, data) {
            object.Css('top', data.value, 'px');
        });
        new Binding(object, 'Right', function (sender, data) {
            object.Css('right', data.value, 'px');
        });
        new Binding(object, 'Bottom', function (sender, data) {
            object.Css('bottom', data.value, 'px');
        });
        new Binding(object, 'Outline', function (sender, data) {
            object.Css('outline', data.value);
        });
        new Binding(object, 'Margin', function (sender, data) {
            object.Css('margin', data.value, 'rem');
        });
        new Binding(object, 'Padding', function (sender, data) {
            object.Css('padding', data.value, 'rem');
        });
        new Binding(object, 'MinWidth', function (sender, data) {
            object.Css('min-width', data.value, 'px');
        });
        new Binding(object, 'Width', function (sender, data) {
            object.Css('width', data.value, 'px');
        });
        new Binding(object, 'MaxWidth', function (sender, data) {
            object.Css('max-width', data.value, 'px');
        });
        new Binding(object, 'MinHeight', function (sender, data) {
            object.Css('min-height', data.value, 'px');
        });
        new Binding(object, 'Height', function (sender, data) {
            object.Css('height', data.value, 'px');
        });
        new Binding(object, 'MaxHeight', function (sender, data) {
            object.Css('max-height', data.value, 'px');
        });
        new Binding(object, 'AspectRatio', function (sender, data) {
            object.Css('aspect-ratio', data.value);
        });
        new Binding(object, 'Color', function (sender, data) {
            object.Css('color', data.value);
        });
        new Binding(object, 'LineHeight', function (sender, data) {
            object.Css('line-height', data.value);
        });
        new Binding(object, 'VerticalAlign', function (sender, data) {
            object.Css('vertical-align', data.value);
        });
        new Binding(object, 'TextAlign', function (sender, data) {
            object.Css('text-align', data.value);
        });
        new Binding(object, 'TextTransform', function (sender, data) {
            object.Css('text-transform', data.value);
        });
        new Binding(object, 'TextIdent', function (sender, data) {
            object.Css('text-ident', data.value);
        });
        new Binding(object, 'LetterSpacing', function (sender, data) {
            object.Css('letter-spacing', data.value);
        });
        new Binding(object, 'WordSpacing', function (sender, data) {
            object.Css('word-spacing', data.value);
        });
        new Binding(object, 'WhiteSpace', function (sender, data) {
            object.Css('white-space', data.value);
        });
        new Binding(object, 'TextAlignLast', function (sender, data) {
            object.Css('text-align-last', data.value);
        });
        new Binding(object, 'TextDecoration', function (sender, data) {
            object.Css('text-decoration', data.value);
        });
        new Binding(object, 'TextShadow', function (sender, data) {
            object.Css('text-shadow', data.value);
        });
        new Binding(object, 'FontSize', function (sender, data) {
            object.Css('font-size', data.value, 'rem');
        });
        new Binding(object, 'FontFamily', function (sender, data) {
            object.Css('font-family', data.value);
        });
        new Binding(object, 'FontStyle', function (sender, data) {
            object.Css('font-style', data.value);
        });
        new Binding(object, 'FontWeight', function (sender, data) {
            object.Css('font-weight', data.value);
        });
        new Binding(object, 'FontVariant', function (sender, data) {
            object.Css('font-variant', data.value);
        });
        new Binding(object, 'WritingMode', function (sender, data) {
            object.Css('writing-mode', data.value);
        });
        new Binding(object, 'Transition', function (sender, data) {
            object.Css('transition', object.Transition);
        });
        new Binding(object, 'Transform', function (sender, data) {
            object.Css('transform', object.Transform);
        });
    }

    Render() {
        const object = this;
    }

    get ElementTag() { return 'view'; }
    get ElementAttrs() {
        const object = this;
        return {

        };
    }
    get ElementEvents() {
        const object = this;
        return {
            // Click
            click: function (event) {
                object.OnClick.Invoke(object, event);
            },
            dblclick: function (event) {
                object.OnDblClick.Invoke(object, event);
            },
            // ContextMenu
            contextmenu: function (event) {
                object.OnContextMenu.Invoke(object, event);
            },
            // Focus
            focus: function (event) {
                object.OnFocus.Invoke(object, event);
            },
            blur: function (event) {
                object.OnBlur.Invoke(object, event);
            },
            // Mouse
            wheel: function (event) {
                object.OnMouseWheel.Invoke(object, event);
            },
            mousedown: function (event) {
                object.OnMouseDown.Invoke(object, event);
            },
            mouseup: function (event) {
                object.OnMouseUp.Invoke(object, event);
            },
            mouseenter: function (event) {
                object.OnMouseEnter.Invoke(object, event);
            },
            mousemove: function (event) {
                object.OnMouseMove.Invoke(object, event);
            },
            mouseover: function (event) {
                object.OnMouseOver.Invoke(object, event);
            },
            mouseleave: function (event) {
                object.OnMouseLeave.Invoke(object, event);
            },
            // Touch
            touchstart: function (event) {
                object.OnTouchStart.Invoke(object, event);
            },
            touchmove: function (event) {
                object.OnTouchMove.Invoke(object, event);
            },
            touchend: function (event) {
                object.onTouchEnd.Invoke(object, event);
            },
            touchcancel: function (event) {
                object.OnTouchCancel.Invoke(object, event);
            },
            // Drag
            dragstart: function (event) {
                window.dragItem = event.target.view;
                object.OnDragStart.Invoke(object, event);
            },
            dragenter: function (event) {
                event.preventDefault();
                object.OnDragEnter.Invoke(object, event);
            },
            dragover: function (event) {
                event.preventDefault();
                object.OnDragOver.Invoke(object, event);
            },
            dragleave: function (event) {
                event.preventDefault();
                object.OnDragLeave.Invoke(object, event);
            },
            // Drop
            drop: function (event) {
                event.preventDefault();
                object.OnDrop.Invoke(object, event);
            },
            // Key
            keydown: function (event) {
                object.OnKeyDown.Invoke(object, event);
            },
            keyup: function (event) {
                object.OnKeyUp.Invoke(object, event);
            },
        };
    }

    get Element() {
        const object = this;
        if (!object.element) {
            object.element = document.createElement(object.ElementTag);
            object.element.view = object;

            let attrs = object.ElementAttrs;
            Object.keys(attrs).forEach(function (attr) {
                object.Attr(attr, attrs[attr]);
            });

            let events = object.ElementEvents;
            Object.keys(events).forEach(function (event) {
                object.element.addEventListener(event, events[event]);
            });
        }
        return object.element;
    }

    get InnerHTML() { return this.element.innerHTML; }
    set InnerHTML(html) { return this.element.innerHTML = html; }

    get InnerText() { return this.element.innerText; }
    set InnerText(text) { return this.element.innerText = text; }

    Property(propertyName, defaultValue, callback) {
        const object = this;
        return new Property(object, propertyName, defaultValue ?? null, callback ?? object.OnPropertyChanged);
    }

    GC() {
        delete this;
    }

    Trigger(event) {
        const object = this;
        let customEvent = new CustomEvent(event, {
            bubbles: true,
        });
        object.Element.dispatchEvent(customEvent);
    }

    Click() {
        const object = this;
        object.Element.click();
    }

    Input() {
        const object = this;
        object.Trigger('input');
    }

    Change() {
        const object = this;
        object.Trigger('change');
    }

    Find(name) {
        const object = this;
        let element = object.Element.querySelector(`[name="${name}"]`);
        return element ? element.view : null;
    }

    Css(property, value, defaultUnit = null) {
        const object = this;
        if (value !== null) {
            if (defaultUnit) {
                if (typeof value == 'number') object.Element.style.setProperty(property, `${value}${defaultUnit}`);
                else object.Element.style.setProperty(property, value);
            } else {
                object.Element.style.setProperty(property, value);
            }
        }
        else object.Element.style.removeProperty(property);
    }

    Attr(attribute, value) {
        const object = this;
        if (value !== null) object.Element.setAttribute(attribute, value);
        else object.Element.removeAttribute(attribute);
    }

    Prop(property, value) {
        const object = this;
        object.Element[property] = value;
    }

    OnPropertyChanged(propertyName) {
        const object = this;
        object.OnPropertyChange.Invoke(object, propertyName);
    }

    OnLayoutChanged() {
        const object = this;
        object.OnLayoutChange.Invoke(object, {});
    }

    DetachChild(object) {

    }

    AttachChild(object) {

    }

    SetParent(newParent) {
        const object = this;
        if (newParent != object.Parent) if (object.Parent) object.Parent.DetachChild(object);

        if (newParent.AttachChild(object)) object.Parent = newParent;
        else object.Parent = null;
    }

    Remove() {
        const object = this;

        if (object.Parent) object.Parent.DetachChild(object);
        object.Parent = null;
        object.Element.remove();

        object.Removed();
    }

    Removed(from = null) {
        const object = this;
        object.OnRemove.Invoke(object, {});
    }

    //Layout Change

    get OnLayoutChange() {
        const object = this;
        return object.onLayoutChange ?? (object.onLayoutChange = new Callback());
    }

    //Property Change

    get OnPropertyChange() {
        const object = this;
        return object.onPropertyChange ?? (object.onPropertyChange = new Callback());
    }

    //Click

    get OnClick() {
        const object = this;
        return object.onClick ?? (object.onClick = new Callback());
    }

    get OnDblClick() {
        const object = this;
        return object.onDblClick ?? (object.onDblClick = new Callback());
    }

    //ContextMenu

    get OnContextMenu() {
        const object = this;
        return object.onContextMenu ?? (object.onContextMenu = new Callback());
    }

    // Focus

    get OnFocus() {
        const object = this;
        return object.onFocus ?? (object.onFocus = new Callback());
    }

    get OnBlur() {
        const object = this;
        return object.onBlur ?? (object.onBlur = new Callback());
    }

    //Mouse

    get OnMouseWheel() {
        const object = this;
        return object.onMouseWheel ?? (object.onMouseWheel = new Callback());
    }

    get OnMouseDown() {
        const object = this;
        return object.onMouseDown ?? (object.onMouseDown = new Callback());
    }

    get OnMouseUp() {
        const object = this;
        return object.onMouseUp ?? (object.onMouseUp = new Callback());
    }

    get OnMouseEnter() {
        const object = this;
        return object.onMouseEnter ?? (object.onMouseEnter = new Callback());
    }

    get OnMouseMove() {
        const object = this;
        return object.onMouseMove ?? (object.onMouseMove = new Callback());
    }

    get OnMouseOver() {
        const object = this;
        return object.onMouseOver ?? (object.onMouseOver = new Callback());
    }

    get OnMouseLeave() {
        const object = this;
        return object.onMouseLeave ?? (object.onMouseLeave = new Callback());
    }

    //Touch

    get OnTouchStart() {
        const object = this;
        return object.onTouchStart ?? (object.onTouchStart = new Callback());
    }

    get OnTouchMove() {
        const object = this;
        return object.onTouchMove ?? (object.onTouchMove = new Callback());
    }

    get OnTouchEnd() {
        const object = this;
        return object.onTouchEnd ?? (object.onTouchEnd = new Callback());
    }

    get OnTouchCancel() {
        const object = this;
        return object.onTouchCancel ?? (object.onTouchCancel = new Callback());
    }

    //Drag

    get OnDragStart() {
        const object = this;
        return object.onDragStart ?? (object.onDragStart = new Callback());
    }

    get OnDragEnter() {
        const object = this;
        return object.onDragEnter ?? (object.onDragEnter = new Callback());
    }

    get OnDragOver() {
        const object = this;
        return object.onDragOver ?? (object.onDragOver = new Callback());
    }

    get OnDragLeave() {
        const object = this;
        return object.onDragLeave ?? (object.onDragLeave = new Callback());
    }

    get OnDrop() {
        const object = this;
        return object.onDrop ?? (object.onDrop = new Callback());
    }

    //Key

    get OnKeyDown() {
        const object = this;
        return object.onKeyDown ?? (object.onKeyDown = new Callback());
    }

    get OnKeyUp() {
        const object = this;
        return object.onKeyUp ?? (object.onKeyUp = new Callback());
    }

    //Remove

    get OnRemove() {
        const object = this;
        return object.onRemove ?? (object.onRemove = new Callback());
    }

}