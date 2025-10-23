class VJSApp extends App {

    static {
        new VJSApp({
            body: document.body,
        });
    }

    Loaded() {
        let object = this;
        Navigator.Push(new MainPage());
    }

}