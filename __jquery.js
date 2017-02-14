/**
 * Created by Administrator on 2017/2/7 0007.
 */


(function (window, undefind) {

    //处理ie8低版本伪数组无法使用push,slice方法的兼容性
    var arr = [], push = arr.push, slice = arr.slice;


    //
    function __jquery(html) {
        return new __jquery.fn.init(html);
    }

    //
    __jquery.fn = __jquery.prototype = {
        constructor: __jquery,
        length: 0,
        init: function (html) {
            //这里面的this指向init函数实例化的itcast对象，此时为空对象
            if (html == null || html == '') {
                //当html为空时，添加events对象
                this.events = {};
                return;
            }
            ;
            if (__jquery.isFunction(html)) {
                var oldFn = onload;
                if (typeof oldFn == 'function') {
                    onload = function () {
                        oldFn();
                        html();
                    }
                } else {
                    onload = html;
                }
                return;
            }
            if (html && html.type === '__jquery') {//html为itcast对象
                //将传入的itcast对象的所有元素加到this中（this为new出来的实例对象。此时为空）
                push.apply(this, html);
                this.selector = html.selector;
                this.events = html.events;
                return;
            }
            if (__jquery.isString(html)) {
                if (/^</.test(html)) {//字符串标签
                    // console.log(this);
                    push.apply(this, parseHTML(html));
                } else {//字符串选择器
                    // console.log(this);
                    push.apply(this, select(html));
                    this.selector = html;
                }
            }
            if (__jquery.isDom(html)) {//判断是否为DOM对象
                //为DOM对象时直接返回包含传入DOM对象的itcast对象
                this[0] = html;
                this.length = 1;
            }

            if (__jquery.isArrayLike(html)) {

            }

            this.events = {};

        },

        //表示使用了选择器
        selector: '',

        //表示对象类型为itcast对象
        type: '__jquery',

        /* //将itcast对象伪数组转换为数组
         toArray: function () {
         return slice.call(this, 0)
         //this伪数组本身没有slice方法，使用call调用
         //相当于this.slice（0，this.length）
         },

         //为了得到itcast伪数组对象中的DOM对象
         get: function (index) {
         if (index === undefind) {
         return this.toArray();
         }
         return this[index];
         },

         //得到itcast伪数组对象中的DOM对象然后包装成itcast对象
         eq: function (num) {
         var dom;
         if (num >= 0) {
         dom = this.get(num);
         } else {
         dom = this.get(num + this.length);
         }
         return this.constructor(dom);//返回itcast对象
         // return __jquery(dom);

         },
         //对itcast伪数组循环遍历的DOM对象进行操作
         each: function (func) {
         //this为实例化的itcast伪数组对象
         return __jquery.each(this, func);
         },
         //
         map: function (func) {
         return __jquery.map(this,func);
         }*/
    };


    //让itcast.fn.init函数继承appendTo方法；
    //此处itcast.fn的作用是使得itcast.fn.init函数实例出来的对象都具有添加在itcast原型上的方法
    __jquery.fn.init.prototype = __jquery.fn;


    //拓展方法
    //给构造函数itcast,itcast原型以及init原型添加方法
    __jquery.extend = __jquery.fn.extend = function (obj) {
        for (var k in obj) {
            this[k] = obj[k];
        }
    }


    //选择器引擎方法
    var select = function () {
        //基本函数，support对象，验证qsa与byClass
        var push = [].push;
        try {
            var div = document.createElement('div');
            div.innerHTML = '<p></p>';
            var arr = [];
            push.apply(arr, div.getElementsByTagName('p'));

        } catch (e) {
            push = {
                apply: function (array1, array2) {
                    for (var i = 0; i < array2.length; i++) {
                        //  array1[array1.length++] = array2[i];
                        array1.push(array2[i]);
                    }
                }
            }
        }

        var support = {};
        //正则表达式
        var rnative = /\{\s*\[native/;
        var rtrim = /^\s+|\s+$/g;
        var rbaseselector = /^(?:\#([\w\-]+)|\.([\w\-]+)|(\*)|(\w+))$/;

        //能力检测
        support.getElementsByClassName = rnative.test(document.getElementsByClassName + '');
        support.qsa = rnative.test(document.querySelectorAll + '');
        support.trim = rnative.test(String.prototype.trim + '');
        support.indexOf = rnative.test(Array.prototype.indexOf + '');

        //类名选择器兼容性基本方法
        function byClassName(className, node) {
            node = node || document;
            var list, arr = [];
            if (support.getElementsByClassName) {
                return node.getElementsByClassName(className)
            } else {
                list = node.getElementsByTagName('*');

                for (var i = 0; i < list.length; i++) {
                    if ((' ' + list[i].className + ' ').indexOf(' ' + className + ' ') > -1) {
                        arr.push(list[i]);
                    }
                }
                return arr;
            }
        }

        //两端去空格基本方法
        function myTrim(str) {
            if (support.trim) {
                return str.trim();
            } else {
                return str.replace(rtrim, '');
            }
        }

        //自定义indexOf方法
        function myIndexOf(array, search, startIndex) {
            startIndex = startIndex || 0;
            if (support.indexOf) {
                return array.indexOf(search, startIndex);
            } else {
                for (var i = startIndex; i < array.length; i++) {
                    if (array[i] === search) {
                        return i;
                    }
                }
                return -1;
            }
        }

        //元素去重方法
        function unique(array) {
            var resArr = [];
            for (var i = 0; i < array.length; i++) {
                if (myIndexOf(resArr, array[i]) == -1) {
                    resArr.push(array[i]);
                }
            }
            return resArr;
        }


        //基本选择器方法
        function basicSelect(selector, node) {
            node = node || document;
            var m, res;
            if (m = rbaseselector.exec(selector)) {
                if (m[1]) {
                    res = document.getElementById(m[1]);
                    if (res) {
                        return [res];
                    } else {
                        return [];
                    }
                } else if (m[2]) {
                    return byClassName(m[2], node);
                } else if (m[3]) {
                    return node.getElementsByTagName(m[3]);
                } else if (m[4]) {
                    return node.getElementsByTagName(m[4]);
                }
            }

            return [];
        }

        //后代选择器方法
        function select2(selector, results) {
            results = results || [];
            var selectorArr = selector.split(' ');
            var arr = [], node = [document];

            for (var i = 0; i < selectorArr.length; i++) {
                for (var j = 0; j < node.length; j++) {
                    push.apply(arr, basicSelect(selectorArr[i], node[j]))
                }
                node = arr;
                arr = [];
            }
            push.apply(results, node);
            return results;
        }

        //实现选择元素的函数
        function select(selector, results) {
            results = results || [];
            var selectorArr, subselector;

            //判断选择器为字符串
            if (typeof selector != 'string')  return results;

            if (support.qsa) {
                push.apply(results, document.querySelectorAll(selector));
            } else {
                selectorArr = selector.split(',');
                for (var i = 0; i < selectorArr.length; i++) {
                    subselector = myTrim(selectorArr[i]);
                    if (rbaseselector.test(subselector)) {//基本选择器
                        push.apply(results, basicSelect(subselector))
                    } else {//后代选择器
                        select2(subselector, results)
                    }
                }
            }
            return unique(results);
        }

        return select;

    }()

    //暴露出select接口，方便引入jquery sizzle引擎并使用sizzle引擎，例如itcast.select = Sizzle;
    /*__jquery.select = select;*/


    /*DOM操作方法*/
    //将字符串转化为DOM对象的方法
    var parseHTML = function () {
        function parseHTML(html) {
            var div = document.createElement('div');
            div.innerHTML = html;
            var arr = [];
            for (var i = 0; i < div.childNodes.length; i++) {
                arr.push(div.childNodes[i]);
            }
            return arr;
        }

        return parseHTML;
    }();
    /*__jquery.parseHTML = parseHTML;*/


    //给构造函数的原型添加方法（动态方法）
    __jquery.fn.extend({

        appendTo: function (selector) {
            //得到itcast对象
            var iObj = this.constructor(selector);
            //将进行appendTo操作的对象存储到newObj对象中，以便进行链式操作
            var newObj = this.constructor();
            for (var i = 0; i < this.length; i++) {
                for (var j = 0; j < iObj.length; j++) {
                    var temp =
                        i == this.length - 1 && j == iObj.length - 1 ? this[i] : this[i].cloneNode(true);
                    push.call(newObj, temp);
                    iObj[j].appendChild(temp);
                }
            }
            return newObj;
        },
        prependTo: function (selector) {
            //得到itcast对象
            var iObj = this.constructor(selector);
            //将进行appendTo操作的对象存储到newObj对象中，以便进行链式操作
            var newObj = this.constructor();
            for (var i = 0; i < this.length; i++) {
                for (var j = 0; j < iObj.length; j++) {
                    var temp =
                        i == this.length - 1 && j == iObj.length - 1 ? this[i] : this[i].cloneNode(true);
                    push.call(newObj, temp);
                    // iObj[j].appendChild(temp);
                    this.constructor.prependChild(iObj[j], temp);
                }
            }

            return newObj;
        },
        prepend: function (selector) {
            //得到itcast对象(方法一)
            var iObj = this.constructor(selector);
            for (var i = 0; i < iObj.length; i++) {
                for (var j = 0; j < this.length; j++) {
                    var temp =
                        i == iObj.length - 1 && j == this.length - 1 ? iObj[i] : iObj[i].cloneNode(true);
                    this.constructor.prependChild(this[j], temp);
                }
            }

            //方法二
            // this.constructor(selector).prependTo(this);

            return this;
        },
        append: function (selector) {

            //得到itcast对象(方法一)
            var iObj = this.constructor(selector);

            for (var i = 0; i < iObj.length; i++) {
                for (var j = 0; j < this.length; j++) {
                    var temp =
                        i == iObj.length - 1 && j == this.length - 1 ? iObj[i] : iObj[i].cloneNode(true);

                    this[j].appendChild(temp);
                }
            }

            //方法二
            // this.constructor(selector).appendTo(this);

            return this;
        },

        //将itcast对象伪数组转换为数组
        toArray: function () {
            return slice.call(this, 0)
            //this伪数组本身没有slice方法，使用call调用
            //相当于this.slice（0，this.length）
        },

        //为了得到itcast伪数组对象中的DOM对象
        get: function (index) {
            if (index === undefind) {
                return this.toArray();
            }
            return this[index];
        },

        //得到itcast伪数组对象中的DOM对象然后包装成itcast对象
        eq: function (num) {
            var dom;
            if (num >= 0) {
                dom = this.get(num);
            } else {
                dom = this.get(num + this.length);
            }
            return this.constructor(dom);//返回itcast对象
            // return __jquery(dom);

        },
        //对itcast伪数组循环遍历的DOM对象进行操作
        each: function (func) {
            //this指向调用该方法实例化的itcast伪数组对象
            return this.constructor.each(this, func);
        },
        //
        map: function (func) {
            return this.constructor.map(this, func);
        },
        /*事件处理*/
        on: function (type, fn) {
            //判断itcast对象中events属性是否存在click点击事件，并将函数添加到对应事件的数组中存储起来
            if (!this.events[type]) {
                this.events[type] = [];
                var that = this;
                this.each(function () {
                    var _that = this;
                    var f = function (e) {
                        for (var i = 0; i < that.events[type].length; i++) {
                            that.events[type][i].call(_that, e);
                        }
                    };
                    if (this.addEventListener) {
                        this.addEventListener(type, f);
                    } else {
                        this.attachEvent('on' + type, f);
                    }

                });
            }
            this.events[type].push(fn);
            return this;
        },
        off: function (type, fn) {
            var arr = this.events[type];
            if (arr) {
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i] == fn) {
                        arr.splice(i, 1);
                        break;
                    }
                }
            }
            return this;
        },

        hover: function (fn1, fn2) {
            return this.mouseover(fn1).mouseout(fn2);
        },
        toggle: function () {
            var i = 0;
            var args = arguments;
            this.on('click', function (e) {
                console.log(this);
                args[i % args.length].call(this, e);
                i++;
            });
        },

        /*样式操作和属性操作*/
        css: function (option) {
            var length = arguments.length,
                args = arguments;
            if (length === 2) {//参数为键值对形式
                if (__jquery.isString(args[0]) && __jquery.isString(args[1])) {
                    return this.each(function () {
                        this.style[args[0]] = args[1];
                    })
                }
            } else if (length === 1) {
                if (__jquery.isString(option)) {
                    //只能获取到行内样式，非行内样式时为空字符串
                    /*return this[0].style[option];*/

                    //处理非行内样式时获取样式的ie浏览器兼容性问题
                    return this[0].style[option] || __jquery.getStyle(this[0], option);

                } else if (__jquery.isObj(option)) {
                    return this.each(function () {
                        for (var k in option) {
                            this[i].style[k] = option[k];
                        }
                    });
                }
            }
            return this;
        },
        /*类名操作*/
        addClass: function (name) {
            return this.each(function () {
                var classStr = this.className;
                //一般实现
                /* if (classStr) {
                 var arr = classStr.split(' ');
                 for (var i = 0; i < arr.length; i++) {
                 if(arr[i]===name) {
                 break;
                 };
                 };
                 if(i==arr.length) {//正常跳出
                 this.className += ' '+name;
                 }else {//中间跳出
                 }
                 } else {
                 this.className += name;
                 };*/
                //算法优化
                if (classStr) {
                    if ((' ' + classStr + ' ').indexOf(' ' + name + ' ') == -1) {//正常跳出
                        this.className += ' ' + name;
                    } else {//中间跳出
                    }
                } else {
                    this.className += name;
                }
                ;
            });
        },
        removeClass: function (name) {
            return this.each(function () {
                //一般实现
                /*var classStr = this.className;
                 if(classStr) {
                 var arr = classStr.split(' ');
                 for(var i=arr.length-1;i>=0;i--) {
                 //为了保证删除元素后的正常遍历因此使用倒序遍历
                 if(arr[i]===name) {
                 arr.splice(i,1);
                 }
                 }
                 this.className = arr.join(' ');
                 };*/

                //正则优化
                var classStr = ' ' + this.className + ' ';
                var rclassName = new RegExp(' ' + name + ' ', 'g');
                this.className = classStr.replace(rclassName, ' ').replace(/\s+/g, ' ').trim();

            });
        },
        toggleClass: function (name) {
            if (this.hasClass(name)) {
                this.removeClass(name);
            } else {
                this.addClass(name);
            }
            return this;
        },

        /*属性操作*/
        attr: function (name, value) {
            if (__jquery.isString(name) && __jquery.isString(value)) {
                return this.each(function () {
                    //使用setAttribute可以添加所有的属性（标准和非标准）
                    //非标准即系统中不存在自定义的属性
                    this.setAttribute(name, value);
                })
            } else {
                if (__jquery.isString(name)) {
                    return this[0].getAttribute(name);
                }
            }
            return this;
        },
        prop: function (name, value) {
            if (__jquery.isString(name) && __jquery.isString(value)) {
                return this.each(function () {
                    this[name] = value;
                })
            } else {
                if (__jquery.isString(name)) {
                    return this[0][name];
                }
            }
            return this;
        },
        val: function (value) {
            return this.attr('value', value);
        },
        html: function (html) {
            return this.prop('innerHTML', html);
        },
        text: function (txt) {
            if (txt) {
                return this.each(function () {
                    this.innerHTML = '';
                    this.appendChild(document.createTextNode(txt + ''));
                })
            } else {
                //遍历元素所有子节点，如果是文本节点（nodeType==3）就将其存入数组，如果是元素节点（nodeType==1）就再次遍历
                var arr = [];
                __jquery.getTxt(this[0], arr);
                return arr.join(' ');
            }
        },
        /*动画操作模块*/
        //dom: DOM对象 props：属性  dur:动画总时间 easing:运动动画函数
        animate: function (props, dur, easing,fn) {
            var dom = this[0];
            var isOver = false;
            var that = this;
            //获取元素当前位置
            var startX = parseInt(dom.style.left || dom.offsetLeft);
            var startY = parseInt(dom.style.top || dom.offsetTop);

            //记录计时器开始执行之前的时间
            var startTime = +new Date();

            this.intervalId = setInterval(function () {
                var t = (+new Date()) - startTime;

                //到达指定时间停止
                if (t >= dur) {
                    clearInterval(that.intervalId);
                    t = dur;
                    isOver = true;
                };

                //设置默认动画
                easing = easing || 'change';
                //设置元素在经过durTime后的位置
                dom.style.left = startX + __jquery.easing[easing](null, t, startX, parseInt(props['left']), dur) + 'px';
                dom.style.top = startY + __jquery.easing[easing](null, t, startY, parseInt(props['top']), dur) + 'px';

                //判断动画是否结束
                if(isOver) {
                    //让itcast的DOM对象调用fn函数，使其this指向该DOM对象
                    fn.apply(that);
                };

            }, 20)
        },
        intervalId: null,
        stop: function () {
            clearInterval(this.intervalId);
            this.intervalId = null;
        },

    });


    //动画处理方法
    __jquery.easing = {
        //t:经过的时间 d:动画总时间 b:起始位置 c:终止位置
        line: function (x, t, b, c, d) {
            var speed = (c - b) / d;
            return speed * t;
        },
        change: function (x, t, b, c, d) {
            return Math.log(t + 1) / Math.log(d + 1) * ( c - b );

        },
        easeInQuad: function (x, t, b, c, d) {
            return c * (t /= d) * t + b;
        },
        easeOutQuad: function (x, t, b, c, d) {
            return -c * (t /= d) * (t - 2) + b;
        },
        easeInOutQuad: function (x, t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t + b;
            return -c / 2 * ((--t) * (t - 2) - 1) + b;
        },
        easeInCubic: function (x, t, b, c, d) {
            return c * (t /= d) * t * t + b;
        },
        easeOutCubic: function (x, t, b, c, d) {
            return c * ((t = t / d - 1) * t * t + 1) + b;
        },
        easeInOutCubic: function (x, t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
            return c / 2 * ((t -= 2) * t * t + 2) + b;
        },
        easeInQuart: function (x, t, b, c, d) {
            return c * (t /= d) * t * t * t + b;
        },
        easeOutQuart: function (x, t, b, c, d) {
            return -c * ((t = t / d - 1) * t * t * t - 1) + b;
        },
        easeInOutQuart: function (x, t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
            return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
        },
        easeInQuint: function (x, t, b, c, d) {
            return c * (t /= d) * t * t * t * t + b;
        },
        easeOutQuint: function (x, t, b, c, d) {
            return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
        },
        easeInOutQuint: function (x, t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
            return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
        },
        easeInSine: function (x, t, b, c, d) {
            return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
        },
        easeOutSine: function (x, t, b, c, d) {
            return c * Math.sin(t / d * (Math.PI / 2)) + b;
        },
        easeInOutSine: function (x, t, b, c, d) {
            return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
        },
        easeInExpo: function (x, t, b, c, d) {
            return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
        },
        easeOutExpo: function (x, t, b, c, d) {
            return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
        },
        easeInOutExpo: function (x, t, b, c, d) {
            if (t == 0) return b;
            if (t == d) return b + c;
            if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
            return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
        },
        easeInCirc: function (x, t, b, c, d) {
            return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
        },
        easeOutCirc: function (x, t, b, c, d) {
            return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
        },
        easeInOutCirc: function (x, t, b, c, d) {
            if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
            return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
        },
        easeInElastic: function (x, t, b, c, d) {
            var s = 1.70158;
            var p = 0;
            var a = c;
            if (t == 0) return b;
            if ((t /= d) == 1) return b + c;
            if (!p) p = d * .3;
            if (a < Math.abs(c)) {
                a = c;
                var s = p / 4;
            }
            else var s = p / (2 * Math.PI) * Math.asin(c / a);
            return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        },
        easeOutElastic: function (x, t, b, c, d) {
            var s = 1.70158;
            var p = 0;
            var a = c;
            if (t == 0) return b;
            if ((t /= d) == 1) return b + c;
            if (!p) p = d * .3;
            if (a < Math.abs(c)) {
                a = c;
                var s = p / 4;
            }
            else var s = p / (2 * Math.PI) * Math.asin(c / a);
            return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
        },
        easeInOutElastic: function (x, t, b, c, d) {
            var s = 1.70158;
            var p = 0;
            var a = c;
            if (t == 0) return b;
            if ((t /= d / 2) == 2) return b + c;
            if (!p) p = d * (.3 * 1.5);
            if (a < Math.abs(c)) {
                a = c;
                var s = p / 4;
            }
            else var s = p / (2 * Math.PI) * Math.asin(c / a);
            if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
            return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
        },
        easeInBack: function (x, t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c * (t /= d) * t * ((s + 1) * t - s) + b;
        },
        easeOutBack: function (x, t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
        },
        easeInOutBack: function (x, t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
            return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
        },
        easeOutBounce: function (x, t, b, c, d) {
            if ((t /= d) < (1 / 2.75)) {
                return c * (7.5625 * t * t) + b;
            } else if (t < (2 / 2.75)) {
                return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
            } else if (t < (2.5 / 2.75)) {
                return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
            } else {
                return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
            }
        }
    }

    //基本判断的方法
    /* __jquery.isString = function (data) {
     return typeof data == 'string';
     }
     __jquery.isFunction = function (data) {
     return typeof data == 'function';
     }
     __jquery.isDom = function (data) {
     return ( typeof HTMLElement === 'object' ) ?
     function (obj) {
     return obj instanceof HTMLElement;
     } :
     function (obj) {
     return obj && typeof obj === 'object' && obj.nodeType === 1 && typeof obj.nodeName === 'string';
     }
     }
     __jquery.isArrayLike = function (data) {
     return (data instanceof Array || data.length >= 0);
     }*/
    //函数添加方法（静态方法）
    __jquery.extend({
        select: select,
        parseHTML: parseHTML,
        //基本判断的方法
        isString: function (data) {
            return typeof data == 'string';
        },
        isFunction: function (data) {
            return typeof data == 'function';
        },
        isObj: function (data) {
            return typeof data == 'object';
        },
        isDom: function (data) {
            return !!data.nodeType;
        },
        isArrayLike: function (data) {
            return (data instanceof Array || data.length >= 0);
        },

        each: function (arr, func) {
            if (arr instanceof Array || arr.length >= 0) {
                //each方法返回值为本身并且要保证该方法中的this指向循环遍历时当前的DOM元素
                for (var i = 0; i < arr.length; i++) {
                    //使用call使得this指向当前遍历的DOM元素arr[i]，相当于arr[i].func(i,arr[i])
                    func.call(arr[i], i, arr[i]);
                }
            } else {
                for (var i in arr) {
                    func.call(arr[i], i, arr[i]);
                }
            }
            return arr;
        },
        map: function (arr, func) {
            var res = [], temp;
            if (arr instanceof Array || arr.length >= 0) {
                for (var i = 0; i < arr.length; i++) {
                    temp = func.call(arr[i], arr[i], i);
                    /*if (temp != null) {
                     res.push(temp);
                     }*/
                    temp && res.push(temp);
                }
            } else {
                for (var i in arr) {
                    temp = func.call(arr[i], arr[i], i);
                    /* if (temp != null) {
                     res.push(temp);
                     }*/
                    temp && res.push(temp);
                }
            }
            return res;
        },
        //将新添加的元素追加到父元素最前面的方法
        prependChild: function (parent, element) {
            var first = parent.firstChild;
            parent.insertBefore(element, first);
        },

        /*样式操作和属性操作*/
        //获取计算后样式（即非行内样式）的方法
        getStyle: function (o, name) {
            if (o.currentStyle) {
                return o.currentStyle[name];
            } else {
                return window.getComputedStyle(o)[name];
            }
        },
        //获取节点内的所有文本节点，当循环时的节点为元素节点时使用递归
        getTxt: function (node, list) {
            var arr = node.childNodes;
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].nodeType === 3) {
                    list.push(arr[i].nodeValue);
                }
                if (arr[i].nodeType === 1) {
                    __jquery.getTxt(arr[i], list);
                }
            }
            ;
        },

    });

    //其他事件 （click，mouseover等）,利用itcast的each方法给itcast原型上绑定以下事件
    __jquery.each(("blur focus focusin focusout load resize scroll unload click dblclick " +
    "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
    "change select submit keydown keypress keyup error contextmenu").split(' '), function (i, v) {
        // console.log(v);
        __jquery.fn[v] = function (fn) {
            return this.on(v, fn);
        };
    });


    window.__jquery = window.I = __jquery;

})(window)
