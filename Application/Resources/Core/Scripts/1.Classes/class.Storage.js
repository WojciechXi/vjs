class Storage {

    static Get(key, defaultValue = null) {
        let value = localStorage.getItem(key);
        return value ?? defaultValue;
    }

    static Set(key, value) {
        return localStorage.setItem(key, value);
    }

    static Is(key, value) {
        return Storage.Get(key) == value;
    }

}