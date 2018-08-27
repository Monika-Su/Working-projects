let util = (function () {
    return {
        getParam: function (fun) {
            let str = fun.toString();
            str = str.substring(str.indexOf("(") + 1, str.indexOf(")"));
            let arr = str.split(",");
            for (let i = 0; i < arr.length; i++) {
                arr[i] = arr[i].trim();
            }
            arr.push(fun);
            return (arr);
        }
    }
}());