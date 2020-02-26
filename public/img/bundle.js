
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run$1(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run$1);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (!store || typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, callback) {
        const unsub = store.subscribe(callback);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if (typeof $$scope.dirty === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? undefined : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let stylesheet;
    let active = 0;
    let current_rules = {};
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        if (!current_rules[name]) {
            if (!stylesheet) {
                const style = element('style');
                document.head.appendChild(style);
                stylesheet = style.sheet;
            }
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        node.style.animation = (node.style.animation || '')
            .split(', ')
            .filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        )
            .join(', ');
        if (name && !--active)
            clear_rules();
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            let i = stylesheet.cssRules.length;
            while (i--)
                stylesheet.deleteRule(i);
            current_rules = {};
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run$1).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, value = ret) => {
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, detail));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /* src/Cow.svelte generated by Svelte v3.16.7 */

    const file = "src/Cow.svelte";

    function create_fragment(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = `${/*name*/ ctx[0]} says ${/*statement*/ ctx[1]}`;
    			add_location(div, file, 5, 0, 62);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self) {
    	let name = "Cow";
    	let statement = "\"Moo.\"";

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("statement" in $$props) $$invalidate(1, statement = $$props.statement);
    	};

    	return [name, statement];
    }

    class Cow extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Cow",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    /* src/Monad.svelte generated by Svelte v3.16.7 */
    const file$1 = "src/Monad.svelte";

    // (103:1) {#if visible}
    function create_if_block(ctx) {
    	let div;
    	let div_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "A SIMPLE LITTLE MONAD";
    			set_style(div, "font-family", "Times New Roman");
    			set_style(div, "text-align", "center");
    			set_style(div, "color", "hsl(210, 90%, 90%)");
    			set_style(div, "font-size", "32px");
    			add_location(div, file$1, 103, 2, 2252);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(103:1) {#if visible}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let t0;
    	let br;
    	let t1;
    	let span0;
    	let t3;
    	let span1;
    	let t5;
    	let span2;
    	let t7;
    	let p0;
    	let t9;
    	let p1;
    	let t11;
    	let p2;
    	let t13;
    	let pre0;
    	let t15;
    	let p3;
    	let t17;
    	let pre1;
    	let t19;
    	let p4;
    	let t21;
    	let t22;
    	let t23;
    	let input;
    	let input_updating = false;
    	let t24;
    	let p5;
    	let t25;
    	let t26;
    	let t27;
    	let t28_value = /*bonads*/ ctx[5](/*num*/ ctx[0]) + "";
    	let t28;
    	let t29;
    	let span3;
    	let t31;
    	let pre2;
    	let t33;
    	let p6;
    	let t35;
    	let p7;
    	let t37;
    	let p8;
    	let t39;
    	let p9;
    	let current;
    	let dispose;
    	let if_block = /*visible*/ ctx[1] && create_if_block(ctx);

    	function input_input_handler() {
    		input_updating = true;
    		/*input_input_handler*/ ctx[12].call(input);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			br = element("br");
    			t1 = space();
    			span0 = element("span");
    			span0.textContent = "The word \"monad\" has been around for centuries. Gottfried Leibniz published";
    			t3 = space();
    			span1 = element("span");
    			span1.textContent = "Monadology";
    			t5 = space();
    			span2 = element("span");
    			span2.textContent = "in 1714. The precursor to the familiar symbol of yin-yang, taijitu (太極圖), has a version with two dots added, has been given the august designation: \"The Great Monad\". A single note in music theory is called a monad. All of this is too tangential to warrant references. I Googled around a little to get it and you can too if the word \"monad\" interests you.";
    			t7 = space();
    			p0 = element("p");
    			p0.textContent = "Monads in the Haskell Programming Language were inspired by Category Theory monads. In order to be Category Theory monads, function must exist in a mathematically rigorous \"category\". Haskells objects and functions are not the objects and morphisms of Category Theory. Making a category out of most of Haskell's functions and types is an amusing pasttime for some people, but I doubt that it has any practical value.";
    			t9 = space();
    			p1 = element("p");
    			p1.textContent = "So it should be no surprise that my JavaScript monads are not Category Theory monads. They do obey a JavaScript version of the Haskell monad laws, which are not a requirement in Haskell but are indicative of utility and robustness objects (including functions) don't constitute a category. But functions that hold values and compose with multiple functions that operate on their values behave like Category Theory monads enough to justify calling them \"monads\".";
    			t11 = space();
    			p2 = element("p");
    			p2.textContent = "Here's the definitions of three functions:";
    			t13 = space();
    			pre0 = element("pre");
    			pre0.textContent = `${/*monadDisplay*/ ctx[2]}`;
    			t15 = space();
    			p3 = element("p");
    			p3.textContent = "And here is an anonymous monad followed by three functions and \"stop\". :";
    			t17 = space();
    			pre1 = element("pre");
    			pre1.textContent = "Monad(6)(sum(7))(prod(4))(v=>v-10)(stop) // 42";
    			t19 = space();
    			p4 = element("p");
    			p4.textContent = "Anonymous monads never interfere with other monads. The demonstration below illustrates this by running seven anonymous monads in rapid succession. The number you enter is \"num\" in";
    			t21 = space();
    			t22 = text(/*bonadsD*/ ctx[3]);
    			t23 = space();
    			input = element("input");
    			t24 = space();
    			p5 = element("p");
    			t25 = text("num is ");
    			t26 = text(/*num*/ ctx[0]);
    			t27 = text(" so bonads(num) returns ");
    			t28 = text(t28_value);
    			t29 = space();
    			span3 = element("span");
    			span3.textContent = "Named monads retain their values, even after they encounter \"stop\" and return the value of x held in the Monad closure. The following examples illustrate this:";
    			t31 = space();
    			pre2 = element("pre");
    			pre2.textContent = `${/*axe*/ ctx[4]}`;
    			t33 = space();
    			p6 = element("p");
    			p6.textContent = "As expected, mon returns which is the \"foo()\" returned by by calling Monad(3):";
    			t35 = space();
    			p7 = element("p");
    			p7.textContent = "mon is still the foo() returned by Monad(). Because mon points to x in the context of its creation by Monad(), x will not be garbage collected. Care should be taken not to polute memory with useless x's.";
    			t37 = space();
    			p8 = element("p");
    			p8.textContent = "One reason Svelte is so fast and efficient is that it mutates variables and the attributes and methods of objects. Each module in a discrete global space.  When modules are small, applications are easy to organize and mutations don't have unforseen effects in other parts of applications. Svelte shook off the bonds of current conventional \"wisdom\" advocating immutability, virtual DOM, and assigning types to functions.";
    			t39 = space();
    			p9 = element("p");
    			p9.textContent = "The next entry in the monad series defines a variation of Monad that maintains an array of primitive data, function return values, and Promise resolution values. Functions have access to everything in the array when they execute.";
    			add_location(br, file$1, 107, 1, 2418);
    			attr_dev(span0, "class", "tao svelte-1dr4x6t");
    			add_location(span0, file$1, 108, 1, 2424);
    			set_style(span1, "font-style", "italic");
    			add_location(span1, file$1, 109, 0, 2527);
    			add_location(span2, file$1, 110, 0, 2582);
    			add_location(p0, file$1, 111, 0, 2952);
    			add_location(p1, file$1, 112, 0, 3378);
    			add_location(p2, file$1, 113, 0, 3848);
    			add_location(pre0, file$1, 114, 0, 3900);
    			add_location(p3, file$1, 115, 0, 3926);
    			add_location(pre1, file$1, 116, 0, 4008);
    			add_location(p4, file$1, 117, 0, 4068);
    			attr_dev(input, "id", "one");
    			attr_dev(input, "type", "number");
    			add_location(input, file$1, 119, 0, 4268);
    			add_location(p5, file$1, 120, 0, 4341);
    			attr_dev(span3, "class", "tao svelte-1dr4x6t");
    			add_location(span3, file$1, 122, 0, 4401);
    			add_location(pre2, file$1, 123, 0, 4588);
    			add_location(p6, file$1, 127, 0, 4608);
    			add_location(p7, file$1, 129, 0, 4696);
    			add_location(p8, file$1, 131, 0, 4909);
    			add_location(p9, file$1, 132, 0, 5339);

    			dispose = [
    				listen_dev(input, "input", /*bonads*/ ctx[5], false, false, false),
    				listen_dev(input, "input", input_input_handler)
    			];
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, br, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, span0, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, span1, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, span2, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, p2, anchor);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, pre0, anchor);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, p3, anchor);
    			insert_dev(target, t17, anchor);
    			insert_dev(target, pre1, anchor);
    			insert_dev(target, t19, anchor);
    			insert_dev(target, p4, anchor);
    			insert_dev(target, t21, anchor);
    			insert_dev(target, t22, anchor);
    			insert_dev(target, t23, anchor);
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*num*/ ctx[0]);
    			insert_dev(target, t24, anchor);
    			insert_dev(target, p5, anchor);
    			append_dev(p5, t25);
    			append_dev(p5, t26);
    			append_dev(p5, t27);
    			append_dev(p5, t28);
    			insert_dev(target, t29, anchor);
    			insert_dev(target, span3, anchor);
    			insert_dev(target, t31, anchor);
    			insert_dev(target, pre2, anchor);
    			insert_dev(target, t33, anchor);
    			insert_dev(target, p6, anchor);
    			insert_dev(target, t35, anchor);
    			insert_dev(target, p7, anchor);
    			insert_dev(target, t37, anchor);
    			insert_dev(target, p8, anchor);
    			insert_dev(target, t39, anchor);
    			insert_dev(target, p9, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!input_updating && dirty & /*num*/ 1) {
    				set_input_value(input, /*num*/ ctx[0]);
    			}

    			input_updating = false;
    			if (!current || dirty & /*num*/ 1) set_data_dev(t26, /*num*/ ctx[0]);
    			if ((!current || dirty & /*num*/ 1) && t28_value !== (t28_value = /*bonads*/ ctx[5](/*num*/ ctx[0]) + "")) set_data_dev(t28, t28_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(span0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(span1);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(span2);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(pre0);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(p3);
    			if (detaching) detach_dev(t17);
    			if (detaching) detach_dev(pre1);
    			if (detaching) detach_dev(t19);
    			if (detaching) detach_dev(p4);
    			if (detaching) detach_dev(t21);
    			if (detaching) detach_dev(t22);
    			if (detaching) detach_dev(t23);
    			if (detaching) detach_dev(input);
    			if (detaching) detach_dev(t24);
    			if (detaching) detach_dev(p5);
    			if (detaching) detach_dev(t29);
    			if (detaching) detach_dev(span3);
    			if (detaching) detach_dev(t31);
    			if (detaching) detach_dev(pre2);
    			if (detaching) detach_dev(t33);
    			if (detaching) detach_dev(p6);
    			if (detaching) detach_dev(t35);
    			if (detaching) detach_dev(p7);
    			if (detaching) detach_dev(t37);
    			if (detaching) detach_dev(p8);
    			if (detaching) detach_dev(t39);
    			if (detaching) detach_dev(p9);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function Monad(z) {
    	var x = z;

    	var foo = function foo(func) {
    		if (func.name === "stop") return x; else {
    			x = func(x);
    			return foo;
    		}
    	};

    	return foo;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let visible = true;

    	let monadDisplay = `function Monad (z) {
    var x = z;
    var foo = function foo (func) {
        var stop = 'stop';
        if (func.name === 'stop') return x
        else {
            x = func(x);
            return foo;
        }
    };
    return foo;
}

const prod = a => b => a*b;
const sum = a => b => a+b;`;

    	let bonadsD = `function bonads(num) {
return [Monad(num)(sum(7))(prod(4))(v=>v-10)(stop),
Monad(num-1)(sum(7))(prod(4))(v=>v-10)(stop),
Monad(num-2)(sum(7))(prod(4))(v=>v-10)(stop),
Monad(num-3)(sum(7))(prod(4))(v=>v-10)(stop),
Monad(num-2)(sum(7))(prod(4))(v=>v-10)(stop),
Monad(num-1)(sum(7))(prod(4))(v=>v-10)(stop),
Monad(num-0)(sum(7))(prod(4))(v=>v-10)(stop)]}`;

    	let axe = `
let mon = Monad(3);
let a = mon(x=>x**3)(x=>x+3)(x=>x**2)(stop);
console.log("a is", a)  // a is 900`;

    	let tree = `
mon(x => x/100)
console.log("mon(stop) now is",mon(stop))  // mon(stop) now is 9 `;

    	let fred = `
let ar = [];
let mon = Monad(3);
let mon2 = Monad();
ar.push(mon(stop));
var a = mon(x=>x**3)(x=>x+3)(x=>x**2)
ar.push(a);
ar.push(mon(x => x/100);
ar.push(mon2(mon(stop)(x=>x*100)))
console.log("ar.map(v=>v('stop')) is", ar.map(v=>v('stop')))  // [3, 900, 9] `;

    	const prod = a => b => a * b;
    	const sum = a => b => a + b;
    	let num = 6;

    	let bonads = function bonads(num) {
    		return [
    			Monad(num)(sum(7))(prod(4))(v => v - 10)(stop),
    			Monad(num - 1)(sum(7))(prod(4))(v => v - 10)(stop),
    			Monad(num - 2)(sum(7))(prod(4))(v => v - 10)(stop),
    			Monad(num - 3)(sum(7))(prod(4))(v => v - 10)(stop),
    			Monad(num - 2)(sum(7))(prod(4))(v => v - 10)(stop),
    			Monad(num - 1)(sum(7))(prod(4))(v => v - 10)(stop),
    			Monad(num - 0)(sum(7))(prod(4))(v => v - 10)(stop)
    		];
    	};

    	let mona = bonads(num);
    	console.log(mona);

    	function numF(e) {
    		$$invalidate(0, num = e.target.value);
    		console.log("e.target.value is", e.target.value);
    		return e.target.value;
    	}

    	console.log("num is", num);

    	function input_input_handler() {
    		num = to_number(this.value);
    		$$invalidate(0, num);
    	}

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("visible" in $$props) $$invalidate(1, visible = $$props.visible);
    		if ("monadDisplay" in $$props) $$invalidate(2, monadDisplay = $$props.monadDisplay);
    		if ("bonadsD" in $$props) $$invalidate(3, bonadsD = $$props.bonadsD);
    		if ("axe" in $$props) $$invalidate(4, axe = $$props.axe);
    		if ("tree" in $$props) tree = $$props.tree;
    		if ("fred" in $$props) fred = $$props.fred;
    		if ("num" in $$props) $$invalidate(0, num = $$props.num);
    		if ("bonads" in $$props) $$invalidate(5, bonads = $$props.bonads);
    		if ("mona" in $$props) mona = $$props.mona;
    	};

    	return [
    		num,
    		visible,
    		monadDisplay,
    		bonadsD,
    		axe,
    		bonads,
    		tree,
    		fred,
    		prod,
    		sum,
    		mona,
    		numF,
    		input_input_handler
    	];
    }

    class Monad_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Monad_1",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/Monad2.svelte generated by Svelte v3.16.7 */
    const file$2 = "src/Monad2.svelte";

    // (308:0) {#if j === 2}
    function create_if_block$1(ctx) {
    	let div_1;
    	let div_1_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div_1 = element("div");
    			div_1.textContent = "ASYNCHRONOUSLY CREATED STATE";
    			set_style(div_1, "font-family", "Times New Roman");
    			set_style(div_1, "text-align", "center");
    			set_style(div_1, "color", "hsl(210, 90%, 90%)");
    			set_style(div_1, "font-size", "38px");
    			add_location(div_1, file$2, 308, 1, 5867);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div_1, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_1_transition) div_1_transition = create_bidirectional_transition(div_1, fade, {}, true);
    				div_1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_1_transition) div_1_transition = create_bidirectional_transition(div_1, fade, {}, false);
    			div_1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div_1);
    			if (detaching && div_1_transition) div_1_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(308:0) {#if j === 2}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let t0;
    	let br0;
    	let t1;
    	let p0;
    	let t3;
    	let br1;
    	let t4;
    	let div0;
    	let t6;
    	let div1;
    	let t7_value = /*O*/ ctx[0].c0 + "";
    	let t7;
    	let t8;
    	let t9_value = /*O*/ ctx[0].c1 + "";
    	let t9;
    	let t10;
    	let t11_value = /*O*/ ctx[0].c2 + "";
    	let t11;
    	let t12;
    	let br2;
    	let t13;
    	let span0;
    	let t15;
    	let span1;
    	let t16;
    	let t17_value = /*O*/ ctx[0].d0.join(", ") + "";
    	let t17;
    	let t18;
    	let t19_value = /*O*/ ctx[0].d1.join(", ") + "";
    	let t19;
    	let t20;
    	let t21_value = /*O*/ ctx[0].d2.join(", ") + "";
    	let t21;
    	let t22;
    	let t23;
    	let br3;
    	let t24;
    	let br4;
    	let t25;
    	let button;
    	let pre0;
    	let t27;
    	let br5;
    	let br6;
    	let br7;
    	let t28;
    	let div2;
    	let t29;
    	let t30_value = /*O*/ ctx[0].d0 + "";
    	let t30;
    	let t31;
    	let t32_value = /*O*/ ctx[0].c0 + "";
    	let t32;
    	let t33;
    	let span2;
    	let t34_value = (/*O*/ ctx[0].d0.reduce(func) == /*O*/ ctx[0].c0) + "";
    	let t34;
    	let t35;
    	let br8;
    	let t36;
    	let t37_value = /*O*/ ctx[0].d1 + "";
    	let t37;
    	let t38;
    	let t39_value = /*O*/ ctx[0].c1 + "";
    	let t39;
    	let t40;
    	let span3;
    	let t41_value = (/*O*/ ctx[0].d1.reduce(func_1) == /*O*/ ctx[0].c1) + "";
    	let t41;
    	let t42;
    	let br9;
    	let t43;
    	let t44_value = /*O*/ ctx[0].d2 + "";
    	let t44;
    	let t45;
    	let t46_value = /*O*/ ctx[0].c2 + "";
    	let t46;
    	let t47;
    	let span4;
    	let t48_value = (/*O*/ ctx[0].d2.reduce(func_2) == /*O*/ ctx[0].c2) + "";
    	let t48;
    	let t49;
    	let br10;
    	let t50;
    	let p1;
    	let t52;
    	let pre1;
    	let t54;
    	let p2;
    	let pre2;
    	let t57;
    	let p3;
    	let pre3;
    	let t60;
    	let p4;
    	let t62;
    	let br11;
    	let t63;
    	let span5;
    	let t65;
    	let a;
    	let current;
    	let dispose;
    	let if_block = /*j*/ ctx[1] === 2 && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			br0 = element("br");
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "Clicking the button below sends three requests to the Haskell WebSockets server asking for quasi-random integers. As the numbers come in from the server, they are placed in the object named \"O\" with keys prefixed by \"c\", and then forwarded to a web worker. The worker returns arrays containing the prime factors of the numbers it recieves. These are placed in \"O\" with keys prefixed by \"d\".";
    			t3 = space();
    			br1 = element("br");
    			t4 = space();
    			div0 = element("div");
    			div0.textContent = "The WebSockets server sent these numbers (now at O.c0, O.c1, and O.c2):";
    			t6 = space();
    			div1 = element("div");
    			t7 = text(t7_value);
    			t8 = text(", ");
    			t9 = text(t9_value);
    			t10 = text(", and ");
    			t11 = text(t11_value);
    			t12 = space();
    			br2 = element("br");
    			t13 = space();
    			span0 = element("span");
    			span0.textContent = "The web worker sent these arrays of prime factors (now at O.d0, O.d1, and O.d2):";
    			t15 = space();
    			span1 = element("span");
    			t16 = text("[");
    			t17 = text(t17_value);
    			t18 = text("], [");
    			t19 = text(t19_value);
    			t20 = text("], and [");
    			t21 = text(t21_value);
    			t22 = text("]");
    			t23 = space();
    			br3 = element("br");
    			t24 = space();
    			br4 = element("br");
    			t25 = space();
    			button = element("button");
    			pre0 = element("pre");
    			pre0.textContent = `${/*candle*/ ctx[6]}`;
    			t27 = space();
    			br5 = element("br");
    			br6 = element("br");
    			br7 = element("br");
    			t28 = space();
    			div2 = element("div");
    			t29 = text("[");
    			t30 = text(t30_value);
    			t31 = text("].reduce((a,b) => a*b) == ");
    			t32 = text(t32_value);
    			t33 = text(": ");
    			span2 = element("span");
    			t34 = text(t34_value);
    			t35 = space();
    			br8 = element("br");
    			t36 = text("\n[");
    			t37 = text(t37_value);
    			t38 = text("].reduce((a,b) => a*b) == ");
    			t39 = text(t39_value);
    			t40 = text(": ");
    			span3 = element("span");
    			t41 = text(t41_value);
    			t42 = space();
    			br9 = element("br");
    			t43 = text("\n[");
    			t44 = text(t44_value);
    			t45 = text("].reduce((a,b) => a*b) == ");
    			t46 = text(t46_value);
    			t47 = text(": ");
    			span4 = element("span");
    			t48 = text(t48_value);
    			t49 = space();
    			br10 = element("br");
    			t50 = space();
    			p1 = element("p");
    			p1.textContent = "In this demonstration, each monad's array of computed values is preserved as an attribute of an object named O. Here's the definition of \"Monad\" used in this module:";
    			t52 = space();
    			pre1 = element("pre");
    			pre1.textContent = `${/*mon*/ ctx[3]}`;
    			t54 = space();
    			p2 = element("p");
    			p2.textContent = "Messages are sent to the Haskell WebSockets server requesting pseudo-random numbers between 1 and the integer specified at the end of the request. On the server, randomR from the System.Random library produces a number which is sent to the browser with prefix \"BE#$42\". Messages from the server are parsed in socket.onmessage. If the prefix is \"BE#$42\", the payload (a number) is sent to worker_OO, which sends back the number's prime decomposition.\n";
    			pre2 = element("pre");
    			pre2.textContent = `${/*onmessServer*/ ctx[4]}`;
    			t57 = space();
    			p3 = element("p");
    			p3.textContent = "Messages from the web worker are processed in worker_OO.onmessage\n";
    			pre3 = element("pre");
    			pre3.textContent = `${/*onmessWorker*/ ctx[5]}`;
    			t60 = space();
    			p4 = element("p");
    			p4.textContent = "When M === 2 the process is complete. M and N are set to -1 and lock is set to false, allowing another possible call to random() to call rand().";
    			t62 = space();
    			br11 = element("br");
    			t63 = space();
    			span5 = element("span");
    			span5.textContent = "The code for this Svelte application is at";
    			t65 = space();
    			a = element("a");
    			a.textContent = "GitHub repository";
    			add_location(br0, file$2, 313, 0, 6037);
    			add_location(p0, file$2, 314, 0, 6042);
    			add_location(br1, file$2, 315, 1, 6443);
    			set_style(div0, "color", "#BBBBFF");
    			set_style(div0, "font-size", "20px");
    			add_location(div0, file$2, 321, 0, 6453);
    			set_style(div1, "color", "#FFFFCD");
    			set_style(div1, "font-size", "20px");
    			add_location(div1, file$2, 322, 0, 6581);
    			add_location(br2, file$2, 325, 0, 6667);
    			set_style(span0, "color", "#CDCDFF");
    			set_style(span0, "font-size", "20px");
    			add_location(span0, file$2, 326, 0, 6672);
    			set_style(span1, "color", "#FFFFCD");
    			set_style(span1, "font-size", "20px");
    			add_location(span1, file$2, 327, 0, 6811);
    			add_location(br3, file$2, 329, 0, 6934);
    			add_location(br4, file$2, 330, 0, 6939);
    			add_location(pre0, file$2, 332, 0, 6974);
    			attr_dev(button, "class", "svelte-14lwxew");
    			add_location(button, file$2, 331, 0, 6944);
    			add_location(br5, file$2, 335, 0, 7005);
    			add_location(br6, file$2, 335, 4, 7009);
    			add_location(br7, file$2, 335, 8, 7013);
    			set_style(span2, "font-size", "24px");
    			set_style(span2, "color", "#FF0B0B");
    			add_location(span2, file$2, 340, 41, 7111);
    			add_location(br8, file$2, 341, 0, 7201);
    			set_style(span3, "font-size", "24px");
    			set_style(span3, "color", "#FF0B0B");
    			add_location(span3, file$2, 342, 41, 7247);
    			add_location(br9, file$2, 343, 0, 7337);
    			set_style(span4, "font-size", "24px");
    			set_style(span4, "color", "#FF0B0B");
    			add_location(span4, file$2, 344, 41, 7383);
    			add_location(br10, file$2, 345, 0, 7473);
    			set_style(div2, "color", "#FFFFCD");
    			set_style(div2, "font-size", "20px");
    			add_location(div2, file$2, 339, 0, 7021);
    			add_location(p1, file$2, 350, 0, 7488);
    			add_location(pre1, file$2, 352, 0, 7663);
    			add_location(p2, file$2, 354, 0, 7681);
    			add_location(pre2, file$2, 355, 0, 8135);
    			add_location(p3, file$2, 356, 0, 8161);
    			add_location(pre3, file$2, 357, 0, 8231);
    			add_location(p4, file$2, 358, 0, 8257);
    			add_location(br11, file$2, 359, 0, 8411);
    			add_location(span5, file$2, 360, 0, 8416);
    			attr_dev(a, "href", "https://github.com/dschalk/blog/");
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$2, 361, 0, 8474);
    			dispose = listen_dev(button, "click", /*factors*/ ctx[2], false, false, false);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, br0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, t7);
    			append_dev(div1, t8);
    			append_dev(div1, t9);
    			append_dev(div1, t10);
    			append_dev(div1, t11);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, br2, anchor);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, span0, anchor);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, span1, anchor);
    			append_dev(span1, t16);
    			append_dev(span1, t17);
    			append_dev(span1, t18);
    			append_dev(span1, t19);
    			append_dev(span1, t20);
    			append_dev(span1, t21);
    			append_dev(span1, t22);
    			insert_dev(target, t23, anchor);
    			insert_dev(target, br3, anchor);
    			insert_dev(target, t24, anchor);
    			insert_dev(target, br4, anchor);
    			insert_dev(target, t25, anchor);
    			insert_dev(target, button, anchor);
    			append_dev(button, pre0);
    			insert_dev(target, t27, anchor);
    			insert_dev(target, br5, anchor);
    			insert_dev(target, br6, anchor);
    			insert_dev(target, br7, anchor);
    			insert_dev(target, t28, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, t29);
    			append_dev(div2, t30);
    			append_dev(div2, t31);
    			append_dev(div2, t32);
    			append_dev(div2, t33);
    			append_dev(div2, span2);
    			append_dev(span2, t34);
    			append_dev(div2, t35);
    			append_dev(div2, br8);
    			append_dev(div2, t36);
    			append_dev(div2, t37);
    			append_dev(div2, t38);
    			append_dev(div2, t39);
    			append_dev(div2, t40);
    			append_dev(div2, span3);
    			append_dev(span3, t41);
    			append_dev(div2, t42);
    			append_dev(div2, br9);
    			append_dev(div2, t43);
    			append_dev(div2, t44);
    			append_dev(div2, t45);
    			append_dev(div2, t46);
    			append_dev(div2, t47);
    			append_dev(div2, span4);
    			append_dev(span4, t48);
    			append_dev(div2, t49);
    			append_dev(div2, br10);
    			insert_dev(target, t50, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t52, anchor);
    			insert_dev(target, pre1, anchor);
    			insert_dev(target, t54, anchor);
    			insert_dev(target, p2, anchor);
    			insert_dev(target, pre2, anchor);
    			insert_dev(target, t57, anchor);
    			insert_dev(target, p3, anchor);
    			insert_dev(target, pre3, anchor);
    			insert_dev(target, t60, anchor);
    			insert_dev(target, p4, anchor);
    			insert_dev(target, t62, anchor);
    			insert_dev(target, br11, anchor);
    			insert_dev(target, t63, anchor);
    			insert_dev(target, span5, anchor);
    			insert_dev(target, t65, anchor);
    			insert_dev(target, a, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty[0] & /*O*/ 1) && t7_value !== (t7_value = /*O*/ ctx[0].c0 + "")) set_data_dev(t7, t7_value);
    			if ((!current || dirty[0] & /*O*/ 1) && t9_value !== (t9_value = /*O*/ ctx[0].c1 + "")) set_data_dev(t9, t9_value);
    			if ((!current || dirty[0] & /*O*/ 1) && t11_value !== (t11_value = /*O*/ ctx[0].c2 + "")) set_data_dev(t11, t11_value);
    			if ((!current || dirty[0] & /*O*/ 1) && t17_value !== (t17_value = /*O*/ ctx[0].d0.join(", ") + "")) set_data_dev(t17, t17_value);
    			if ((!current || dirty[0] & /*O*/ 1) && t19_value !== (t19_value = /*O*/ ctx[0].d1.join(", ") + "")) set_data_dev(t19, t19_value);
    			if ((!current || dirty[0] & /*O*/ 1) && t21_value !== (t21_value = /*O*/ ctx[0].d2.join(", ") + "")) set_data_dev(t21, t21_value);
    			if ((!current || dirty[0] & /*O*/ 1) && t30_value !== (t30_value = /*O*/ ctx[0].d0 + "")) set_data_dev(t30, t30_value);
    			if ((!current || dirty[0] & /*O*/ 1) && t32_value !== (t32_value = /*O*/ ctx[0].c0 + "")) set_data_dev(t32, t32_value);
    			if ((!current || dirty[0] & /*O*/ 1) && t34_value !== (t34_value = (/*O*/ ctx[0].d0.reduce(func) == /*O*/ ctx[0].c0) + "")) set_data_dev(t34, t34_value);
    			if ((!current || dirty[0] & /*O*/ 1) && t37_value !== (t37_value = /*O*/ ctx[0].d1 + "")) set_data_dev(t37, t37_value);
    			if ((!current || dirty[0] & /*O*/ 1) && t39_value !== (t39_value = /*O*/ ctx[0].c1 + "")) set_data_dev(t39, t39_value);
    			if ((!current || dirty[0] & /*O*/ 1) && t41_value !== (t41_value = (/*O*/ ctx[0].d1.reduce(func_1) == /*O*/ ctx[0].c1) + "")) set_data_dev(t41, t41_value);
    			if ((!current || dirty[0] & /*O*/ 1) && t44_value !== (t44_value = /*O*/ ctx[0].d2 + "")) set_data_dev(t44, t44_value);
    			if ((!current || dirty[0] & /*O*/ 1) && t46_value !== (t46_value = /*O*/ ctx[0].c2 + "")) set_data_dev(t46, t46_value);
    			if ((!current || dirty[0] & /*O*/ 1) && t48_value !== (t48_value = (/*O*/ ctx[0].d2.reduce(func_2) == /*O*/ ctx[0].c2) + "")) set_data_dev(t48, t48_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(br2);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(span0);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(span1);
    			if (detaching) detach_dev(t23);
    			if (detaching) detach_dev(br3);
    			if (detaching) detach_dev(t24);
    			if (detaching) detach_dev(br4);
    			if (detaching) detach_dev(t25);
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(t27);
    			if (detaching) detach_dev(br5);
    			if (detaching) detach_dev(br6);
    			if (detaching) detach_dev(br7);
    			if (detaching) detach_dev(t28);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t50);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t52);
    			if (detaching) detach_dev(pre1);
    			if (detaching) detach_dev(t54);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(pre2);
    			if (detaching) detach_dev(t57);
    			if (detaching) detach_dev(p3);
    			if (detaching) detach_dev(pre3);
    			if (detaching) detach_dev(t60);
    			if (detaching) detach_dev(p4);
    			if (detaching) detach_dev(t62);
    			if (detaching) detach_dev(br11);
    			if (detaching) detach_dev(t63);
    			if (detaching) detach_dev(span5);
    			if (detaching) detach_dev(t65);
    			if (detaching) detach_dev(a);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function wait$1(ms) {
    	return new Promise(r => setTimeout(r, ms));
    }

    const func = (a, b) => a * b;
    const func_1 = (a, b) => a * b;
    const func_2 = (a, b) => a * b;

    function instance$2($$self, $$props, $$invalidate) {
    	let visible = true;
    	let j = 2;

    	var pauseP = t => async x => {
    		await wait$1(t * 1000);
    		return x;
    	};

    	var divPinverse = a => async b => {
    		await wait$1(600);
    		return a / b;
    	};

    	var divP = a => async b => {
    		await wait$1(600);
    		return b / a;
    	};

    	var doubleP = async a => {
    		await wait$1(1000);
    		return a + a;
    	};

    	var toInt = a => parseInt(a, 10);

    	var addP_toInt = x => async y => {
    		await wait$1(1000);
    		return toInt(x) + toInt(y);
    	};

    	var addP = x => async y => {
    		await wait$1(1000);
    		return x + y;
    	};

    	var multP = x => async y => {
    		await wait$1(1200);
    		return x * y;
    	};

    	var powP = x => async y => {
    		await wait$1(1200);
    		return y ** x;
    	};

    	var cube = x => x ** 3;
    	var pow = p => x => x ** p;
    	var square = x => x * x;
    	var add = x => y => x + y;
    	var sqrt = x => x ** (1 / 2);
    	var root = r => x => x(1 / r);
    	var div = d => x => x / d;

    	var f = function f() {
    		
    	};

    	var f_ = function f_() {
    		
    	};

    	var sto = "sto";
    	var halt = "halt";
    	var O = new Object();
    	O.d0 = [2, 3, 4];
    	O.d1 = [2, 3, 4];
    	O.d2 = [2, 3, 4];
    	var M = -1;
    	var Q = -1;
    	var lock = false;
    	O.generic = ["Nobody"];

    	const Monad = function Monad(AR = [], name = "generic", f_ = mFunc) {
    		let ar = AR.slice();
    		$$invalidate(0, O[name] = ar, O);
    		let run;
    		let x = O[name].pop();

    		return run = (function run(x) {
    			if (x != undefined && x === x && x !== false && x.name !== "f_" && x.name !== "halt") {
    				$$invalidate(0, O[name] = O[name].concat(x), O);
    			}

    			
    			return f_;
    		})(x);
    	};

    	var mFunc = function mFunc_(func) {
    		if (func === "halt" || func === "S") return O[name]; else if (typeof func !== "function") p = func(x); else if (x instanceof Promise) p = x.then(v => func(v));
    		return run(p);
    	};

    	var socket = new WebSocket("ws://167.71.168.53:3055");

    	socket.onclose = function (event) {
    		console.log("<><><> ALERT - socket is closing. <><><> ", event);
    	};

    	socket.onmessage = function (e) {
    		var v = e.data.split(",");

    		if (v[0] === "BE#$42") {
    			Q = Q + 1;
    			Monad([v[3]], "c" + Q);
    			if (Q === 2) Q = -1;
    			worker_OO.postMessage([v[3]]);
    		}
    	};

    	login();

    	function login() {
    		console.log("00000000000000000000000000000000 Entering login", socket.readyState);

    		setTimeout(
    			function () {
    				if (socket.readyState === 1) {
    					console.log("readyState is", socket.readyState);
    					var v = Math.random().toString().substring(5);
    					var v2 = v.toString().substring(2);
    					var combo = v + "<o>" + v2;
    					socket.send("CC#$42" + combo);
    					socket.send("BE#$42,solo,name,10000");
    					socket.send("BE#$42,solo,name,100000");
    					socket.send("BE#$42,solo,name,1000");
    				} else {
    					login();
    				}
    			},
    			200
    		);
    	}

    	

    	var groupDelete = function groupDelete(ob, x) {
    		for (var z in ob) if (z.startsWith("x")) delete ob[z];
    	};

    	var clearOb = function clearOb(ob) {
    		for (var x in ob) delete ob[x];
    	};

    	const factors = function factors() {
    		socket.send("BE#$42,solo,name,10000");
    		socket.send("BE#$42,solo,name,100000");
    		socket.send("BE#$42,solo,name,1000");
    	};

    	var worker_OO = new Worker("worker_OO.js");

    	worker_OO.onmessage = e => {
    		M = M + 1;
    		Monad([e.data], "d" + M);

    		if (M === 2) {
    			M = -1;
    		}
    	};

    	var mon = `const Monad = function Monad ( AR = [], name = "generic" )  {
var f_, p, run;
var ar = AR.slice();
var name = name;
O[name] = ar;
let x = O[name].pop();
return run = (function run (x) {
if (x != undefined && x === x  && x !== false
  && x.name !== "f_" && x.name !== "halt" ) {
    O[name] = O[name].concat(x)
  };
  function f_ (func) {
    if (func === 'halt' || func === 'S') return O[name];
    else if (typeof func !== "function") p = func;
    else if (x instanceof Promise) p = x.then(v => func(v));
    else p = func(x);
    return run(p);
  };
  return f_;
})(x);
} `;

    	var statement = `    Monad(["value"], "key")(x => "This is the " + x)(x => x + ".")(halt)
O.key   // ["value", "This is the value", "This is the value."]`;

    	var fa = `    function factors () {
if (lock === false && j === 2) {
  lock = true;
  clearOb(O);
  N = -1;
  M = -1;
  Q = -1;
  groupDelete(O, "c");
  groupDelete(O, "d");
  fact();
}
else if (j !== 2) {return}
else {
  setTimeout(()=> {
  factors()
},1000)
}
}`;

    	var onmessServer = `ar v = e.data.split(',');
if (v[0] === "BE#$42") {
Q = Q + 1;
Monad([v[3]], "c"+Q);
worker_OO.postMessage([v[3]])
}
}  `;

    	var onmessWorker = `worker_OO.onmessage = e => {
  M = M + 1;
  Monad([e.data], "d"+M);
  if (M === 2) {
    M = -1;
  }
}`;

    	let candle = ` socket.send(\"BE#$42,solo,name,10000\")    
socket.send('\BE#$42,solo,name,100000\")    
socket.send(\"BE#$42,solo,name,1000\")    `;

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("visible" in $$props) visible = $$props.visible;
    		if ("j" in $$props) $$invalidate(1, j = $$props.j);
    		if ("pauseP" in $$props) pauseP = $$props.pauseP;
    		if ("divPinverse" in $$props) divPinverse = $$props.divPinverse;
    		if ("divP" in $$props) divP = $$props.divP;
    		if ("doubleP" in $$props) doubleP = $$props.doubleP;
    		if ("toInt" in $$props) toInt = $$props.toInt;
    		if ("addP_toInt" in $$props) addP_toInt = $$props.addP_toInt;
    		if ("addP" in $$props) addP = $$props.addP;
    		if ("multP" in $$props) multP = $$props.multP;
    		if ("powP" in $$props) powP = $$props.powP;
    		if ("cube" in $$props) cube = $$props.cube;
    		if ("pow" in $$props) pow = $$props.pow;
    		if ("square" in $$props) square = $$props.square;
    		if ("add" in $$props) add = $$props.add;
    		if ("sqrt" in $$props) sqrt = $$props.sqrt;
    		if ("root" in $$props) root = $$props.root;
    		if ("div" in $$props) div = $$props.div;
    		if ("f" in $$props) f = $$props.f;
    		if ("f_" in $$props) f_ = $$props.f_;
    		if ("sto" in $$props) sto = $$props.sto;
    		if ("halt" in $$props) halt = $$props.halt;
    		if ("O" in $$props) $$invalidate(0, O = $$props.O);
    		if ("M" in $$props) M = $$props.M;
    		if ("Q" in $$props) Q = $$props.Q;
    		if ("lock" in $$props) lock = $$props.lock;
    		if ("mFunc" in $$props) mFunc = $$props.mFunc;
    		if ("socket" in $$props) socket = $$props.socket;
    		if ("groupDelete" in $$props) groupDelete = $$props.groupDelete;
    		if ("clearOb" in $$props) clearOb = $$props.clearOb;
    		if ("worker_OO" in $$props) worker_OO = $$props.worker_OO;
    		if ("mon" in $$props) $$invalidate(3, mon = $$props.mon);
    		if ("statement" in $$props) statement = $$props.statement;
    		if ("fa" in $$props) fa = $$props.fa;
    		if ("onmessServer" in $$props) $$invalidate(4, onmessServer = $$props.onmessServer);
    		if ("onmessWorker" in $$props) $$invalidate(5, onmessWorker = $$props.onmessWorker);
    		if ("candle" in $$props) $$invalidate(6, candle = $$props.candle);
    	};
    	return [O, j, factors, mon, onmessServer, onmessWorker, candle];
    }

    class Monad2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {}, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Monad2",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/Monad3.svelte generated by Svelte v3.16.7 */
    const file$3 = "src/Monad3.svelte";

    // (248:2) {#if j === 3}
    function create_if_block$2(ctx) {
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let div2_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "A MONAD FOR PROMISE MANIPULATION";
    			t1 = space();
    			div1 = element("div");
    			div1.textContent = "Computations Easily Resumed and Branched";
    			set_style(div0, "font-size", "26px");
    			add_location(div0, file$3, 249, 0, 6078);
    			set_style(div1, "font-size", "22px");
    			add_location(div1, file$3, 250, 0, 6150);
    			set_style(div2, "font-family", "Times New Roman");
    			set_style(div2, "text-align", "center");
    			set_style(div2, "color", "hsl(210, 90%, 90%)");
    			add_location(div2, file$3, 248, 1, 5967);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div2_transition) div2_transition = create_bidirectional_transition(div2, fade, {}, true);
    				div2_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div2_transition) div2_transition = create_bidirectional_transition(div2, fade, {}, false);
    			div2_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (detaching && div2_transition) div2_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(248:2) {#if j === 3}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let t0;
    	let h20;
    	let t1;
    	let t2_value = /*O*/ ctx[0].test + "";
    	let t2;
    	let t3;
    	let h21;
    	let t4;
    	let t5_value = /*O*/ ctx[0].test_2 + "";
    	let t5;
    	let t6;
    	let br0;
    	let t7;
    	let span0;
    	let t9;
    	let br1;
    	let br2;
    	let t10;
    	let button0;
    	let pre0;
    	let t12;
    	let p0;
    	let t13;
    	let br3;
    	let t14;
    	let p1;
    	let t16;
    	let pre1;
    	let t18;
    	let p2;
    	let t20;
    	let pre2;
    	let t22;
    	let p3;
    	let t24;
    	let pre3;
    	let t26;
    	let br4;
    	let t27;
    	let button1;
    	let pre4;
    	let t29;
    	let br5;
    	let t30;
    	let h22;
    	let t31;
    	let t32_value = /*O*/ ctx[0].test + "";
    	let t32;
    	let t33;
    	let h23;
    	let t34;
    	let t35_value = /*O*/ ctx[0].test_2 + "";
    	let t35;
    	let t36;
    	let br6;
    	let t37;
    	let br7;
    	let t38;
    	let span1;
    	let t40;
    	let span2;
    	let t42;
    	let span3;
    	let t44;
    	let br8;
    	let t45;
    	let br9;
    	let t46;
    	let br10;
    	let current;
    	let dispose;
    	let if_block = /*j*/ ctx[1] === 3 && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			h20 = element("h2");
    			t1 = text("O.test is ");
    			t2 = text(t2_value);
    			t3 = space();
    			h21 = element("h2");
    			t4 = text("O.test_2 is ");
    			t5 = text(t5_value);
    			t6 = space();
    			br0 = element("br");
    			t7 = space();
    			span0 = element("span");
    			span0.textContent = "To see branch() and resume() in action, click the verbose butt6n (below). To see the boolean \"lok\" protecting the integrity of the data, click the verbose button (below) several times in rapid succession:";
    			t9 = space();
    			br1 = element("br");
    			br2 = element("br");
    			t10 = space();
    			button0 = element("button");
    			pre0 = element("pre");
    			pre0.textContent = "Monad([2], \"test\")(addP(1))\n(cubeP)(addP(3))(squareP)(divP(100))(() => \nbranch(\"test\", \"test_2\")(sqrtP)(cubeP)(addP(O.test_2[2])\n(O.test_2[1]))(squareP)(divP(100))(sqrtP)(multP(14))(() =>\nresume(\"test\")(multP(4))(addP(6))))";
    			t12 = space();
    			p0 = element("p");
    			t13 = space();
    			br3 = element("br");
    			t14 = space();
    			p1 = element("p");
    			p1.textContent = "Here's the modified monad constructor:";
    			t16 = space();
    			pre1 = element("pre");
    			pre1.textContent = `${/*mon*/ ctx[2]}`;
    			t18 = space();
    			p2 = element("p");
    			p2.textContent = "After monads encounter \"halt\", they can use the function resume() to continue processing data where they left off and (2) they can branch off in new monads created by branch(). Here are the definitions:";
    			t20 = space();
    			pre2 = element("pre");
    			pre2.textContent = `${/*fs*/ ctx[4]}`;
    			t22 = space();
    			p3 = element("p");
    			p3.textContent = "This is the statement that produces the observed results when \"START\" is clicked.";
    			t24 = space();
    			pre3 = element("pre");
    			pre3.textContent = `${/*code*/ ctx[5]}`;
    			t26 = space();
    			br4 = element("br");
    			t27 = space();
    			button1 = element("button");
    			pre4 = element("pre");
    			pre4.textContent = "Monad([2], \"test\")(addP(1))\n(cubeP)(addP(3))(squareP)(divP(100))(() => \nbranch(\"test\", \"test_2\")(sqrtP)(cubeP)(addP(O.test_2[2])\n(O.test_2[1]))(squareP)(divP(100))(sqrtP)(multP(14))(() =>\nresume(\"test\")(multP(4))(addP(6))))";
    			t29 = space();
    			br5 = element("br");
    			t30 = space();
    			h22 = element("h2");
    			t31 = text("O.test is ");
    			t32 = text(t32_value);
    			t33 = space();
    			h23 = element("h2");
    			t34 = text("O.test_2 is ");
    			t35 = text(t35_value);
    			t36 = space();
    			br6 = element("br");
    			t37 = space();
    			br7 = element("br");
    			t38 = space();
    			span1 = element("span");
    			span1.textContent = "Notice the statement:";
    			t40 = space();
    			span2 = element("span");
    			span2.textContent = "()=>addP(O.test_2[2])(O.test_2[1])";
    			t42 = space();
    			span3 = element("span");
    			span3.textContent = ". Promises in chains of ES6 Promises can't access previous Promise resolution values. One way to get access to prior resolution values is to encapsulate Promise chains in Monad(). This also makes it convenient to resume or branch from terminated computation chains; something that can be accomplished without naming the chains.";
    			t44 = space();
    			br8 = element("br");
    			t45 = space();
    			br9 = element("br");
    			t46 = space();
    			br10 = element("br");
    			add_location(h20, file$3, 254, 2, 6247);
    			add_location(h21, file$3, 255, 2, 6277);
    			add_location(br0, file$3, 255, 46, 6321);
    			attr_dev(span0, "class", "tao");
    			add_location(span0, file$3, 256, 2, 6328);
    			add_location(br1, file$3, 257, 2, 6559);
    			add_location(br2, file$3, 257, 6, 6563);
    			attr_dev(pre0, "class", "svelte-41wco8");
    			add_location(pre0, file$3, 259, 56, 6625);
    			set_style(button0, "text-align", "left");
    			attr_dev(button0, "class", "svelte-41wco8");
    			add_location(button0, file$3, 259, 2, 6571);
    			add_location(p0, file$3, 264, 0, 6869);
    			add_location(br3, file$3, 265, 2, 6881);
    			add_location(p1, file$3, 266, 2, 6888);
    			attr_dev(pre1, "class", "svelte-41wco8");
    			add_location(pre1, file$3, 267, 2, 6938);
    			add_location(p2, file$3, 268, 2, 6957);
    			attr_dev(pre2, "class", "svelte-41wco8");
    			add_location(pre2, file$3, 269, 2, 7170);
    			add_location(p3, file$3, 270, 2, 7188);
    			attr_dev(pre3, "class", "svelte-41wco8");
    			add_location(pre3, file$3, 271, 2, 7281);
    			add_location(br4, file$3, 271, 46, 7325);
    			attr_dev(pre4, "class", "svelte-41wco8");
    			add_location(pre4, file$3, 272, 56, 7386);
    			set_style(button1, "text-align", "left");
    			attr_dev(button1, "class", "svelte-41wco8");
    			add_location(button1, file$3, 272, 2, 7332);
    			add_location(br5, file$3, 279, 2, 7634);
    			add_location(h22, file$3, 280, 2, 7641);
    			add_location(h23, file$3, 281, 2, 7671);
    			add_location(br6, file$3, 282, 2, 7705);
    			add_location(br7, file$3, 284, 2, 7713);
    			attr_dev(span1, "class", "tao");
    			add_location(span1, file$3, 285, 2, 7720);
    			set_style(span2, "color", "#AAFFAA");
    			add_location(span2, file$3, 286, 2, 7773);
    			add_location(span3, file$3, 287, 2, 7848);
    			add_location(br8, file$3, 288, 2, 8192);
    			add_location(br9, file$3, 289, 2, 8199);
    			add_location(br10, file$3, 290, 2, 8206);

    			dispose = [
    				listen_dev(button0, "click", /*start*/ ctx[3], false, false, false),
    				listen_dev(button1, "click", /*start*/ ctx[3], false, false, false)
    			];
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, h20, anchor);
    			append_dev(h20, t1);
    			append_dev(h20, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, h21, anchor);
    			append_dev(h21, t4);
    			append_dev(h21, t5);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, br0, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, span0, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, br2, anchor);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, button0, anchor);
    			append_dev(button0, pre0);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, br3, anchor);
    			insert_dev(target, t14, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t16, anchor);
    			insert_dev(target, pre1, anchor);
    			insert_dev(target, t18, anchor);
    			insert_dev(target, p2, anchor);
    			insert_dev(target, t20, anchor);
    			insert_dev(target, pre2, anchor);
    			insert_dev(target, t22, anchor);
    			insert_dev(target, p3, anchor);
    			insert_dev(target, t24, anchor);
    			insert_dev(target, pre3, anchor);
    			insert_dev(target, t26, anchor);
    			insert_dev(target, br4, anchor);
    			insert_dev(target, t27, anchor);
    			insert_dev(target, button1, anchor);
    			append_dev(button1, pre4);
    			insert_dev(target, t29, anchor);
    			insert_dev(target, br5, anchor);
    			insert_dev(target, t30, anchor);
    			insert_dev(target, h22, anchor);
    			append_dev(h22, t31);
    			append_dev(h22, t32);
    			insert_dev(target, t33, anchor);
    			insert_dev(target, h23, anchor);
    			append_dev(h23, t34);
    			append_dev(h23, t35);
    			insert_dev(target, t36, anchor);
    			insert_dev(target, br6, anchor);
    			insert_dev(target, t37, anchor);
    			insert_dev(target, br7, anchor);
    			insert_dev(target, t38, anchor);
    			insert_dev(target, span1, anchor);
    			insert_dev(target, t40, anchor);
    			insert_dev(target, span2, anchor);
    			insert_dev(target, t42, anchor);
    			insert_dev(target, span3, anchor);
    			insert_dev(target, t44, anchor);
    			insert_dev(target, br8, anchor);
    			insert_dev(target, t45, anchor);
    			insert_dev(target, br9, anchor);
    			insert_dev(target, t46, anchor);
    			insert_dev(target, br10, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty[0] & /*O*/ 1) && t2_value !== (t2_value = /*O*/ ctx[0].test + "")) set_data_dev(t2, t2_value);
    			if ((!current || dirty[0] & /*O*/ 1) && t5_value !== (t5_value = /*O*/ ctx[0].test_2 + "")) set_data_dev(t5, t5_value);
    			if ((!current || dirty[0] & /*O*/ 1) && t32_value !== (t32_value = /*O*/ ctx[0].test + "")) set_data_dev(t32, t32_value);
    			if ((!current || dirty[0] & /*O*/ 1) && t35_value !== (t35_value = /*O*/ ctx[0].test_2 + "")) set_data_dev(t35, t35_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(h20);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(h21);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(span0);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(br2);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(br3);
    			if (detaching) detach_dev(t14);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t16);
    			if (detaching) detach_dev(pre1);
    			if (detaching) detach_dev(t18);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t20);
    			if (detaching) detach_dev(pre2);
    			if (detaching) detach_dev(t22);
    			if (detaching) detach_dev(p3);
    			if (detaching) detach_dev(t24);
    			if (detaching) detach_dev(pre3);
    			if (detaching) detach_dev(t26);
    			if (detaching) detach_dev(br4);
    			if (detaching) detach_dev(t27);
    			if (detaching) detach_dev(button1);
    			if (detaching) detach_dev(t29);
    			if (detaching) detach_dev(br5);
    			if (detaching) detach_dev(t30);
    			if (detaching) detach_dev(h22);
    			if (detaching) detach_dev(t33);
    			if (detaching) detach_dev(h23);
    			if (detaching) detach_dev(t36);
    			if (detaching) detach_dev(br6);
    			if (detaching) detach_dev(t37);
    			if (detaching) detach_dev(br7);
    			if (detaching) detach_dev(t38);
    			if (detaching) detach_dev(span1);
    			if (detaching) detach_dev(t40);
    			if (detaching) detach_dev(span2);
    			if (detaching) detach_dev(t42);
    			if (detaching) detach_dev(span3);
    			if (detaching) detach_dev(t44);
    			if (detaching) detach_dev(br8);
    			if (detaching) detach_dev(t45);
    			if (detaching) detach_dev(br9);
    			if (detaching) detach_dev(t46);
    			if (detaching) detach_dev(br10);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function wait$2(ms) {
    	return new Promise(r => setTimeout(r, ms));
    }

    async function squareP(x) {
    	await wait$2(100);
    	return x * x;
    }

    async function cubeP(x) {
    	await wait$2(300);
    	return x * x * x;
    }

    async function sqrtP(x) {
    	await wait$2(900);
    	return x ** (1 / 2);
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let visible = true;
    	let j = 3;

    	var pauseP = t => async x => {
    		await wait$2(t * 1000);
    		return x;
    	};

    	var divPinverse = a => async b => {
    		await wait$2(300);
    		return a / b;
    	};

    	var divP = a => async b => {
    		await wait$2(300);
    		return b / a;
    	};

    	var doubleP = async a => {
    		await wait$2(300);
    		return a + a;
    	};

    	var toInt = a => pareseInt(a, 10);

    	var addP_toInt = x => async y => {
    		await wait$2(300);
    		return toInt(x) + toInt(y);
    	};

    	var addP = x => async y => {
    		await wait$2(900);
    		return x + y;
    	};

    	var multP = x => async y => {
    		await wait$2(300);
    		return x * y;
    	};

    	var powP = x => async y => {
    		await wait$2(300);
    		return y ** x;
    	};

    	var _conveNt_ = a => b => parseFloat(b, a);
    	var toFloat = _conveNt_(10);
    	var cube = x => x ** 3;
    	var pow = p => x => x ** p;
    	var square = x => x * x;
    	var add = x => y => x + y;
    	var sqrt = x => x ** (1 / 2);
    	var root = r => x => x(1 / r);
    	var div = d => x => x / d;

    	var f = function f() {
    		
    	};

    	var f_ = function f_() {
    		
    	};

    	var sto = "sto";
    	var halt = "halt";
    	var O = new Object();
    	var M = -1;
    	var N = -1;
    	var T = -1;
    	var Q = -1;
    	var lock = false;

    	var Monad = function Monad(AR = [], name = "generic") {
    		let p, run, f_;
    		let ar = AR.slice();
    		$$invalidate(0, O[name] = ar, O);
    		let x = O[name].pop();

    		return run = (function run(x) {
    			if (x instanceof Promise) x.then(y => {
    				if (typeof y != "undefined" && y == y && y.name !== "f_") {
    					$$invalidate(0, O[name] = O[name].concat(y), O);
    				}
    			});

    			if (!(x instanceof Promise)) {
    				if (x != undefined && x == x) {
    					$$invalidate(0, O[name] = O[name].concat(x), O);
    				}
    			}

    			f_ = function f_(func) {
    				if (func === "halt" || func === "S") return O[name].slice(); else if (typeof func !== "function") p = func; else if (x instanceof Promise) p = x.then(v => func(v)); else p = func(x);
    				return run(p);
    			};

    			return f_;
    		})(x);
    	};

    	var branch = function branch(s, s2) {
    		return Monad(O[s].slice(), s2);
    	};

    	var resume = function resume(s) {
    		return Monad(O[s], s);
    	};

    	Monad([2], "test")(addP(1))(cubeP)(addP(3))(squareP)(divP(100))(() => branch("test", "test_2")(sqrtP)(cubeP)(() => addP(O.test_2[2])(O.test_2[1]))(squareP)(divP(100))(sqrtP)(multP(14))(() => resume("test")(multP(4))(addP(6))));

    	var mon = `   var Monad = function Monad ( AR = [], name = "generic"  )  {
      var f_, p, run;
      var ar = AR.slice();
      var name = name;
      O[name] = ar;
      let x = O[name].pop();
      return run = (function run (x) {
        if (x instanceof Promise) x.then(y => {
          if (y != undefined && y == y && y.name !== "f_") {
          O[name] = O[name].concat(y)
          }
        })
        if (!(x instanceof Promise)) {
            if (x != undefined && x == x) {
              O[name] = O[name].concat(x)
            }
        }
        function f_ (func) {
          if (func === 'halt' || func === 'S') return O[name].slice();
          else if (typeof func !== "function") p = func;
          else if (x instanceof Promise) p = x.then(v => func(v));
          else p = func(x);
          return run(p);
        };
        return f_;
      })(x);
    }`;

    	var lok = false;

    	var start = function start() {
    		if (!lok) {
    			lok = true;
    			setTimeout(() => lok = false, 3000);
    			$$invalidate(0, O = {});
    			Monad([2], "test")(addP(1))(cubeP)(addP(3))(squareP)(divP(100))(() => branch("test", "test_2")(sqrtP)(cubeP)(() => addP(O.test_2[2])(O.test_2[1]))(squareP)(divP(100))(sqrtP)(multP(14))(() => resume("test")(multP(4))(addP(6))));
    		} else {
    			setTimeout(() => start(), 300);
    		}
    	};

    	var fs = `   var branch = function branch (s,s2) {return Monad(O[s].slice(-1)  , s2)}
    var resume = function resume (s) {return Monad(O[s], s)}`;

    	var code = `    Monad([2], "test")(addP(1))(cubeP)(addP(3))(squareP)(divP(100))
      (() => branch("test", "test_2")(sqrtP)(cubeP)(()=>addP(O.test_2[2])
      (O.test_2[1]))(squareP)(divP(100))(sqrtP)(multP(14))
      (() => resume("test")(multP(4))(addP(6))))`;

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("visible" in $$props) visible = $$props.visible;
    		if ("j" in $$props) $$invalidate(1, j = $$props.j);
    		if ("pauseP" in $$props) pauseP = $$props.pauseP;
    		if ("divPinverse" in $$props) divPinverse = $$props.divPinverse;
    		if ("divP" in $$props) divP = $$props.divP;
    		if ("doubleP" in $$props) doubleP = $$props.doubleP;
    		if ("toInt" in $$props) toInt = $$props.toInt;
    		if ("addP_toInt" in $$props) addP_toInt = $$props.addP_toInt;
    		if ("addP" in $$props) addP = $$props.addP;
    		if ("multP" in $$props) multP = $$props.multP;
    		if ("powP" in $$props) powP = $$props.powP;
    		if ("_conveNt_" in $$props) _conveNt_ = $$props._conveNt_;
    		if ("toFloat" in $$props) toFloat = $$props.toFloat;
    		if ("cube" in $$props) cube = $$props.cube;
    		if ("pow" in $$props) pow = $$props.pow;
    		if ("square" in $$props) square = $$props.square;
    		if ("add" in $$props) add = $$props.add;
    		if ("sqrt" in $$props) sqrt = $$props.sqrt;
    		if ("root" in $$props) root = $$props.root;
    		if ("div" in $$props) div = $$props.div;
    		if ("f" in $$props) f = $$props.f;
    		if ("f_" in $$props) f_ = $$props.f_;
    		if ("sto" in $$props) sto = $$props.sto;
    		if ("halt" in $$props) halt = $$props.halt;
    		if ("O" in $$props) $$invalidate(0, O = $$props.O);
    		if ("M" in $$props) $$invalidate(30, M = $$props.M);
    		if ("N" in $$props) $$invalidate(31, N = $$props.N);
    		if ("T" in $$props) $$invalidate(32, T = $$props.T);
    		if ("Q" in $$props) $$invalidate(33, Q = $$props.Q);
    		if ("lock" in $$props) $$invalidate(34, lock = $$props.lock);
    		if ("Monad" in $$props) Monad = $$props.Monad;
    		if ("branch" in $$props) branch = $$props.branch;
    		if ("resume" in $$props) resume = $$props.resume;
    		if ("mon" in $$props) $$invalidate(2, mon = $$props.mon);
    		if ("lok" in $$props) lok = $$props.lok;
    		if ("start" in $$props) $$invalidate(3, start = $$props.start);
    		if ("fs" in $$props) $$invalidate(4, fs = $$props.fs);
    		if ("code" in $$props) $$invalidate(5, code = $$props.code);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*O*/ 1) ;
    	};
    	return [O, j, mon, start, fs, code];
    }

    class Monad3 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {}, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Monad3",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/Haskell.svelte generated by Svelte v3.16.7 */
    const file$4 = "src/Haskell.svelte";

    // (30:0) {#if visible}
    function create_if_block$3(ctx) {
    	let div;
    	let div_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "HASKELL TUTORIAL SUPPLEMENT";
    			set_style(div, "font-family", "Times New Roman");
    			set_style(div, "text-align", "center");
    			set_style(div, "color", "hsl(210, 90%, 90%)");
    			set_style(div, "font-size", "32px");
    			add_location(div, file$4, 30, 1, 594);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(30:0) {#if visible}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let t0;
    	let p0;
    	let t2;
    	let p1;
    	let t4;
    	let p2;
    	let t6;
    	let p3;
    	let t8;
    	let span0;
    	let t10;
    	let a0;
    	let t12;
    	let br0;
    	let t13;
    	let pre;
    	let t15;
    	let p4;
    	let t17;
    	let span1;
    	let t19;
    	let a1;
    	let t21;
    	let br1;
    	let t22;
    	let br2;
    	let t23;
    	let span2;
    	let t25;
    	let a2;
    	let t27;
    	let span3;
    	let t29;
    	let a3;
    	let current;
    	let if_block = /*visible*/ ctx[0] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			p0 = element("p");
    			p0.textContent = "If you are learning to program in Haskell, the book or blog or YouTube video on which you rely might be telling you that mutations can occur only inside of monads or somewhere away from a program such as the command line or a browser. You might be learning that mutations and side effects can occur only in the lazy IO monad. If so, don't believe it. You are being misled.";
    			t2 = space();
    			p1 = element("p");
    			p1.textContent = "Even if you resent being lied to, you might find value in some of the dishonest learning resources. They are trying to teach best practices. Just know know that it is easy to mutate values and types anywhere in a Haskell program. Doing so before you know what your compiler (presumably GHC) will do with your mutations is asking for bugs and crashes.  Here are some unsafe functions with descriptions from their creators and maintainers:";
    			t4 = space();
    			p2 = element("p");
    			p2.textContent = "Unsafe.Coerce";
    			t6 = space();
    			p3 = element("p");
    			p3.textContent = "The highly unsafe primitive unsafeCoerce converts a value from any type to any other type. If you use this function, avoiding runtime errors will be especially challenging if the old and new types have different internal representations.";
    			t8 = space();
    			span0 = element("span");
    			span0.textContent = "The only function in the Unsafe.Coerce library is unsafeCoerce :: a -> b. You can read more about it at";
    			t10 = space();
    			a0 = element("a");
    			a0.textContent = "Unsafe.Coerce";
    			t12 = space();
    			br0 = element("br");
    			t13 = space();
    			pre = element("pre");
    			pre.textContent = "GHC.IO.Unsafe";
    			t15 = space();
    			p4 = element("p");
    			p4.textContent = "If the IO computation wrapped in \\'unsafePerformIO\\' performs side effects, then the relative order in which those side effects take place (relative to the main IO trunk, or other calls to \\'unsafePerformIO\\') is indeterminate.  Furthermore, when using \\'unsafePerformIO\\' to cause side-effects, you should take the following precautions to ensure the side effects are performed as many times as you expect them to be.  Note that these precautions are necessary for GHC, but may not be sufficient, and other compilers may require different precautions.";
    			t17 = space();
    			span1 = element("span");
    			span1.textContent = "For more information, go to";
    			t19 = space();
    			a1 = element("a");
    			a1.textContent = "GHC.IO.Unsafe";
    			t21 = space();
    			br1 = element("br");
    			t22 = space();
    			br2 = element("br");
    			t23 = space();
    			span2 = element("span");
    			span2.textContent = "And here\\'s a stub on the Haskell Wiki site that isn\\'t generating much interest:";
    			t25 = space();
    			a2 = element("a");
    			a2.textContent = "More on GHC.IO.Unsafe";
    			t27 = space();
    			span3 = element("span");
    			span3.textContent = "along with a discussion of mutable global variables in Haskell programs:";
    			t29 = space();
    			a3 = element("a");
    			a3.textContent = "Top level mutable state";
    			add_location(p0, file$4, 35, 0, 763);
    			add_location(p1, file$4, 36, 0, 1146);
    			attr_dev(p2, "id", "large");
    			attr_dev(p2, "class", "svelte-hw6ke3");
    			add_location(p2, file$4, 37, 0, 1593);
    			add_location(p3, file$4, 38, 0, 1627);
    			attr_dev(span0, "class", "tao");
    			add_location(span0, file$4, 39, 0, 1874);
    			attr_dev(a0, "href", "http://hackage.haskell.org/package/base-4.12.0.0/docs/Unsafe-Coerce.html");
    			attr_dev(a0, "target", "_blank");
    			add_location(a0, file$4, 40, 0, 2005);
    			add_location(br0, file$4, 41, 0, 2126);
    			add_location(pre, file$4, 42, 0, 2133);
    			add_location(p4, file$4, 43, 0, 2160);
    			attr_dev(span1, "class", "tao");
    			add_location(span1, file$4, 44, 0, 2722);
    			attr_dev(a1, "href", "http://hackage.haskell.org/package/base-4.12.0.0/docs/src/GHC.IO.Unsafe.html");
    			attr_dev(a1, "target", "_blank");
    			add_location(a1, file$4, 45, 0, 2778);
    			add_location(br1, file$4, 46, 0, 2905);
    			add_location(br2, file$4, 47, 0, 2912);
    			attr_dev(span2, "class", "tao");
    			add_location(span2, file$4, 48, 0, 2919);
    			attr_dev(a2, "href", "https://wiki.haskell.org/Unsafe_functions");
    			attr_dev(a2, "target", "_blank");
    			add_location(a2, file$4, 49, 0, 3028);
    			add_location(span3, file$4, 50, 0, 3129);
    			attr_dev(a3, "href", "https://wiki.haskell.org/Top_level_mutable_state");
    			attr_dev(a3, "target", "_blank");
    			add_location(a3, file$4, 51, 0, 3217);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, p2, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, p3, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, span0, anchor);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, a0, anchor);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, br0, anchor);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, pre, anchor);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, p4, anchor);
    			insert_dev(target, t17, anchor);
    			insert_dev(target, span1, anchor);
    			insert_dev(target, t19, anchor);
    			insert_dev(target, a1, anchor);
    			insert_dev(target, t21, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, t22, anchor);
    			insert_dev(target, br2, anchor);
    			insert_dev(target, t23, anchor);
    			insert_dev(target, span2, anchor);
    			insert_dev(target, t25, anchor);
    			insert_dev(target, a2, anchor);
    			insert_dev(target, t27, anchor);
    			insert_dev(target, span3, anchor);
    			insert_dev(target, t29, anchor);
    			insert_dev(target, a3, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(p3);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(span0);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(a0);
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(pre);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(p4);
    			if (detaching) detach_dev(t17);
    			if (detaching) detach_dev(span1);
    			if (detaching) detach_dev(t19);
    			if (detaching) detach_dev(a1);
    			if (detaching) detach_dev(t21);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(t22);
    			if (detaching) detach_dev(br2);
    			if (detaching) detach_dev(t23);
    			if (detaching) detach_dev(span2);
    			if (detaching) detach_dev(t25);
    			if (detaching) detach_dev(a2);
    			if (detaching) detach_dev(t27);
    			if (detaching) detach_dev(span3);
    			if (detaching) detach_dev(t29);
    			if (detaching) detach_dev(a3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self) {
    	let visible = true;

    	let GHC_IO = `module GHC.IO.Unsafe (
    unsafePerformIO, unsafeInterleaveIO,
    unsafeDupablePerformIO, unsafeDupableInterleaveIO,
    noDuplicate,
  ) where

import GHC.Base

This is a \"back door\" into the \'IO\' monad, allowing\'IO\' computation to be performed at any time.  For this to be safe, the \'IO\' computation should be free of side effects and independent of its environment.
 `;

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
    		if ("GHC_IO" in $$props) GHC_IO = $$props.GHC_IO;
    	};

    	return [visible];
    }

    class Haskell extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Haskell",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/Bugs.svelte generated by Svelte v3.16.7 */
    const file$5 = "src/Bugs.svelte";

    // (12:0) {#if visible}
    function create_if_block$4(ctx) {
    	let div;
    	let div_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "COMPLETE ERADICATION OF BED BUGS";
    			set_style(div, "font-family", "Times New Roman");
    			set_style(div, "text-align", "center");
    			set_style(div, "color", "hsl(210, 90%, 90%)");
    			set_style(div, "font-size", "32px");
    			add_location(div, file$5, 12, 1, 394);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(12:0) {#if visible}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let t0;
    	let p0;
    	let t2;
    	let span0;
    	let t4;
    	let span1;
    	let t6;
    	let h3;
    	let t8;
    	let ul;
    	let li0;
    	let t10;
    	let li1;
    	let t12;
    	let li2;
    	let t14;
    	let li3;
    	let t16;
    	let li4;
    	let t18;
    	let li5;
    	let t20;
    	let li6;
    	let t22;
    	let li7;
    	let t24;
    	let li8;
    	let t26;
    	let p1;
    	let t28;
    	let p2;
    	let t30;
    	let p3;
    	let t32;
    	let p4;
    	let t34;
    	let p5;
    	let t36;
    	let p6;
    	let t38;
    	let p7;
    	let current;
    	let if_block = /*visible*/ ctx[0] && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			p0 = element("p");
    			p0.textContent = "It is widely believed that the only reliable way to eraacate a bed bug infestation is to pay thousands of dollars for a thorough heat treatment; one that sends deadly heat through drywall and insullation all the way to the exterior walls. I had a massive bed bug infestation in my rented condominium. My box springs were on the floor, making it easy for bed bugs to climb onto my mattress and feast on me -- and increase in numbers exponentially.";
    			t2 = space();
    			span0 = element("span");
    			span0.textContent = "As I researched the life cycle of bed bugs, it became clear that bed bugs are far easier to eradicate than termites or cock roaches:";
    			t4 = space();
    			span1 = element("span");
    			span1.textContent = "BED BUG INFESTATIONS ARE EXTREMELY FRAGILE!";
    			t6 = space();
    			h3 = element("h3");
    			h3.textContent = "Pertinent Facts About Bed Bugs";
    			t8 = space();
    			ul = element("ul");
    			li0 = element("li");
    			li0.textContent = "Blood is the only substance that nourishes them.";
    			t10 = space();
    			li1 = element("li");
    			li1.textContent = "After emerging from eggs, bed bug nymphs molt five times.";
    			t12 = space();
    			li2 = element("li");
    			li2.textContent = "Stage one nymphs can't survive beyond two months at room temperature without blood.";
    			t14 = space();
    			li3 = element("li");
    			li3.textContent = "Mature bed bugs don't survive more than six months at room temperature.";
    			t16 = space();
    			li4 = element("li");
    			li4.textContent = "Nymphs must have blood before each of their five moltings.";
    			t18 = space();
    			li5 = element("li");
    			li5.textContent = "Bed bugs will go to the source of exhaled carbon dioxide.";
    			t20 = space();
    			li6 = element("li");
    			li6.textContent = "After sufficient (not much) contact with silica gel, bed bugs dry up and die within three days.";
    			t22 = space();
    			li7 = element("li");
    			li7.textContent = "Silica gel is not systemically toxic, but it is a respiratory tract irritant.";
    			t24 = space();
    			li8 = element("li");
    			li8.textContent = "Cimex® silica gel is very expensive but a five-pound bag from Ebay is pretty cheap.";
    			t26 = space();
    			p1 = element("p");
    			p1.textContent = "I put the box spring on a metal frame with each leg in a bed bug trap. I encased the mattress but not the box spring because I could see through the mesh on the bottom that no bugs had entered.";
    			t28 = space();
    			p2 = element("p");
    			p2.textContent = "A coffee grinder was used to Fluff the silica gel (obtained from Ebay) which was then applied (with a big yellow puffer from Amazon.com) under and around my bed and between the box spring and matterss.";
    			t30 = space();
    			p3 = element("p");
    			p3.textContent = "I knew bed bugs would not lay dormant in furnature, walls, and rugs when they sensed a source of carbon dioxide. I was confident that failing to find a route to my bed around the silica gel they would give up and walk through silica gel in an effort to obtain blood. Their life expectancy was then a couple of days, at most.";
    			t32 = space();
    			p4 = element("p");
    			p4.textContent = "I puffed silica gel into light sockets and anywhere a wall panel could be removed. Soon, the only bed bugs I could find were located in upholstered furniture. I could have killed them, but I decided to throw the invested furnitue away.";
    			t34 = space();
    			p5 = element("p");
    			p5.textContent = "Professional exterminators get unsatisfactory results with silica gel because they won't leave a site that has visible white powder on the floor. They tried applying silica gel in water, which seems absurd since silica gel kills bed bugs by drying them out.";
    			t36 = space();
    			p6 = element("p");
    			p6.textContent = "The little packets of drying agent found in jars and bags of commercial consumer goods usually contain silica gel. USDA regulations allow up to two percent silica gel in food. You should wear a dust mask while dispensing silica gel with a puffer, or else hold your breath and rush into an adjacent room when you need air.";
    			t38 = space();
    			p7 = element("p");
    			p7.textContent = "Professional eradicators don't leave visible residues on floors. That is why they get poor results with silica gel; results comparable to the ones they get with toxic pesticides. Professional exterminators have been known to apply silica gel dissolved in water, which seems absurd in light of the fact that silica gel kills bed bugs by drying them up.";
    			add_location(p0, file$5, 16, 0, 568);
    			add_location(span0, file$5, 17, 0, 1022);
    			set_style(span1, "font-weight", "900");
    			set_style(span1, "color", "#ddff00");
    			add_location(span1, file$5, 18, 0, 1170);
    			add_location(h3, file$5, 19, 0, 1270);
    			add_location(li0, file$5, 21, 0, 1315);
    			add_location(li1, file$5, 22, 0, 1374);
    			add_location(li2, file$5, 23, 0, 1441);
    			add_location(li3, file$5, 24, 0, 1534);
    			add_location(li4, file$5, 25, 0, 1615);
    			add_location(li5, file$5, 26, 0, 1683);
    			add_location(li6, file$5, 27, 0, 1750);
    			add_location(li7, file$5, 28, 0, 1855);
    			add_location(li8, file$5, 29, 0, 1943);
    			add_location(ul, file$5, 20, 0, 1310);
    			add_location(p1, file$5, 31, 0, 2042);
    			add_location(p2, file$5, 32, 0, 2245);
    			add_location(p3, file$5, 33, 0, 2456);
    			add_location(p4, file$5, 34, 0, 2789);
    			add_location(p5, file$5, 37, 0, 3036);
    			add_location(p6, file$5, 38, 0, 3302);
    			add_location(p7, file$5, 39, 0, 3632);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, span0, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, span1, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, h3, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, ul, anchor);
    			append_dev(ul, li0);
    			append_dev(ul, t10);
    			append_dev(ul, li1);
    			append_dev(ul, t12);
    			append_dev(ul, li2);
    			append_dev(ul, t14);
    			append_dev(ul, li3);
    			append_dev(ul, t16);
    			append_dev(ul, li4);
    			append_dev(ul, t18);
    			append_dev(ul, li5);
    			append_dev(ul, t20);
    			append_dev(ul, li6);
    			append_dev(ul, t22);
    			append_dev(ul, li7);
    			append_dev(ul, t24);
    			append_dev(ul, li8);
    			insert_dev(target, t26, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t28, anchor);
    			insert_dev(target, p2, anchor);
    			insert_dev(target, t30, anchor);
    			insert_dev(target, p3, anchor);
    			insert_dev(target, t32, anchor);
    			insert_dev(target, p4, anchor);
    			insert_dev(target, t34, anchor);
    			insert_dev(target, p5, anchor);
    			insert_dev(target, t36, anchor);
    			insert_dev(target, p6, anchor);
    			insert_dev(target, t38, anchor);
    			insert_dev(target, p7, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(span0);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(span1);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(ul);
    			if (detaching) detach_dev(t26);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t28);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t30);
    			if (detaching) detach_dev(p3);
    			if (detaching) detach_dev(t32);
    			if (detaching) detach_dev(p4);
    			if (detaching) detach_dev(t34);
    			if (detaching) detach_dev(p5);
    			if (detaching) detach_dev(t36);
    			if (detaching) detach_dev(p6);
    			if (detaching) detach_dev(t38);
    			if (detaching) detach_dev(p7);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self) {
    	let visible = true;
    	var axe = `var mon = Monad(3);var a = mon(x=>x**3)(x=>x+3)(x=>x**2)(stop)console.log("a is", a) // a os 900console.log("mon is", mon); /*ƒ foo(func) {var stop = "stop";if (func.name === "stop") return x;else {x = func(x);return foo;}} */mon(x => x/100)console.log("mon(stop) now is",mon(stop))`;

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
    		if ("axe" in $$props) axe = $$props.axe;
    	};

    	return [visible];
    }

    class Bugs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Bugs",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/Matrix.svelte generated by Svelte v3.16.7 */
    const file$6 = "src/Matrix.svelte";

    // (147:0) {#if visible}
    function create_if_block$5(ctx) {
    	let div;
    	let div_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "A LITTLE SVELTE MODULE";
    			set_style(div, "font-family", "Times New Roman");
    			set_style(div, "text-align", "center");
    			set_style(div, "color", "hsl(210, 90%, 90%)");
    			set_style(div, "font-size", "38px");
    			add_location(div, file$6, 147, 1, 3955);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(147:0) {#if visible}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let t0;
    	let br0;
    	let t1;
    	let br1;
    	let t2;
    	let div3;
    	let div1;
    	let button0;
    	let t4;
    	let br2;
    	let t5;
    	let br3;
    	let t6;
    	let div0;
    	let button1;
    	let t7;
    	let t8;
    	let br4;
    	let t9;
    	let button2;
    	let t11;
    	let br5;
    	let t12;
    	let br6;
    	let t13;
    	let div2;
    	let button3;
    	let t14_value = /*cache*/ ctx[3][/*j*/ ctx[0]][0] + "";
    	let t14;
    	let t15;
    	let button4;
    	let t16_value = /*cache*/ ctx[3][/*j*/ ctx[0]][1] + "";
    	let t16;
    	let t17;
    	let button5;
    	let t18_value = /*cache*/ ctx[3][/*j*/ ctx[0]][2] + "";
    	let t18;
    	let t19;
    	let br7;
    	let t20;
    	let br8;
    	let t21;
    	let button6;
    	let t22_value = /*cache*/ ctx[3][/*j*/ ctx[0]][3] + "";
    	let t22;
    	let t23;
    	let button7;
    	let t24_value = /*cache*/ ctx[3][/*j*/ ctx[0]][4] + "";
    	let t24;
    	let t25;
    	let button8;
    	let t26_value = /*cache*/ ctx[3][/*j*/ ctx[0]][5] + "";
    	let t26;
    	let t27;
    	let br9;
    	let t28;
    	let br10;
    	let t29;
    	let button9;
    	let t30_value = /*cache*/ ctx[3][/*j*/ ctx[0]][6] + "";
    	let t30;
    	let t31;
    	let button10;
    	let t32_value = /*cache*/ ctx[3][/*j*/ ctx[0]][7] + "";
    	let t32;
    	let t33;
    	let button11;
    	let t34_value = /*cache*/ ctx[3][/*j*/ ctx[0]][8] + "";
    	let t34;
    	let t35;
    	let br11;
    	let t36;
    	let p0;
    	let t38;
    	let p1;
    	let t40;
    	let pre0;
    	let t42;
    	let p2;
    	let t44;
    	let pre1;
    	let t46;
    	let p3;
    	let current;
    	let dispose;
    	let if_block = /*visible*/ ctx[2] && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			br0 = element("br");
    			t1 = space();
    			br1 = element("br");
    			t2 = space();
    			div3 = element("div");
    			div1 = element("div");
    			button0 = element("button");
    			button0.textContent = "BACK";
    			t4 = space();
    			br2 = element("br");
    			t5 = space();
    			br3 = element("br");
    			t6 = space();
    			div0 = element("div");
    			button1 = element("button");
    			t7 = text(/*j*/ ctx[0]);
    			t8 = space();
    			br4 = element("br");
    			t9 = space();
    			button2 = element("button");
    			button2.textContent = "FORWARD";
    			t11 = space();
    			br5 = element("br");
    			t12 = space();
    			br6 = element("br");
    			t13 = space();
    			div2 = element("div");
    			button3 = element("button");
    			t14 = text(t14_value);
    			t15 = space();
    			button4 = element("button");
    			t16 = text(t16_value);
    			t17 = space();
    			button5 = element("button");
    			t18 = text(t18_value);
    			t19 = space();
    			br7 = element("br");
    			t20 = space();
    			br8 = element("br");
    			t21 = space();
    			button6 = element("button");
    			t22 = text(t22_value);
    			t23 = space();
    			button7 = element("button");
    			t24 = text(t24_value);
    			t25 = space();
    			button8 = element("button");
    			t26 = text(t26_value);
    			t27 = space();
    			br9 = element("br");
    			t28 = space();
    			br10 = element("br");
    			t29 = space();
    			button9 = element("button");
    			t30 = text(t30_value);
    			t31 = space();
    			button10 = element("button");
    			t32 = text(t32_value);
    			t33 = space();
    			button11 = element("button");
    			t34 = text(t34_value);
    			t35 = space();
    			br11 = element("br");
    			t36 = space();
    			p0 = element("p");
    			p0.textContent = "An example of an imbedded module that I will explain later:";
    			t38 = space();
    			p1 = element("p");
    			p1.textContent = "This is the JavaScript code inside of the script tags except for the definitions of the variables \"code\" and \"html\", which are just the code and html cut and pasted inside of back quotes:";
    			t40 = space();
    			pre0 = element("pre");
    			pre0.textContent = `${/*code*/ ctx[6]}`;
    			t42 = space();
    			p2 = element("p");
    			p2.textContent = "And here is the HTML code:";
    			t44 = space();
    			pre1 = element("pre");
    			pre1.textContent = `${/*html*/ ctx[7]}`;
    			t46 = space();
    			p3 = element("p");
    			p3.textContent = "I'm new to Svelte and so far I am very impressed.";
    			add_location(br0, file$6, 152, 0, 4121);
    			add_location(br1, file$6, 153, 0, 4126);
    			add_location(button0, file$6, 157, 0, 4267);
    			add_location(br2, file$6, 160, 0, 4307);
    			add_location(br3, file$6, 161, 0, 4312);
    			add_location(button1, file$6, 162, 30, 4347);
    			set_style(div0, "text-indent", "20px");
    			add_location(div0, file$6, 162, 0, 4317);
    			add_location(br4, file$6, 163, 0, 4376);
    			add_location(button2, file$6, 164, 0, 4381);
    			add_location(br5, file$6, 167, 0, 4427);
    			add_location(br6, file$6, 168, 0, 4432);
    			set_style(div1, "text-align", "right");
    			set_style(div1, "margin-right", "2%");
    			set_style(div1, "width", "20%");
    			add_location(div1, file$6, 155, 20, 4201);
    			attr_dev(button3, "id", "m0");
    			add_location(button3, file$6, 173, 0, 4531);
    			attr_dev(button4, "id", "m1");
    			add_location(button4, file$6, 174, 0, 4593);
    			attr_dev(button5, "id", "m2");
    			add_location(button5, file$6, 175, 0, 4655);
    			add_location(br7, file$6, 176, 0, 4717);
    			add_location(br8, file$6, 177, 0, 4722);
    			attr_dev(button6, "id", "m3");
    			add_location(button6, file$6, 178, 0, 4727);
    			attr_dev(button7, "id", "m4");
    			add_location(button7, file$6, 179, 0, 4789);
    			attr_dev(button8, "id", "m5");
    			add_location(button8, file$6, 180, 0, 4851);
    			add_location(br9, file$6, 181, 0, 4913);
    			add_location(br10, file$6, 182, 0, 4918);
    			attr_dev(button9, "id", "m6");
    			add_location(button9, file$6, 183, 0, 4923);
    			attr_dev(button10, "id", "m7");
    			add_location(button10, file$6, 184, 0, 4985);
    			attr_dev(button11, "id", "m8");
    			add_location(button11, file$6, 185, 0, 5047);
    			set_style(div2, "marginRight", "0%");
    			set_style(div2, "width", "80%");
    			add_location(div2, file$6, 171, 12, 4485);
    			set_style(div3, "display", "flex");
    			add_location(div3, file$6, 154, 20, 4151);
    			add_location(br11, file$6, 188, 0, 5123);
    			add_location(p0, file$6, 189, 0, 5128);
    			add_location(p1, file$6, 191, 0, 5199);
    			add_location(pre0, file$6, 192, 0, 5396);
    			add_location(p2, file$6, 193, 0, 5414);
    			add_location(pre1, file$6, 194, 0, 5450);
    			add_location(p3, file$6, 195, 0, 5468);

    			dispose = [
    				listen_dev(button0, "click", /*back*/ ctx[4], false, false, false),
    				listen_dev(button2, "click", /*forward*/ ctx[5], false, false, false),
    				listen_dev(
    					button3,
    					"click",
    					function () {
    						if (is_function(/*ob*/ ctx[1].push)) /*ob*/ ctx[1].push.apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				),
    				listen_dev(
    					button4,
    					"click",
    					function () {
    						if (is_function(/*ob*/ ctx[1].push)) /*ob*/ ctx[1].push.apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				),
    				listen_dev(
    					button5,
    					"click",
    					function () {
    						if (is_function(/*ob*/ ctx[1].push)) /*ob*/ ctx[1].push.apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				),
    				listen_dev(
    					button6,
    					"click",
    					function () {
    						if (is_function(/*ob*/ ctx[1].push)) /*ob*/ ctx[1].push.apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				),
    				listen_dev(
    					button7,
    					"click",
    					function () {
    						if (is_function(/*ob*/ ctx[1].push)) /*ob*/ ctx[1].push.apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				),
    				listen_dev(
    					button8,
    					"click",
    					function () {
    						if (is_function(/*ob*/ ctx[1].push)) /*ob*/ ctx[1].push.apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				),
    				listen_dev(
    					button9,
    					"click",
    					function () {
    						if (is_function(/*ob*/ ctx[1].push)) /*ob*/ ctx[1].push.apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				),
    				listen_dev(
    					button10,
    					"click",
    					function () {
    						if (is_function(/*ob*/ ctx[1].push)) /*ob*/ ctx[1].push.apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				),
    				listen_dev(
    					button11,
    					"click",
    					function () {
    						if (is_function(/*ob*/ ctx[1].push)) /*ob*/ ctx[1].push.apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				)
    			];
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, br0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div1);
    			append_dev(div1, button0);
    			append_dev(div1, t4);
    			append_dev(div1, br2);
    			append_dev(div1, t5);
    			append_dev(div1, br3);
    			append_dev(div1, t6);
    			append_dev(div1, div0);
    			append_dev(div0, button1);
    			append_dev(button1, t7);
    			append_dev(div1, t8);
    			append_dev(div1, br4);
    			append_dev(div1, t9);
    			append_dev(div1, button2);
    			append_dev(div1, t11);
    			append_dev(div1, br5);
    			append_dev(div1, t12);
    			append_dev(div1, br6);
    			append_dev(div3, t13);
    			append_dev(div3, div2);
    			append_dev(div2, button3);
    			append_dev(button3, t14);
    			append_dev(div2, t15);
    			append_dev(div2, button4);
    			append_dev(button4, t16);
    			append_dev(div2, t17);
    			append_dev(div2, button5);
    			append_dev(button5, t18);
    			append_dev(div2, t19);
    			append_dev(div2, br7);
    			append_dev(div2, t20);
    			append_dev(div2, br8);
    			append_dev(div2, t21);
    			append_dev(div2, button6);
    			append_dev(button6, t22);
    			append_dev(div2, t23);
    			append_dev(div2, button7);
    			append_dev(button7, t24);
    			append_dev(div2, t25);
    			append_dev(div2, button8);
    			append_dev(button8, t26);
    			append_dev(div2, t27);
    			append_dev(div2, br9);
    			append_dev(div2, t28);
    			append_dev(div2, br10);
    			append_dev(div2, t29);
    			append_dev(div2, button9);
    			append_dev(button9, t30);
    			append_dev(div2, t31);
    			append_dev(div2, button10);
    			append_dev(button10, t32);
    			append_dev(div2, t33);
    			append_dev(div2, button11);
    			append_dev(button11, t34);
    			insert_dev(target, t35, anchor);
    			insert_dev(target, br11, anchor);
    			insert_dev(target, t36, anchor);
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t38, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t40, anchor);
    			insert_dev(target, pre0, anchor);
    			insert_dev(target, t42, anchor);
    			insert_dev(target, p2, anchor);
    			insert_dev(target, t44, anchor);
    			insert_dev(target, pre1, anchor);
    			insert_dev(target, t46, anchor);
    			insert_dev(target, p3, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if (!current || dirty & /*j*/ 1) set_data_dev(t7, /*j*/ ctx[0]);
    			if ((!current || dirty & /*j*/ 1) && t14_value !== (t14_value = /*cache*/ ctx[3][/*j*/ ctx[0]][0] + "")) set_data_dev(t14, t14_value);
    			if ((!current || dirty & /*j*/ 1) && t16_value !== (t16_value = /*cache*/ ctx[3][/*j*/ ctx[0]][1] + "")) set_data_dev(t16, t16_value);
    			if ((!current || dirty & /*j*/ 1) && t18_value !== (t18_value = /*cache*/ ctx[3][/*j*/ ctx[0]][2] + "")) set_data_dev(t18, t18_value);
    			if ((!current || dirty & /*j*/ 1) && t22_value !== (t22_value = /*cache*/ ctx[3][/*j*/ ctx[0]][3] + "")) set_data_dev(t22, t22_value);
    			if ((!current || dirty & /*j*/ 1) && t24_value !== (t24_value = /*cache*/ ctx[3][/*j*/ ctx[0]][4] + "")) set_data_dev(t24, t24_value);
    			if ((!current || dirty & /*j*/ 1) && t26_value !== (t26_value = /*cache*/ ctx[3][/*j*/ ctx[0]][5] + "")) set_data_dev(t26, t26_value);
    			if ((!current || dirty & /*j*/ 1) && t30_value !== (t30_value = /*cache*/ ctx[3][/*j*/ ctx[0]][6] + "")) set_data_dev(t30, t30_value);
    			if ((!current || dirty & /*j*/ 1) && t32_value !== (t32_value = /*cache*/ ctx[3][/*j*/ ctx[0]][7] + "")) set_data_dev(t32, t32_value);
    			if ((!current || dirty & /*j*/ 1) && t34_value !== (t34_value = /*cache*/ ctx[3][/*j*/ ctx[0]][8] + "")) set_data_dev(t34, t34_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t35);
    			if (detaching) detach_dev(br11);
    			if (detaching) detach_dev(t36);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t38);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t40);
    			if (detaching) detach_dev(pre0);
    			if (detaching) detach_dev(t42);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t44);
    			if (detaching) detach_dev(pre1);
    			if (detaching) detach_dev(t46);
    			if (detaching) detach_dev(p3);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let visible = true;
    	var cache = [[1, 2, 3, 4, 5, 6, 7, 8, 9]];
    	var j = 0;

    	var ob = {
    		x: [],
    		push: function push(e) {
    			ob.x.push(parseInt(e.target.id.slice(1, 2), 10));

    			if (ob.x.length > 1) {
    				var d = exchange(ob.x[0], ob.x[1]);
    				cache.splice(j + 1, 0, d);
    				$$invalidate(1, ob.x = [], ob);
    				j += 1;
    				return cache;
    				var j = 0;
    			}
    		}
    	};

    	function exchange(k, n) {
    		var ar = cache[j].slice();
    		var a = ar[k];
    		ar[k] = ar[n];
    		ar[n] = a;
    		return ar;
    	}

    	var back = function back() {
    		if (j > 0) $$invalidate(0, j = $$invalidate(0, j -= 1)); else $$invalidate(0, j);
    	};

    	var forward = function forward() {
    		if (j + 1 < cache.length) $$invalidate(0, j = $$invalidate(0, j += 1)); else $$invalidate(0, j);
    	};

    	var cache = [[1, 2, 3, 4, 5, 6, 7, 8, 9]];
    	var j = 0;

    	var ob = {
    		x: [],
    		push: function push(e) {
    			ob.x.push(parseInt(e.target.id.slice(1, 2), 10));

    			if (ob.x.length > 1) {
    				var d = exchange(ob.x[0], ob.x[1]);
    				cache.splice(j + 1, 0, d);
    				$$invalidate(1, ob.x = [], ob);
    				$$invalidate(0, j += 1);
    				return cache;
    			}
    		}
    	};

    	var code = `
  var cache = [[1,2,3,4,5,6,7,8,9]];
  var j = 0;
  var ob = {x: [], push: function push (e) {
     ob.x.push(parseInt(e.target.id.slice(1,2), 10));
     if (ob.x.length >1) {
         var d = exchange(ob.x[0], ob.x[1]);
         cache.splice(j+1,0,d);
         ob.x = [];
         j+=1;
         return cache;   var j = 0;
        }
     }
  }

   function exchange (k,n) {
      var ar = cache[j].slice();
      var a = ar[k]
      ar[k] = ar[n];
      ar[n] = a;
      return ar;
   }

   function back () {
      if (j > 0) j = j-=1;
      else j = j;
   }

   function forward () {
      if (j+1 < cache.length) j = j+=1;
      else j = j;
    }

     var cache = [[1,2,3,4,5,6,7,8,9]];
     var j = 0;
     var ob = {x: [], push: function push (e) {
        ob.x.push(parseInt(e.target.id.slice(1,2), 10));
        if (ob.x.length >1) {
            var d = exchange(ob.x[0], ob.x[1]);
            cache.splice(j+1,0,d);
            ob.x = [];
            j+=1;
            return cache;
           }
        }
     }`;

    	var html = `{#if visible}
 <div style = "font-family: Times New Roman;  text-align: center; color: hsl(210, 90%, 90%); font-size: 32px;" transition:fade>
 <br><br>
 A LITTLE SVELTE MODULE
 </div>
{/if}

                        <div style = "display: flex">
                        <div style = "margin-Left: 2%; width: 50%" >

<p> If you click any two numbers (below), they switch locations and a "BACK" button appears. If you go back and click two numbers, the result gets inserted  at your location.</p>
<br>	<button on:click={back}>
		BACK
	</button>
<br>
<br>

   <div style="text-indent:20px"><button>{ j }</button></div>
<br>
	<button on:click={forward}>
		FORWARD
	</button>
                        </div>
                     <div style = "marginRight: 2%; width: 50%; font-size: 30">
<br><br><br><br><br><p>Suck my dick</p>
<button id = m0  on:click = {ob.push} >{cache[j][0]}</button>
<button id = m1  on:click = {ob.push} >{cache[j][1]}</button>
<button id = m2  on:click = {ob.push} >{cache[j][
   2]}</button>
<br>
<br>
<button id = m3  on:click = {ob.push} >{cache[j][3]}</button>
<button id = m4  on:click = {ob.push} >{cache[j][4]}</button>
<button id = m5  on:click = {ob.push} >{cache[j][5]}</button>
<br>
<br>
<button id = m6  on:click = {ob.push} >{cache[j][6]}</button>
<button id = m7  on:click = {ob.push} >{cache[j]
   [7]}</button>
<button id = m8  on:click = {ob.push} >{cache[j][8]}</button>
</div>
</div>
<p> This is the JavaScript code inside of the script tags except for the definitions of the variables "code" and "html", which are just the code and html cut and pasted inside of back quotes: </p>
<pre>{code}</pre>
<p> And here is the HTML code: </p>
<pre>{html}</pre>
<p> Is Svelte awesome, or what? </p> `;

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("visible" in $$props) $$invalidate(2, visible = $$props.visible);
    		if ("cache" in $$props) $$invalidate(3, cache = $$props.cache);
    		if ("j" in $$props) $$invalidate(0, j = $$props.j);
    		if ("ob" in $$props) $$invalidate(1, ob = $$props.ob);
    		if ("back" in $$props) $$invalidate(4, back = $$props.back);
    		if ("forward" in $$props) $$invalidate(5, forward = $$props.forward);
    		if ("code" in $$props) $$invalidate(6, code = $$props.code);
    		if ("html" in $$props) $$invalidate(7, html = $$props.html);
    	};

    	return [j, ob, visible, cache, back, forward, code, html];
    }

    class Matrix extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Matrix",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/Transducer.svelte generated by Svelte v3.16.7 */
    const file$7 = "src/Transducer.svelte";

    // (397:0) {#if visible}
    function create_if_block$6(ctx) {
    	let div;
    	let div_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "TRANSDUCER SIMULATION";
    			set_style(div, "font-family", "Times New Roman");
    			set_style(div, "text-align", "center");
    			set_style(div, "color", "hsl(210, 90%, 90%)");
    			set_style(div, "font-size", "32px");
    			add_location(div, file$7, 397, 1, 8897);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(397:0) {#if visible}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let t0;
    	let p0;
    	let t2;
    	let p1;
    	let t4;
    	let p2;
    	let t6;
    	let p3;
    	let t8;
    	let br0;
    	let br1;
    	let t9;
    	let div0;
    	let t10;
    	let t11_value = /*transducerResult*/ ctx[6].length + "";
    	let t11;
    	let t12;
    	let br2;
    	let br3;
    	let t13;
    	let div1;
    	let t15;
    	let br4;
    	let t16;
    	let div2;
    	let t17;
    	let t18_value = /*A_A*/ ctx[2].join(", ") + "";
    	let t18;
    	let t19;
    	let t20;
    	let br5;
    	let t21;
    	let br6;
    	let t22;
    	let div3;
    	let t24;
    	let br7;
    	let t25;
    	let div4;
    	let t26;
    	let t27_value = /*B_B*/ ctx[3].join(", ") + "";
    	let t27;
    	let t28;
    	let t29;
    	let br8;
    	let t30;
    	let br9;
    	let t31;
    	let div5;
    	let t33;
    	let br10;
    	let t34;
    	let div6;
    	let t35;
    	let t36_value = /*C_C*/ ctx[4].join(", ") + "";
    	let t36;
    	let t37_1;
    	let t38;
    	let br11;
    	let t39;
    	let br12;
    	let t40;
    	let div7;
    	let t42;
    	let br13;
    	let t43;
    	let div8;
    	let t44;
    	let t45_value = /*D_D*/ ctx[5].join(", ") + "";
    	let t45;
    	let t46;
    	let t47;
    	let br14;
    	let t48;
    	let br15;
    	let t49;
    	let button0;
    	let t51;
    	let button1;
    	let t53;
    	let br16;
    	let br17;
    	let t54;
    	let div9;
    	let t55;
    	let t56;
    	let t57;
    	let br18;
    	let t58;
    	let div10;
    	let t59;
    	let t60_value = /*ar74*/ ctx[1].join(", ") + "";
    	let t60;
    	let t61;
    	let t62;
    	let br19;
    	let t63;
    	let div11;
    	let t65;
    	let pre0;
    	let t67;
    	let p4;
    	let t69;
    	let div12;
    	let t71;
    	let pre1;
    	let t73;
    	let p5;
    	let t75;
    	let div13;
    	let t77;
    	let pre2;
    	let t79;
    	let p6;
    	let t81;
    	let p7;
    	let t83;
    	let pre3;
    	let t85;
    	let p8;
    	let t87;
    	let pre4;
    	let t89;
    	let span0;
    	let t91;
    	let a;
    	let t93;
    	let span1;
    	let current;
    	let dispose;
    	let if_block = /*visible*/ ctx[7] && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			p0 = element("p");
    			p0.textContent = "The tradition JavaScript method of composing functions using mainly map, filter, and reduce dot notation (eg. \"array.map(func1).filter(func2).map(func3)\") polutes memory with arrays that are used only to compute the next array in a chain. Moreover, each of the soon-to-be useless arrays must be traversed. When arrays are large and numerous functions are involved, this can be a performance bottleneck.";
    			t2 = space();
    			p1 = element("p");
    			p1.textContent = "Transducers provide an ingenious solution to the problem. Any JavaScript developer who hasn't already done so would do well to get a good night's sleep, drink a big cup of coffee, and wrap his or her head around the transducer algorithm.";
    			t4 = space();
    			p2 = element("p");
    			p2.textContent = "Another, more straightforward one-array-traversal solution is to use monads. This post shows the result of an array being traversed only one time and, with the help of a monad, undersoing multiple transformations by a collection of functions. The result is the same result obtained by the dot method and a standard transducer.";
    			t6 = space();
    			p3 = element("p");
    			p3.textContent = "The following results were obtained by eight transformations on an array of the first 100 integers:";
    			t8 = space();
    			br0 = element("br");
    			br1 = element("br");
    			t9 = space();
    			div0 = element("div");
    			t10 = text("Result length is ");
    			t11 = text(t11_value);
    			t12 = space();
    			br2 = element("br");
    			br3 = element("br");
    			t13 = space();
    			div1 = element("div");
    			div1.textContent = "Traditional dot composition";
    			t15 = space();
    			br4 = element("br");
    			t16 = space();
    			div2 = element("div");
    			t17 = text("[");
    			t18 = text(t18_value);
    			t19 = text("]");
    			t20 = space();
    			br5 = element("br");
    			t21 = space();
    			br6 = element("br");
    			t22 = space();
    			div3 = element("div");
    			div3.textContent = "Composition in two stages using Monad";
    			t24 = space();
    			br7 = element("br");
    			t25 = space();
    			div4 = element("div");
    			t26 = text("[");
    			t27 = text(t27_value);
    			t28 = text("]");
    			t29 = space();
    			br8 = element("br");
    			t30 = space();
    			br9 = element("br");
    			t31 = space();
    			div5 = element("div");
    			div5.textContent = "Composition in one traversal using Monad";
    			t33 = space();
    			br10 = element("br");
    			t34 = space();
    			div6 = element("div");
    			t35 = text("[");
    			t36 = text(t36_value);
    			t37_1 = text("]");
    			t38 = space();
    			br11 = element("br");
    			t39 = space();
    			br12 = element("br");
    			t40 = space();
    			div7 = element("div");
    			div7.textContent = "Composition using a standard transducer";
    			t42 = space();
    			br13 = element("br");
    			t43 = space();
    			div8 = element("div");
    			t44 = text("[");
    			t45 = text(t45_value);
    			t46 = text("]");
    			t47 = space();
    			br14 = element("br");
    			t48 = space();
    			br15 = element("br");
    			t49 = space();
    			button0 = element("button");
    			button0.textContent = "INCREASE";
    			t51 = space();
    			button1 = element("button");
    			button1.textContent = "DECREASE";
    			t53 = space();
    			br16 = element("br");
    			br17 = element("br");
    			t54 = space();
    			div9 = element("div");
    			t55 = text("Array length: ");
    			t56 = text(/*size*/ ctx[0]);
    			t57 = space();
    			br18 = element("br");
    			t58 = space();
    			div10 = element("div");
    			t59 = text("ar74: [");
    			t60 = text(t60_value);
    			t61 = text("]");
    			t62 = space();
    			br19 = element("br");
    			t63 = space();
    			div11 = element("div");
    			div11.textContent = "The modified Monad (below) could benefit from some refactoring, but it does what needs to be done for this demo. The point is that a standard transducer and Monad both use one array traversal to accomplish what the built-in dot method does by traversing the original array and seven intermediary arrays.";
    			t65 = space();
    			pre0 = element("pre");
    			pre0.textContent = `${/*mon44*/ ctx[8]}`;
    			t67 = space();
    			p4 = element("p");
    			p4.textContent = "On my desktop computer, when ar74.length === 100,000 I got this and similar results:";
    			t69 = space();
    			div12 = element("div");
    			div12.textContent = "ar74.length = 100,000:";
    			t71 = space();
    			pre1 = element("pre");
    			pre1.textContent = "Dot method:: 25 ms\nMonad two traversals: 255 ms\nMonad one traversal: 220 ms\nTransducer: 26 ms";
    			t73 = space();
    			p5 = element("p");
    			p5.textContent = "ar74.length === 1,000,000 was about as far as I could go without crashing the browser. Here are two typical results:";
    			t75 = space();
    			div13 = element("div");
    			div13.textContent = "Two runs with ar74.length = 1,000,000:";
    			t77 = space();
    			pre2 = element("pre");
    			pre2.textContent = "Dot method:: 276\nMonad two traversals: 2140\nMonad one traversal: 2060\nTransducer: 180\n\nDot method:: 312\nMonad two traversals: 2093\nMonad one traversal: 2115\nTransducer: 176";
    			t79 = space();
    			p6 = element("p");
    			p6.textContent = "As you see, the built-in JavaScript dot method and the transducer gave similar results. The Monad methods are much slower. They're just a proof-of-concept hacks showing the versitility of monads spawned by Monad().";
    			t81 = space();
    			p7 = element("p");
    			p7.textContent = "Here's the definition of the increase button's callback function along with the definitions of some assoc some supportingrelated:";
    			t83 = space();
    			pre3 = element("pre");
    			pre3.textContent = `${/*callback*/ ctx[9]}`;
    			t85 = space();
    			p8 = element("p");
    			p8.textContent = "And here's some of the code behind the transducer demonstration:";
    			t87 = space();
    			pre4 = element("pre");
    			pre4.textContent = `${/*call2*/ ctx[10]}`;
    			t89 = space();
    			span0 = element("span");
    			span0.textContent = "The rest of the code can be found in the";
    			t91 = space();
    			a = element("a");
    			a.textContent = "Github repository";
    			t93 = space();
    			span1 = element("span");
    			span1.textContent = ".";
    			add_location(p0, file$7, 402, 0, 9061);
    			add_location(p1, file$7, 403, 0, 9472);
    			add_location(p2, file$7, 404, 0, 9718);
    			add_location(p3, file$7, 405, 0, 10053);
    			add_location(br0, file$7, 406, 0, 10161);
    			add_location(br1, file$7, 406, 4, 10165);
    			add_location(div0, file$7, 407, 0, 10170);
    			add_location(br2, file$7, 408, 0, 10224);
    			add_location(br3, file$7, 408, 4, 10228);
    			attr_dev(div1, "class", "p svelte-1d81q6r");
    			add_location(div1, file$7, 409, 0, 10233);
    			add_location(br4, file$7, 410, 0, 10284);
    			attr_dev(div2, "class", "q svelte-1d81q6r");
    			add_location(div2, file$7, 411, 0, 10289);
    			add_location(br5, file$7, 412, 0, 10330);
    			add_location(br6, file$7, 413, 0, 10335);
    			attr_dev(div3, "class", "p svelte-1d81q6r");
    			add_location(div3, file$7, 414, 0, 10340);
    			add_location(br7, file$7, 415, 0, 10401);
    			attr_dev(div4, "class", "q svelte-1d81q6r");
    			add_location(div4, file$7, 416, 0, 10406);
    			add_location(br8, file$7, 417, 0, 10448);
    			add_location(br9, file$7, 418, 0, 10453);
    			attr_dev(div5, "class", "p svelte-1d81q6r");
    			add_location(div5, file$7, 419, 0, 10458);
    			add_location(br10, file$7, 420, 0, 10522);
    			attr_dev(div6, "class", "q svelte-1d81q6r");
    			add_location(div6, file$7, 421, 0, 10527);
    			add_location(br11, file$7, 422, 0, 10569);
    			add_location(br12, file$7, 423, 0, 10574);
    			attr_dev(div7, "class", "p svelte-1d81q6r");
    			add_location(div7, file$7, 424, 0, 10579);
    			add_location(br13, file$7, 425, 0, 10642);
    			attr_dev(div8, "class", "q svelte-1d81q6r");
    			add_location(div8, file$7, 426, 0, 10647);
    			add_location(br14, file$7, 427, 0, 10689);
    			add_location(br15, file$7, 428, 0, 10694);
    			attr_dev(button0, "class", "but");
    			add_location(button0, file$7, 429, 0, 10699);
    			attr_dev(button1, "class", "but");
    			add_location(button1, file$7, 430, 0, 10759);
    			add_location(br16, file$7, 431, 0, 10819);
    			add_location(br17, file$7, 431, 4, 10823);
    			add_location(div9, file$7, 432, 0, 10828);
    			add_location(br18, file$7, 433, 0, 10860);
    			add_location(div10, file$7, 434, 0, 10865);
    			add_location(br19, file$7, 435, 0, 10902);
    			add_location(div11, file$7, 436, 0, 10907);
    			add_location(pre0, file$7, 437, 0, 11223);
    			add_location(p4, file$7, 438, 0, 11242);
    			set_style(div12, "color", "#BBFFBB");
    			add_location(div12, file$7, 439, 0, 11336);
    			add_location(pre1, file$7, 441, 0, 11396);
    			add_location(p5, file$7, 445, 0, 11502);
    			set_style(div13, "color", "#BBFFBB");
    			add_location(div13, file$7, 447, 0, 11629);
    			add_location(pre2, file$7, 449, 0, 11705);
    			add_location(p6, file$7, 458, 0, 11890);
    			add_location(p7, file$7, 459, 0, 12114);
    			add_location(pre3, file$7, 460, 0, 12253);
    			add_location(p8, file$7, 461, 0, 12275);
    			add_location(pre4, file$7, 462, 0, 12349);
    			add_location(span0, file$7, 463, 0, 12368);
    			attr_dev(a, "href", "https://github.com/dschalk/blog");
    			add_location(a, file$7, 464, 0, 12424);
    			add_location(span1, file$7, 465, 0, 12490);

    			dispose = [
    				listen_dev(button0, "click", /*increase*/ ctx[11], false, false, false),
    				listen_dev(button1, "click", /*decrease*/ ctx[12], false, false, false)
    			];
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, p2, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, p3, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, br0, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t10);
    			append_dev(div0, t11);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, br2, anchor);
    			insert_dev(target, br3, anchor);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, div1, anchor);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, br4, anchor);
    			insert_dev(target, t16, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, t17);
    			append_dev(div2, t18);
    			append_dev(div2, t19);
    			insert_dev(target, t20, anchor);
    			insert_dev(target, br5, anchor);
    			insert_dev(target, t21, anchor);
    			insert_dev(target, br6, anchor);
    			insert_dev(target, t22, anchor);
    			insert_dev(target, div3, anchor);
    			insert_dev(target, t24, anchor);
    			insert_dev(target, br7, anchor);
    			insert_dev(target, t25, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, t26);
    			append_dev(div4, t27);
    			append_dev(div4, t28);
    			insert_dev(target, t29, anchor);
    			insert_dev(target, br8, anchor);
    			insert_dev(target, t30, anchor);
    			insert_dev(target, br9, anchor);
    			insert_dev(target, t31, anchor);
    			insert_dev(target, div5, anchor);
    			insert_dev(target, t33, anchor);
    			insert_dev(target, br10, anchor);
    			insert_dev(target, t34, anchor);
    			insert_dev(target, div6, anchor);
    			append_dev(div6, t35);
    			append_dev(div6, t36);
    			append_dev(div6, t37_1);
    			insert_dev(target, t38, anchor);
    			insert_dev(target, br11, anchor);
    			insert_dev(target, t39, anchor);
    			insert_dev(target, br12, anchor);
    			insert_dev(target, t40, anchor);
    			insert_dev(target, div7, anchor);
    			insert_dev(target, t42, anchor);
    			insert_dev(target, br13, anchor);
    			insert_dev(target, t43, anchor);
    			insert_dev(target, div8, anchor);
    			append_dev(div8, t44);
    			append_dev(div8, t45);
    			append_dev(div8, t46);
    			insert_dev(target, t47, anchor);
    			insert_dev(target, br14, anchor);
    			insert_dev(target, t48, anchor);
    			insert_dev(target, br15, anchor);
    			insert_dev(target, t49, anchor);
    			insert_dev(target, button0, anchor);
    			insert_dev(target, t51, anchor);
    			insert_dev(target, button1, anchor);
    			insert_dev(target, t53, anchor);
    			insert_dev(target, br16, anchor);
    			insert_dev(target, br17, anchor);
    			insert_dev(target, t54, anchor);
    			insert_dev(target, div9, anchor);
    			append_dev(div9, t55);
    			append_dev(div9, t56);
    			insert_dev(target, t57, anchor);
    			insert_dev(target, br18, anchor);
    			insert_dev(target, t58, anchor);
    			insert_dev(target, div10, anchor);
    			append_dev(div10, t59);
    			append_dev(div10, t60);
    			append_dev(div10, t61);
    			insert_dev(target, t62, anchor);
    			insert_dev(target, br19, anchor);
    			insert_dev(target, t63, anchor);
    			insert_dev(target, div11, anchor);
    			insert_dev(target, t65, anchor);
    			insert_dev(target, pre0, anchor);
    			insert_dev(target, t67, anchor);
    			insert_dev(target, p4, anchor);
    			insert_dev(target, t69, anchor);
    			insert_dev(target, div12, anchor);
    			insert_dev(target, t71, anchor);
    			insert_dev(target, pre1, anchor);
    			insert_dev(target, t73, anchor);
    			insert_dev(target, p5, anchor);
    			insert_dev(target, t75, anchor);
    			insert_dev(target, div13, anchor);
    			insert_dev(target, t77, anchor);
    			insert_dev(target, pre2, anchor);
    			insert_dev(target, t79, anchor);
    			insert_dev(target, p6, anchor);
    			insert_dev(target, t81, anchor);
    			insert_dev(target, p7, anchor);
    			insert_dev(target, t83, anchor);
    			insert_dev(target, pre3, anchor);
    			insert_dev(target, t85, anchor);
    			insert_dev(target, p8, anchor);
    			insert_dev(target, t87, anchor);
    			insert_dev(target, pre4, anchor);
    			insert_dev(target, t89, anchor);
    			insert_dev(target, span0, anchor);
    			insert_dev(target, t91, anchor);
    			insert_dev(target, a, anchor);
    			insert_dev(target, t93, anchor);
    			insert_dev(target, span1, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty[0] & /*transducerResult*/ 64) && t11_value !== (t11_value = /*transducerResult*/ ctx[6].length + "")) set_data_dev(t11, t11_value);
    			if ((!current || dirty[0] & /*A_A*/ 4) && t18_value !== (t18_value = /*A_A*/ ctx[2].join(", ") + "")) set_data_dev(t18, t18_value);
    			if ((!current || dirty[0] & /*B_B*/ 8) && t27_value !== (t27_value = /*B_B*/ ctx[3].join(", ") + "")) set_data_dev(t27, t27_value);
    			if ((!current || dirty[0] & /*C_C*/ 16) && t36_value !== (t36_value = /*C_C*/ ctx[4].join(", ") + "")) set_data_dev(t36, t36_value);
    			if ((!current || dirty[0] & /*D_D*/ 32) && t45_value !== (t45_value = /*D_D*/ ctx[5].join(", ") + "")) set_data_dev(t45, t45_value);
    			if (!current || dirty[0] & /*size*/ 1) set_data_dev(t56, /*size*/ ctx[0]);
    			if ((!current || dirty[0] & /*ar74*/ 2) && t60_value !== (t60_value = /*ar74*/ ctx[1].join(", ") + "")) set_data_dev(t60, t60_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(p3);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(br2);
    			if (detaching) detach_dev(br3);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(br4);
    			if (detaching) detach_dev(t16);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t20);
    			if (detaching) detach_dev(br5);
    			if (detaching) detach_dev(t21);
    			if (detaching) detach_dev(br6);
    			if (detaching) detach_dev(t22);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t24);
    			if (detaching) detach_dev(br7);
    			if (detaching) detach_dev(t25);
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t29);
    			if (detaching) detach_dev(br8);
    			if (detaching) detach_dev(t30);
    			if (detaching) detach_dev(br9);
    			if (detaching) detach_dev(t31);
    			if (detaching) detach_dev(div5);
    			if (detaching) detach_dev(t33);
    			if (detaching) detach_dev(br10);
    			if (detaching) detach_dev(t34);
    			if (detaching) detach_dev(div6);
    			if (detaching) detach_dev(t38);
    			if (detaching) detach_dev(br11);
    			if (detaching) detach_dev(t39);
    			if (detaching) detach_dev(br12);
    			if (detaching) detach_dev(t40);
    			if (detaching) detach_dev(div7);
    			if (detaching) detach_dev(t42);
    			if (detaching) detach_dev(br13);
    			if (detaching) detach_dev(t43);
    			if (detaching) detach_dev(div8);
    			if (detaching) detach_dev(t47);
    			if (detaching) detach_dev(br14);
    			if (detaching) detach_dev(t48);
    			if (detaching) detach_dev(br15);
    			if (detaching) detach_dev(t49);
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t51);
    			if (detaching) detach_dev(button1);
    			if (detaching) detach_dev(t53);
    			if (detaching) detach_dev(br16);
    			if (detaching) detach_dev(br17);
    			if (detaching) detach_dev(t54);
    			if (detaching) detach_dev(div9);
    			if (detaching) detach_dev(t57);
    			if (detaching) detach_dev(br18);
    			if (detaching) detach_dev(t58);
    			if (detaching) detach_dev(div10);
    			if (detaching) detach_dev(t62);
    			if (detaching) detach_dev(br19);
    			if (detaching) detach_dev(t63);
    			if (detaching) detach_dev(div11);
    			if (detaching) detach_dev(t65);
    			if (detaching) detach_dev(pre0);
    			if (detaching) detach_dev(t67);
    			if (detaching) detach_dev(p4);
    			if (detaching) detach_dev(t69);
    			if (detaching) detach_dev(div12);
    			if (detaching) detach_dev(t71);
    			if (detaching) detach_dev(pre1);
    			if (detaching) detach_dev(t73);
    			if (detaching) detach_dev(p5);
    			if (detaching) detach_dev(t75);
    			if (detaching) detach_dev(div13);
    			if (detaching) detach_dev(t77);
    			if (detaching) detach_dev(pre2);
    			if (detaching) detach_dev(t79);
    			if (detaching) detach_dev(p6);
    			if (detaching) detach_dev(t81);
    			if (detaching) detach_dev(p7);
    			if (detaching) detach_dev(t83);
    			if (detaching) detach_dev(pre3);
    			if (detaching) detach_dev(t85);
    			if (detaching) detach_dev(p8);
    			if (detaching) detach_dev(t87);
    			if (detaching) detach_dev(pre4);
    			if (detaching) detach_dev(t89);
    			if (detaching) detach_dev(span0);
    			if (detaching) detach_dev(t91);
    			if (detaching) detach_dev(a);
    			if (detaching) detach_dev(t93);
    			if (detaching) detach_dev(span1);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function tdMap(func) {
    	return function (reducingFunction) {
    		return (accumulator, v) => {
    			return reducingFunction(accumulator, func(v));
    		};
    	};
    }

    function tdFilter(test) {
    	return function (reducingFunction) {
    		return (accumulator, v) => {
    			return test(v) ? reducingFunction(accumulator, v) : accumulator;
    		};
    	};
    }

    function Monad$1(AR = []) {
    	var p, run;
    	var ar = AR.slice();
    	var x = ar.pop();

    	return run = (function run(x) {
    		if (x === null || x === NaN || x === undefined) x = f_("stop").pop();

    		if (x instanceof Filt) {
    			var z = ar.pop();
    			if (x.filt(z)) x = z; else ar = [];
    		} else if (x instanceof Promise) x.then(y => {
    			if (y != undefined && typeof y !== "boolean" && y === y && y.name !== "f_" && y.name !== "stop") {
    				ar.push(y);
    			}
    		}); else if (x != undefined && x === x && x !== false && x.name !== "f_" && x.name !== "stop") {
    			ar.push(x);
    		}

    		

    		function f_(func) {
    			if (func === "stop" || func === "S") return ar; else if (func === "finish" || func === "F") return Object.freeze(ar); else if (typeof func !== "function") p = func; else if (x instanceof Promise) p = x.then(v => func(v)); else p = func(x);
    			return run(p);
    		}

    		
    		return f_;
    	})(x);
    }

    function concat(xs, val) {
    	return xs.concat(val);
    }

    function mapping(f) {
    	return function (rf) {
    		return (acc, val) => {
    			return rf(acc, f(val));
    		};
    	};
    }

    function Filt(p) {
    	this.p = p;

    	this.filt = function filt(x) {
    		return p(x);
    	};
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let visible = true;
    	var k = 100000000;
    	var ltTest = x => y => new Filt(x => y < x);

    	var isOdd = function isOdd(x) {
    		return new Filt(v => v % 2 === 1);
    	};

    	var _fives = function _fives(x) {
    		if (typeof x === "number") {
    			return new Filt(v => v % 10 === 5);
    		} else if (typeof x === "string") {
    			return Filt(v = v(v.length - 1));
    		} else {
    			return undefined;
    		}
    	};

    	var fives = function fives(x) {
    		return new Filt(v => v % 10 === 5);
    	};

    	var isOddF = function isOddF(x) {
    		return new Filt(v => v % 2 === 1);
    	};

    	
    	var lessThan = x => y => new Filt(x => y < x);
    	
    	var ar = "cowgirl";

    	var cleanF = function cleanF(arthur = []) {
    		$$invalidate(13, ar = arthur);
    		return ar.filter(a => a === 0 || a && typeof a !== "boolean").reduce((a, b) => a.concat(b), []);
    	};

    	var mon44 = `function Monad ( AR = [] )  {
  var f_, p, run;
  var ar = AR.slice();
  var x = ar.pop();
  return run = (function run (x) {
    if (x === null || x === NaN ||
      x === undefined) x = f_('stop').pop();
    if (x instanceof Filt) {
      var z = ar.pop();
      if (x.filt(z)) x = z; else ar = [];
    }
    else if (x instanceof Promise) x.then(y =>
      {if (y != undefined && typeof y !== "boolean" && y === y &&
      y.name !== "f_" &&
      y.name !== "stop" ) {
      ar.push(y);
    }})
    else if (x != undefined && x === x  && x !== false
      && x.name !== "f_" && x.name !== "stop" ) {
      ar.push(x);
    };
    function f_ (func) {
      if (func === 'stop' || func === 'S') return ar;
      else if (func === 'finish' || func === 'F') return Object.freeze(ar);
      else if (typeof func !== "function") p = func;
      else if (x instanceof Promise) p = x.then(v => func(v));
      else p = func(x);
      return run(p);
    };

    return f_;
  })(x)
} `;

    	var compose = (...fns) => fns.reduceRight((prevFn, nextFn) => (...args) => nextFn(prevFn(...args)), value => value);

    	var add1 = function add1(v) {
    		return v + 1;
    	};

    	var sum = function sum(total, v) {
    		return total + v;
    	};

    	var cube = function cube(v) {
    		return v ** 3;
    	};

    	var size = 400;
    	var ar74 = [...Array(size).keys()];
    	var mapWRf = mapping(cube);
    	var mapRes = ar74.reduce(mapWRf(concat), []);
    	var isEven = x => x % 2 === 0;
    	var not = x => !x;
    	var isOdd2 = compose(not, isEven);
    	var map = f => ar => ar.map(v => f(v));
    	var filter = p => ar => ar.filter(p);
    	var reduce = f => ar => v => ar.reduce(f, v);
    	var A_A = "H";
    	var B_B = "s";
    	var C_C = "G";
    	var D_D = "I";
    	var res1;
    	var res2;
    	var res3;
    	var res4;
    	var dotResult = [];
    	var test9;
    	var transducerResult;
    	A_A = dotResult = ar74.filter(v => v % 2 === 1).map(x => x ** 4).map(x => x + 3).map(x => x - 3).filter(v => v % 10 === 5).map(x => Math.sqrt(x)).map(v => v * v).map(v => v + 1000);
    	var td3;
    	var xform;
    	var xform2;
    	var xform3;
    	var test8 = k => ltTest(k).filt;
    	
    	var test9;
    	

    	var fives = function fives(x) {
    		return new Filt(v => v % 10 === 5);
    	};

    	var td1 = x => Monad$1([x])(isOdd)(v => v ** 4)(v => v + 3)(v => v - 3)(fives)(Math.sqrt)("stop").pop();
    	var td2 = y => Monad$1([y])(v => v * v)(v => v + 1000)("stop").pop();
    	res1 = ar74.map(x => td1(x));
    	B_B = res2 = res1.map(y => td2(y));
    	C_C = res3 = ar74.map(z => td2(td1(z)));
    	xform = compose(tdFilter(x => x % 2 === 1), tdMap(x => x ** 4), tdMap(x => x + 3), tdMap(x => x - 3), tdFilter(x => x % 10 === 5), tdMap(x => Math.sqrt(x)));
    	xform2 = compose(tdMap(x => x * x), tdMap(x => x + 1000));
    	xform3 = compose(tdFilter(x => x % 2 === 1), tdMap(x => x ** 4), tdMap(x => x + 3), tdMap(x => x - 3), tdFilter(x => x % 10 === 5), tdMap(x => Math.sqrt(x)), tdMap(x => x * x), tdMap(x => x + 1000));
    	D_D = transducerResult = ar74.reduce(xform3(concat), []);
    	var t37;

    	

    	var callback = `function increase () {
  size = size + 10;
  ar74 = [...Array(size).keys()];
   A_A = dotResult = ar74
   .filter(v => (v % 2 === 1))
   .map(x => x**4)
   .map(x => x+3)
   .map(x => x-3)
   .filter(v => v % 10 === 5)
   .map(x => Math.sqrt(x))
   .map(v=>v*v)
  res1 = ar74.map(x => td1(x));
  B_B = res2 = res1.map(y => td2(y));
  C_C = res3 = ar74.map(z => td2(td1(z)));
  D_D = transducerResult = ar74.reduce(xform3(concat),[] );
}

  function Filt (p) {this.p = p; this.filt = function filt (x) {return p(x)}};
  var fives = function fives (x) {return new Filt(v => v % 10 === 5)}
  var isOdd = function isOdd (x) {return new Filt(v => v % 2 === 1)};

  var td1 = x => Monad([x])(isOdd)(v=>v**4)(v=>v+3)
    (v=>v-3)(fives)(Math.sqrt)('stop').pop()
  res1 = ar74.map(x => td1(x));
  var td2 = y => Monad([y])(v=>v*v)(v=>v+1000)('stop').pop()`;

    	var call2 = `xform3 = compose(
    tdFilter(x=>x%2===1),
    tdMap(x => x**4),
    tdMap(x => x+3),
    tdMap(x => x-3),
    tdFilter(x => x % 10 === 5),
    tdMap(x => Math.sqrt(x)),
    tdMap(x=>x*x),
    tdMap(x=>x+1000)
  );

  function tdMap(func) {
    return function(reducingFunction) {
      return (accumulator, v) => {
        return reducingFunction(accumulator, func(v));
      }
    }
  }

  function tdFilter(test) {
    return function(reducingFunction) {
      return (accumulator, v) => {
        return (test(v) ? reducingFunction(accumulator, v) : accumulator)
      };
    };
  }; `;

    	function increase() {
    		$$invalidate(0, size = size + 10);
    		$$invalidate(1, ar74 = [...Array(size).keys()]);
    		res1 = ar74.map(x => td1(x));
    		$$invalidate(2, A_A = $$invalidate(17, dotResult = ar74.filter(v => v % 2 === 1).map(x => x ** 4).map(x => x + 3).map(x => x - 3).filter(v => v % 10 === 5).map(x => Math.sqrt(x)).map(v => v * v).map(v => v + 1000)));
    		$$invalidate(3, B_B = $$invalidate(15, res2 = res1.map(y => td2(y))));
    		$$invalidate(4, C_C = $$invalidate(16, res3 = ar74.map(z => td2(td1(z)))));
    		$$invalidate(5, D_D = $$invalidate(6, transducerResult = ar74.reduce(xform3(concat), [])));
    	}

    	function decrease() {
    		$$invalidate(0, size = size - 10);
    		$$invalidate(1, ar74 = [...Array(size).keys()]);
    		res1 = ar74.map(x => td1(x));
    		$$invalidate(2, A_A = $$invalidate(17, dotResult = ar74.filter(v => v % 2 === 1).map(x => x ** 4).map(x => x + 3).map(x => x - 3).filter(v => v % 10 === 5).map(x => Math.sqrt(x)).map(v => v * v).map(v => v + 1000)));
    		$$invalidate(3, B_B = $$invalidate(15, res2 = res1.map(y => td2(y))));
    		$$invalidate(4, C_C = $$invalidate(16, res3 = ar74.map(z => td2(td1(z)))));
    		$$invalidate(5, D_D = $$invalidate(6, transducerResult = ar74.reduce(xform3(concat), [])));
    	}

    	increase();
    	decrease();

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("visible" in $$props) $$invalidate(7, visible = $$props.visible);
    		if ("k" in $$props) $$invalidate(22, k = $$props.k);
    		if ("ltTest" in $$props) $$invalidate(23, ltTest = $$props.ltTest);
    		if ("isOdd" in $$props) isOdd = $$props.isOdd;
    		if ("_fives" in $$props) _fives = $$props._fives;
    		if ("fives" in $$props) fives = $$props.fives;
    		if ("isOddF" in $$props) isOddF = $$props.isOddF;
    		if ("lessThan" in $$props) lessThan = $$props.lessThan;
    		if ("ar" in $$props) $$invalidate(13, ar = $$props.ar);
    		if ("cleanF" in $$props) $$invalidate(29, cleanF = $$props.cleanF);
    		if ("mon44" in $$props) $$invalidate(8, mon44 = $$props.mon44);
    		if ("compose" in $$props) compose = $$props.compose;
    		if ("add1" in $$props) add1 = $$props.add1;
    		if ("sum" in $$props) sum = $$props.sum;
    		if ("cube" in $$props) cube = $$props.cube;
    		if ("size" in $$props) $$invalidate(0, size = $$props.size);
    		if ("ar74" in $$props) $$invalidate(1, ar74 = $$props.ar74);
    		if ("mapWRf" in $$props) mapWRf = $$props.mapWRf;
    		if ("mapRes" in $$props) mapRes = $$props.mapRes;
    		if ("isEven" in $$props) isEven = $$props.isEven;
    		if ("not" in $$props) not = $$props.not;
    		if ("isOdd2" in $$props) isOdd2 = $$props.isOdd2;
    		if ("map" in $$props) map = $$props.map;
    		if ("filter" in $$props) filter = $$props.filter;
    		if ("reduce" in $$props) reduce = $$props.reduce;
    		if ("A_A" in $$props) $$invalidate(2, A_A = $$props.A_A);
    		if ("B_B" in $$props) $$invalidate(3, B_B = $$props.B_B);
    		if ("C_C" in $$props) $$invalidate(4, C_C = $$props.C_C);
    		if ("D_D" in $$props) $$invalidate(5, D_D = $$props.D_D);
    		if ("res1" in $$props) res1 = $$props.res1;
    		if ("res2" in $$props) $$invalidate(15, res2 = $$props.res2);
    		if ("res3" in $$props) $$invalidate(16, res3 = $$props.res3);
    		if ("res4" in $$props) $$invalidate(42, res4 = $$props.res4);
    		if ("dotResult" in $$props) $$invalidate(17, dotResult = $$props.dotResult);
    		if ("test9" in $$props) $$invalidate(43, test9 = $$props.test9);
    		if ("transducerResult" in $$props) $$invalidate(6, transducerResult = $$props.transducerResult);
    		if ("td3" in $$props) $$invalidate(44, td3 = $$props.td3);
    		if ("xform" in $$props) $$invalidate(18, xform = $$props.xform);
    		if ("xform2" in $$props) $$invalidate(19, xform2 = $$props.xform2);
    		if ("xform3" in $$props) $$invalidate(20, xform3 = $$props.xform3);
    		if ("test8" in $$props) test8 = $$props.test8;
    		if ("td1" in $$props) td1 = $$props.td1;
    		if ("td2" in $$props) td2 = $$props.td2;
    		if ("t37" in $$props) $$invalidate(21, t37 = $$props.t37);
    		if ("callback" in $$props) $$invalidate(9, callback = $$props.callback);
    		if ("call2" in $$props) $$invalidate(10, call2 = $$props.call2);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*ar*/ 8192) ;

    		if ($$self.$$.dirty[0] & /*size*/ 1) ;

    		if ($$self.$$.dirty[0] & /*ar74*/ 2) ;

    		if ($$self.$$.dirty[0] & /*dotResult*/ 131072) {
    			 $$invalidate(2, A_A = dotResult);
    		}

    		if ($$self.$$.dirty[0] & /*A_A*/ 4) ;

    		if ($$self.$$.dirty[0] & /*res2*/ 32768) {
    			 $$invalidate(3, B_B = cleanF(res2));
    		}

    		if ($$self.$$.dirty[0] & /*B_B*/ 8) ;

    		if ($$self.$$.dirty[0] & /*res3*/ 65536) {
    			 $$invalidate(4, C_C = cleanF(res3));
    		}

    		if ($$self.$$.dirty[0] & /*C_C*/ 16) ;

    		if ($$self.$$.dirty[0] & /*ar74, xform3*/ 1048578) {
    			 $$invalidate(6, transducerResult = ar74.reduce(xform3(concat), []));
    		}

    		if ($$self.$$.dirty[0] & /*transducerResult*/ 64) {
    			 $$invalidate(5, D_D = transducerResult);
    		}

    		if ($$self.$$.dirty[0] & /*D_D*/ 32) ;

    		if ($$self.$$.dirty[0] & /*res3*/ 65536) ;

    		if ($$self.$$.dirty[0] & /*dotResult*/ 131072) ;

    		if ($$self.$$.dirty[0] & /*transducerResult*/ 64) ;

    		if ($$self.$$.dirty[0] & /*xform*/ 262144) ;

    		if ($$self.$$.dirty[0] & /*xform2*/ 524288) ;

    		if ($$self.$$.dirty[0] & /*xform3*/ 1048576) ;

    		if ($$self.$$.dirty[0] & /*t37*/ 2097152) ;

    		if ($$self.$$.dirty[0] & /*dotResult*/ 131072) ;

    		if ($$self.$$.dirty[0] & /*res2*/ 32768) ;

    		if ($$self.$$.dirty[0] & /*res3*/ 65536) ;

    		if ($$self.$$.dirty[0] & /*transducerResult*/ 64) ;

    		if ($$self.$$.dirty[0] & /*size*/ 1) ;

    		if ($$self.$$.dirty[0] & /*ar74*/ 2) ;
    	};

    	return [
    		size,
    		ar74,
    		A_A,
    		B_B,
    		C_C,
    		D_D,
    		transducerResult,
    		visible,
    		mon44,
    		callback,
    		call2,
    		increase,
    		decrease
    	];
    }

    class Transducer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {}, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Transducer",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/ToggleClass.svelte generated by Svelte v3.16.7 */

    const file$8 = "src/ToggleClass.svelte";

    function create_fragment$8(ctx) {
    	let p;
    	let t0_value = /*num*/ ctx[0] + 1 + "";
    	let t0;
    	let t1;
    	let span;
    	let t3;
    	let input;
    	let t4;
    	let button0;
    	let t6;
    	let button1;
    	let t8;
    	let button2;
    	let dispose;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			span = element("span");
    			span.textContent = "Seconds modulo";
    			t3 = space();
    			input = element("input");
    			t4 = space();
    			button0 = element("button");
    			button0.textContent = "foo";
    			t6 = space();
    			button1 = element("button");
    			button1.textContent = "bar";
    			t8 = space();
    			button2 = element("button");
    			button2.textContent = "baz";
    			add_location(p, file$8, 33, 0, 440);
    			add_location(span, file$8, 34, 1, 457);
    			attr_dev(input, "class", "svelte-o4l4cy");
    			add_location(input, file$8, 35, 0, 486);
    			attr_dev(button0, "class", "svelte-o4l4cy");
    			toggle_class(button0, "active", /*current*/ ctx[2] === "foo");
    			add_location(button0, file$8, 37, 0, 516);
    			attr_dev(button1, "class", "svelte-o4l4cy");
    			toggle_class(button1, "active", /*current*/ ctx[2] === "bar");
    			add_location(button1, file$8, 42, 0, 607);
    			attr_dev(button2, "class", "svelte-o4l4cy");
    			toggle_class(button2, "active", /*current*/ ctx[2] === "baz");
    			add_location(button2, file$8, 47, 0, 698);

    			dispose = [
    				listen_dev(input, "input", /*input_input_handler*/ ctx[3]),
    				listen_dev(button0, "click", /*click_handler*/ ctx[4], false, false, false),
    				listen_dev(button1, "click", /*click_handler_1*/ ctx[5], false, false, false),
    				listen_dev(button2, "click", /*click_handler_2*/ ctx[6], false, false, false)
    			];
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, span, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*mod*/ ctx[1]);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, button0, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, button1, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, button2, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*num*/ 1 && t0_value !== (t0_value = /*num*/ ctx[0] + 1 + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*mod*/ 2 && input.value !== /*mod*/ ctx[1]) {
    				set_input_value(input, /*mod*/ ctx[1]);
    			}

    			if (dirty & /*current*/ 4) {
    				toggle_class(button0, "active", /*current*/ ctx[2] === "foo");
    			}

    			if (dirty & /*current*/ 4) {
    				toggle_class(button1, "active", /*current*/ ctx[2] === "bar");
    			}

    			if (dirty & /*current*/ 4) {
    				toggle_class(button2, "active", /*current*/ ctx[2] === "baz");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(span);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(input);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(button1);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(button2);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let current = "foo";
    	let { num } = $$props;
    	let { mod } = $$props;
    	num = 0;
    	mod = 5;

    	setInterval(
    		() => {
    			if (mod) $$invalidate(0, num = $$invalidate(0, num += 1) % mod);
    		},
    		1000
    	);

    	const writable_props = ["num", "mod"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ToggleClass> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		mod = this.value;
    		$$invalidate(1, mod);
    	}

    	const click_handler = () => $$invalidate(2, current = "foo");
    	const click_handler_1 = () => $$invalidate(2, current = "bar");
    	const click_handler_2 = () => $$invalidate(2, current = "baz");

    	$$self.$set = $$props => {
    		if ("num" in $$props) $$invalidate(0, num = $$props.num);
    		if ("mod" in $$props) $$invalidate(1, mod = $$props.mod);
    	};

    	$$self.$capture_state = () => {
    		return { current, num, mod };
    	};

    	$$self.$inject_state = $$props => {
    		if ("current" in $$props) $$invalidate(2, current = $$props.current);
    		if ("num" in $$props) $$invalidate(0, num = $$props.num);
    		if ("mod" in $$props) $$invalidate(1, mod = $$props.mod);
    	};

    	return [
    		num,
    		mod,
    		current,
    		input_input_handler,
    		click_handler,
    		click_handler_1,
    		click_handler_2
    	];
    }

    class ToggleClass extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { num: 0, mod: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ToggleClass",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*num*/ ctx[0] === undefined && !("num" in props)) {
    			console.warn("<ToggleClass> was created without expected prop 'num'");
    		}

    		if (/*mod*/ ctx[1] === undefined && !("mod" in props)) {
    			console.warn("<ToggleClass> was created without expected prop 'mod'");
    		}
    	}

    	get num() {
    		throw new Error("<ToggleClass>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set num(value) {
    		throw new Error("<ToggleClass>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mod() {
    		throw new Error("<ToggleClass>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mod(value) {
    		throw new Error("<ToggleClass>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    /* src/Stor.svelte generated by Svelte v3.16.7 */
    const file$9 = "src/Stor.svelte";

    function create_fragment$9(ctx) {
    	let h2;
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			t0 = text("loc is ");
    			t1 = text(/*$loc*/ ctx[0]);
    			add_location(h2, file$9, 27, 0, 434);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t0);
    			append_dev(h2, t1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$loc*/ 1) set_data_dev(t1, /*$loc*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let $count;
    	let $loc;
    	const count = writable(0);
    	validate_store(count, "count");
    	component_subscribe($$self, count, value => $$invalidate(3, $count = value));
    	console.log($count);
    	count.set(1);
    	console.log($count);
    	set_store_value(count, $count = 2);
    	console.log($count);
    	const loc = writable(false);
    	validate_store(loc, "loc");
    	component_subscribe($$self, loc, value => $$invalidate(0, $loc = value));
    	console.log($loc);
    	loc.set(true);
    	console.log($loc);
    	set_store_value(loc, $loc = false);
    	console.log($loc);
    	loc.set(true);
    	console.log($loc);

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("$count" in $$props) count.set($count = $$props.$count);
    		if ("$loc" in $$props) loc.set($loc = $$props.$loc);
    	};

    	return [$loc, count, loc];
    }

    class Stor extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Stor",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/ToggleTheme.svelte generated by Svelte v3.16.7 */
    const file$a = "src/ToggleTheme.svelte";

    // (10:1) {#if dark}
    function create_if_block$7(ctx) {
    	let link;

    	const block = {
    		c: function create() {
    			link = element("link");
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "style.css");
    			add_location(link, file$a, 10, 1, 171);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(link);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(10:1) {#if dark}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let if_block_anchor;
    	let t0;
    	let h1;
    	let t2;
    	let t3;
    	let button;
    	let current;
    	let dispose;
    	let if_block = /*dark*/ ctx[0] && create_if_block$7(ctx);
    	const stor = new Stor({ $$inline: true });

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			t0 = space();
    			h1 = element("h1");
    			h1.textContent = "Hello World!";
    			t2 = space();
    			create_component(stor.$$.fragment);
    			t3 = space();
    			button = element("button");
    			button.textContent = "toggle theme";
    			add_location(h1, file$a, 14, 0, 235);
    			add_location(button, file$a, 17, 0, 267);
    			dispose = listen_dev(button, "click", /*toggleTheme*/ ctx[1], false, false, false);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(document.head, null);
    			append_dev(document.head, if_block_anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(stor, target, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, button, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*dark*/ ctx[0]) {
    				if (!if_block) {
    					if_block = create_if_block$7(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(stor.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(stor.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			detach_dev(if_block_anchor);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t2);
    			destroy_component(stor, detaching);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(button);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let dark = false;
    	const toggleTheme = () => $$invalidate(0, dark = dark === false);

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("dark" in $$props) $$invalidate(0, dark = $$props.dark);
    	};

    	return [dark, toggleTheme];
    }

    class ToggleTheme extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ToggleTheme",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src/Home.svelte generated by Svelte v3.16.7 */
    const file$b = "src/Home.svelte";

    // (44:0) {#if visible}
    function create_if_block$8(ctx) {
    	let div;
    	let div_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "INTRODUCTION";
    			set_style(div, "font-family", "Times New Roman");
    			set_style(div, "text-align", "center");
    			set_style(div, "color", "hsl(210, 90%, 90%)");
    			set_style(div, "font-size", "32px");
    			add_location(div, file$b, 44, 0, 724);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(44:0) {#if visible}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let t0;
    	let br0;
    	let t1;
    	let p0;
    	let p1;
    	let t4;
    	let p2;
    	let t6;
    	let br1;
    	let t7;
    	let br2;
    	let t8;
    	let br3;
    	let t9;
    	let div;
    	let current;
    	let if_block = /*visible*/ ctx[0] && create_if_block$8(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			br0 = element("br");
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "The cult that captivated me has no makeshift control towers or dirt runways made to entice cargo-bearing planes to land. It was a conglomeration of authors, presenters, and bloggers who write JavaScript code without mutating variables or objects, and whose functions are strictly typed, referentially transparent, and take arguments one at a time. Maybe it was my enthusiasm for the Haskell programming language that made it so easy for me to hope that mimicking Haskell's inherent characteristics would result in better Javascript code.\n\nI constrained my JavaScript code in other ways too, favoring \"good parts\" over \"bad parts\", and \"best practices\" over common sense. After a while it dawned on me that when the global space is a little module in an application, global variables are not dangerous. When a million and one non-tail-call recursions or passes through a loop can either spew a million pieces of garbage into memory, or else mutate something a million times, there should be a good reason for choosing to feed the garbage collector such a large feast. That's when I unleashed the full power of JavaScript and started having fun.  \n\n";
    			p1 = element("p");
    			p1.textContent = "For me, Functional programming in the context of Javascript is the art of inventing higher-order, often application-specific functions to manipulate smaller, reusable functions. Simple monad, messages monad, Promises monad, and transducer monad (shown herein) hint at the possibilities.";
    			t4 = space();
    			p2 = element("p");
    			p2.textContent = "Posts in this blog aren't just about computer programming. Nothing fit to publish is off limits.";
    			t6 = space();
    			br1 = element("br");
    			t7 = space();
    			br2 = element("br");
    			t8 = space();
    			br3 = element("br");
    			t9 = space();
    			div = element("div");
    			div.textContent = "...";
    			add_location(br0, file$b, 48, 0, 878);
    			add_location(p0, file$b, 49, 0, 883);
    			add_location(p1, file$b, 53, 0, 2034);
    			add_location(p2, file$b, 54, 0, 2330);
    			add_location(br1, file$b, 55, 0, 2436);
    			add_location(br2, file$b, 56, 0, 2441);
    			add_location(br3, file$b, 57, 0, 2446);
    			set_style(div, "text-align", "center");
    			add_location(div, file$b, 58, 0, 2451);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, br0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p0, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, p2, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, br2, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, br3, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, div, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(br2);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(br3);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self) {
    	var cache = [[1, 2, 3, 4, 5, 6, 7, 8, 9]];
    	var j = 0;

    	var ob = {
    		x: [],
    		push: function push(e) {
    			ob.x.push(parseInt(e.target.id.slice(1, 2), 10));

    			if (ob.x.length > 1) {
    				var d = exchange(ob.x[0], ob.x[1]);
    				cache.splice(j + 1, 0, d);
    				ob.x = [];
    				j += 1;
    				return cache;
    				var j = 0;
    			}
    		}
    	};

    	function exchange(k, n) {
    		var ar = cache[j].slice();
    		var a = ar[k];
    		ar[k] = ar[n];
    		ar[n] = a;
    		return ar;
    	}

    	var back = function back() {
    		if (j > 0) j = j -= 1; else j = j;
    	};

    	var forward = function forward() {
    		if (j + 1 < cache.length) j = j += 1; else j = j;
    	};

    	let visible = true;

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("cache" in $$props) cache = $$props.cache;
    		if ("j" in $$props) j = $$props.j;
    		if ("ob" in $$props) ob = $$props.ob;
    		if ("back" in $$props) back = $$props.back;
    		if ("forward" in $$props) forward = $$props.forward;
    		if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
    	};

    	return [visible];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/Score.svelte generated by Svelte v3.16.7 */
    const file$c = "src/Score.svelte";

    // (5:0) {#if visible}
    function create_if_block$9(ctx) {
    	let div;
    	let div_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "GAME OF SCORE";
    			set_style(div, "font-family", "Times New Roman");
    			set_style(div, "text-align", "center");
    			set_style(div, "color", "hsl(210, 90%, 90%)");
    			set_style(div, "font-size", "32px");
    			add_location(div, file$c, 5, 1, 93);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(5:0) {#if visible}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let t0;
    	let br0;
    	let t1;
    	let p0;
    	let t3;
    	let p1;
    	let t5;
    	let p2;
    	let t7;
    	let a0;
    	let t9;
    	let span0;
    	let t11;
    	let a1;
    	let t13;
    	let br1;
    	let br2;
    	let t14;
    	let span1;
    	let t16;
    	let a2;
    	let t18;
    	let span2;
    	let t20;
    	let a3;
    	let t22;
    	let span3;
    	let t24;
    	let a4;
    	let t26;
    	let span4;
    	let t28;
    	let a5;
    	let t30;
    	let span5;
    	let t32;
    	let a6;
    	let t34;
    	let span6;
    	let current;
    	let if_block = /*visible*/ ctx[0] && create_if_block$9(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			br0 = element("br");
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "Score is an elaborate React project with a Haskell Wai WebSockets server on the back end. Users can form or join groups that play, exchange text messages, and maintain a todo list among themselves.";
    			t3 = space();
    			p1 = element("p");
    			p1.textContent = "You will be in the default group \"solo\" until you join or create a group with another name. You can change the user name assigned to you by entering a new name and password, separated by a comma (name,password).";
    			t5 = space();
    			p2 = element("p");
    			p2.textContent = "Game rules are available at the game site, which runs online here:";
    			t7 = space();
    			a0 = element("a");
    			a0.textContent = "Online game of Score>";
    			t9 = space();
    			span0 = element("span");
    			span0.textContent = "The code is here:";
    			t11 = space();
    			a1 = element("a");
    			a1.textContent = "Score Github Repository";
    			t13 = space();
    			br1 = element("br");
    			br2 = element("br");
    			t14 = space();
    			span1 = element("span");
    			span1.textContent = "I switched from";
    			t16 = space();
    			a2 = element("a");
    			a2.textContent = "Node";
    			t18 = space();
    			span2 = element("span");
    			span2.textContent = "to";
    			t20 = space();
    			a3 = element("a");
    			a3.textContent = "React";
    			t22 = space();
    			span3 = element("span");
    			span3.textContent = "and then, a few years ago, I switched to";
    			t24 = space();
    			a4 = element("a");
    			a4.textContent = "Cycle.js>";
    			t26 = space();
    			span4 = element("span");
    			span4.textContent = ". Recently, I started using";
    			t28 = space();
    			a5 = element("a");
    			a5.textContent = "Svelte";
    			t30 = space();
    			span5 = element("span");
    			span5.textContent = ". For me, writing and maintaining code became easier and easier as I went from React to Cycle.js to Svelte. Another important feature of Svelte is that";
    			t32 = space();
    			a6 = element("a");
    			a6.textContent = "substantially less code needs to be uploaded to browsers";
    			t34 = space();
    			span6 = element("span");
    			span6.textContent = ". I'm impressed.";
    			add_location(br0, file$c, 9, 0, 249);
    			add_location(p0, file$c, 11, 0, 255);
    			add_location(p1, file$c, 13, 0, 462);
    			add_location(p2, file$c, 15, 0, 684);
    			attr_dev(a0, "href", "http://game.schalk.site");
    			attr_dev(a0, "target", "_blank");
    			add_location(a0, file$c, 16, 0, 759);
    			add_location(span0, file$c, 17, 0, 839);
    			attr_dev(a1, "href", "https://github.com/dschalk/score2");
    			attr_dev(a1, "target", "_blank");
    			add_location(a1, file$c, 18, 0, 872);
    			add_location(br1, file$c, 19, 0, 964);
    			add_location(br2, file$c, 19, 4, 968);
    			add_location(span1, file$c, 20, 0, 973);
    			attr_dev(a2, "href", "https://nodejs.org/en/about/");
    			attr_dev(a2, "target", "_blank");
    			add_location(a2, file$c, 21, 0, 1004);
    			add_location(span2, file$c, 22, 0, 1072);
    			attr_dev(a3, "href", "https://reactjs.org/");
    			attr_dev(a3, "target", "_blank");
    			add_location(a3, file$c, 23, 0, 1090);
    			add_location(span3, file$c, 24, 0, 1151);
    			attr_dev(a4, "href", "https://cycle.js.org");
    			attr_dev(a4, "target", "_blank");
    			add_location(a4, file$c, 25, 0, 1207);
    			add_location(span4, file$c, 26, 0, 1272);
    			attr_dev(a5, "href", "https://svelte.dev/");
    			attr_dev(a5, "target", "_blank");
    			add_location(a5, file$c, 27, 0, 1314);
    			add_location(span5, file$c, 28, 0, 1375);
    			attr_dev(a6, "href", "https://www.freecodecamp.org/news/a-realworld-comparison-of-front-end-frameworks-with-benchmarks-2019-update-4be0d3c78075/");
    			attr_dev(a6, "target", "_blank");
    			add_location(a6, file$c, 29, 0, 1541);
    			add_location(span6, file$c, 30, 0, 1755);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, br0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, p2, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, a0, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, span0, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, a1, anchor);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, br2, anchor);
    			insert_dev(target, t14, anchor);
    			insert_dev(target, span1, anchor);
    			insert_dev(target, t16, anchor);
    			insert_dev(target, a2, anchor);
    			insert_dev(target, t18, anchor);
    			insert_dev(target, span2, anchor);
    			insert_dev(target, t20, anchor);
    			insert_dev(target, a3, anchor);
    			insert_dev(target, t22, anchor);
    			insert_dev(target, span3, anchor);
    			insert_dev(target, t24, anchor);
    			insert_dev(target, a4, anchor);
    			insert_dev(target, t26, anchor);
    			insert_dev(target, span4, anchor);
    			insert_dev(target, t28, anchor);
    			insert_dev(target, a5, anchor);
    			insert_dev(target, t30, anchor);
    			insert_dev(target, span5, anchor);
    			insert_dev(target, t32, anchor);
    			insert_dev(target, a6, anchor);
    			insert_dev(target, t34, anchor);
    			insert_dev(target, span6, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(a0);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(span0);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(a1);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(br2);
    			if (detaching) detach_dev(t14);
    			if (detaching) detach_dev(span1);
    			if (detaching) detach_dev(t16);
    			if (detaching) detach_dev(a2);
    			if (detaching) detach_dev(t18);
    			if (detaching) detach_dev(span2);
    			if (detaching) detach_dev(t20);
    			if (detaching) detach_dev(a3);
    			if (detaching) detach_dev(t22);
    			if (detaching) detach_dev(span3);
    			if (detaching) detach_dev(t24);
    			if (detaching) detach_dev(a4);
    			if (detaching) detach_dev(t26);
    			if (detaching) detach_dev(span4);
    			if (detaching) detach_dev(t28);
    			if (detaching) detach_dev(a5);
    			if (detaching) detach_dev(t30);
    			if (detaching) detach_dev(span5);
    			if (detaching) detach_dev(t32);
    			if (detaching) detach_dev(a6);
    			if (detaching) detach_dev(t34);
    			if (detaching) detach_dev(span6);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self) {
    	let visible = true;

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
    	};

    	return [visible];
    }

    class Score extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Score",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src/Cargo.svelte generated by Svelte v3.16.7 */
    const file$d = "src/Cargo.svelte";

    // (18:0) {#if visible}
    function create_if_block$a(ctx) {
    	let div;
    	let div_transition;
    	let t1;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "FUNCTIONAL PROGRAMMING WITH JAVASCRIPT\n ";
    			t1 = text("}");
    			set_style(div, "font-family", "Times New Roman");
    			set_style(div, "text-align", "center");
    			set_style(div, "color", "hsl(210, 90%, 90%)");
    			set_style(div, "font-size", "32px");
    			add_location(div, file$d, 18, 1, 196);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			insert_dev(target, t1, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$a.name,
    		type: "if",
    		source: "(18:0) {#if visible}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let t0;
    	let p0;
    	let p1;
    	let t3;
    	let a;
    	let t5;
    	let p2;
    	let t7;
    	let p3;
    	let t9;
    	let p4;
    	let t11;
    	let p5;
    	let t13;
    	let h3;
    	let t15;
    	let pre;
    	let current;
    	let if_block = /*visible*/ ctx[0] && create_if_block$a(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			p0 = element("p");
    			p0.textContent = "\"Functional programming\" means different things to different people. Applied to JavaScript, I wish it meant making good use JavaScript functions. \n\n\n";
    			p1 = element("p");
    			p1.textContent = "Mimicking features of the Haskell programming language vaguely hoping Haskell's reliability, ease of maintenance, and other conveniences will come your way reminds me of the cargo cults. \"The name derives from the belief which began among Melanesians in the late 19th and early 20th centuries that various ritualistic acts such as the building of an airplane runway will result in the appearance of material wealth, particularly highly desirable Western goods (i.e., \"cargo\"), via Western airplanes.\"";
    			t3 = space();
    			a = element("a");
    			a.textContent = "Cargo Cult";
    			t5 = space();
    			p2 = element("p");
    			p2.textContent = "According to the Wikipedia article \"Cargo Cult\", \"a cargo cult is a belief system among members of a relatively undeveloped society in which adherents practice superstitious rituals hoping to bring modern goods supplied by a more technologically advanced society. https://en.wikipedia.org/wiki/Cargo_cult The article goes on to say, \"The name derives from the belief which began among Melanesians in the late 19th and early 20th centuries that various ritualistic acts such as the building of an airplane runway will result in the appearance of material wealth, particularly highly desirable Western goods (i.e., \"cargo\"), via Western airplanes.\" citing Burridge, Kenelm (1969). New Heaven, New Earth: A study of Millenarian Activities. London: Basil Blackwell. p. 48 and Lindstrom, Lamont (1993). Cargo Cult: Strange Stories of desire from Melanesia and beyond. Honolulu: University of Hawaii Press.";
    			t7 = space();
    			p3 = element("p");
    			p3.textContent = "Haskell programming language code has, in my experience, been wonderfully reliable and maintainable. The WebSockets server supporting two games and one of the monad demonstrations is a good example. Hoping to bring some of this Haskell goodness into my JavaScript code, I toyed with what I call \"cargo cult functional JavaScript\" for a time. Without thinking things through intelligently, I imposed strict type checking, referential transparency, and immutability on my JavaScript code in situations where these things needlessly caused clutter, inefficiency, code bloat, and obfuscation. I invented all sorts of \"monads\" along with monad transformers and mechanisms for lifting values into composite monadic types.";
    			t9 = space();
    			p4 = element("p");
    			p4.textContent = "Now that I have abandoned the folly of mindlessly mimicking features of functional programming languages, I can console myself with the thought that I wasn't the first and I wasn't the last JavaScript programmer to got lost in this manner. Strict typing where it serves no useful purpose and insisting on immutability where all it does is polute memory with useless intermediate values is trendy these days.";
    			t11 = space();
    			p5 = element("p");
    			p5.textContent = "Code where functions might collide over mutable global variables leads programmers to religeously avoid mutable global variables. I'm using the Svelte framework for this project, and my numerous modules are quite small. Mutable global variables can't cause problems because I have no modules or heirarchies of nested modules in which clashes might occur. Were I to constrain my creativity by following \"best practices\" regarding global variables, I would be engaging in another form of cargo cult coding, mindlessly micking forms that have no value.";
    			t13 = space();
    			h3 = element("h3");
    			h3.textContent = "References";
    			t15 = space();
    			pre = element("pre");
    			pre.textContent = "Cargo Cult Programming video presentation\nhttps://www.youtube.com/watch?v=nm22duia0jU\n\nCargo Cult Science Richard Feynman' s 1974 video\nhttps://www.brainpickings.org/2012/06/08/richard-\n  feynman-caltech-cargo-cult-science/s";
    			add_location(p0, file$d, 22, 0, 376);
    			add_location(p1, file$d, 25, 0, 529);
    			attr_dev(a, "href", "https://en.wikipedia.org/wiki/Cargo_cult");
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$d, 28, 0, 1042);
    			add_location(p2, file$d, 30, 0, 1127);
    			add_location(p3, file$d, 32, 0, 2036);
    			add_location(p4, file$d, 35, 0, 2761);
    			add_location(p5, file$d, 36, 0, 3177);
    			attr_dev(h3, "class", "svelte-hw6ke3");
    			add_location(h3, file$d, 39, 0, 3737);
    			add_location(pre, file$d, 41, 0, 3758);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, p0, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, a, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, p2, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, p3, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, p4, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, p5, anchor);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, h3, anchor);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, pre, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(a);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(p3);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(p4);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(p5);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(pre);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self) {
    	let visible = true;

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
    	};

    	return [visible];
    }

    class Cargo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Cargo",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src/Blog.svelte generated by Svelte v3.16.7 */
    const file$e = "src/Blog.svelte";

    // (150:0) {#if j === 0}
    function create_if_block_13(ctx) {
    	let current;
    	const home = new Home({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(home.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(home, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(home.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(home.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(home, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_13.name,
    		type: "if",
    		source: "(150:0) {#if j === 0}",
    		ctx
    	});

    	return block;
    }

    // (153:0) {#if j === 1}
    function create_if_block_12(ctx) {
    	let current;
    	const monad = new Monad_1({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(monad.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(monad, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(monad.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(monad.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(monad, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_12.name,
    		type: "if",
    		source: "(153:0) {#if j === 1}",
    		ctx
    	});

    	return block;
    }

    // (156:0) {#if j === 2}
    function create_if_block_11(ctx) {
    	let current;
    	const monad2 = new Monad2({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(monad2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(monad2, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(monad2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(monad2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(monad2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11.name,
    		type: "if",
    		source: "(156:0) {#if j === 2}",
    		ctx
    	});

    	return block;
    }

    // (159:0) {#if j === 3}
    function create_if_block_10(ctx) {
    	let current;
    	const monad3 = new Monad3({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(monad3.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(monad3, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(monad3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(monad3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(monad3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(159:0) {#if j === 3}",
    		ctx
    	});

    	return block;
    }

    // (162:0) {#if j === 4}
    function create_if_block_9(ctx) {
    	let current;
    	const transducer = new Transducer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(transducer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(transducer, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(transducer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(transducer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(transducer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(162:0) {#if j === 4}",
    		ctx
    	});

    	return block;
    }

    // (165:0) {#if j === 5}
    function create_if_block_8(ctx) {
    	let current;
    	const matrix = new Matrix({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(matrix.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(matrix, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(matrix.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(matrix.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(matrix, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(165:0) {#if j === 5}",
    		ctx
    	});

    	return block;
    }

    // (168:0) {#if j === 6}
    function create_if_block_7(ctx) {
    	let current;
    	const haskell = new Haskell({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(haskell.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(haskell, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(haskell.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(haskell.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(haskell, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(168:0) {#if j === 6}",
    		ctx
    	});

    	return block;
    }

    // (171:0) {#if j === 7}
    function create_if_block_6(ctx) {
    	let current;
    	const score = new Score({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(score.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(score, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(score.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(score.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(score, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(171:0) {#if j === 7}",
    		ctx
    	});

    	return block;
    }

    // (174:0) {#if j === 8}
    function create_if_block_5(ctx) {
    	let current;
    	const cargo = new Cargo({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(cargo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cargo, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cargo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cargo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cargo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(174:0) {#if j === 8}",
    		ctx
    	});

    	return block;
    }

    // (177:0) {#if j === 9}
    function create_if_block_4(ctx) {
    	let current;
    	const bugs = new Bugs({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(bugs.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(bugs, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(bugs.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(bugs.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(bugs, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(177:0) {#if j === 9}",
    		ctx
    	});

    	return block;
    }

    // (180:0) {#if j === 10}
    function create_if_block_3(ctx) {
    	let current;
    	const toggleclass = new ToggleClass({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(toggleclass.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(toggleclass, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(toggleclass.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(toggleclass.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(toggleclass, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(180:0) {#if j === 10}",
    		ctx
    	});

    	return block;
    }

    // (183:0) {#if j === 11}
    function create_if_block_2(ctx) {
    	let current;
    	const toggletheme = new ToggleTheme({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(toggletheme.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(toggletheme, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(toggletheme.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(toggletheme.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(toggletheme, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(183:0) {#if j === 11}",
    		ctx
    	});

    	return block;
    }

    // (186:0) {#if j === 12}
    function create_if_block_1(ctx) {
    	let current;
    	const cow = new Cow({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(cow.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cow, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cow.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cow.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cow, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(186:0) {#if j === 12}",
    		ctx
    	});

    	return block;
    }

    // (189:0) {#if j === 13}
    function create_if_block$b(ctx) {
    	let current;
    	const stor = new Stor({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(stor.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(stor, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(stor.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(stor.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(stor, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$b.name,
    		type: "if",
    		source: "(189:0) {#if j === 13}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let br0;
    	let t0;
    	let div14;
    	let div0;
    	let t2;
    	let div13;
    	let div1;
    	let t4;
    	let div2;
    	let t6;
    	let div3;
    	let t8;
    	let div4;
    	let t10;
    	let div5;
    	let t12;
    	let div6;
    	let t14;
    	let div7;
    	let t16;
    	let div8;
    	let t18;
    	let div9;
    	let t20;
    	let div10;
    	let t22;
    	let div11;
    	let t24;
    	let div12;
    	let t26;
    	let div18;
    	let div17;
    	let div15;
    	let t28;
    	let div16;
    	let t30;
    	let br1;
    	let br2;
    	let br3;
    	let t31;
    	let t32;
    	let t33;
    	let t34;
    	let t35;
    	let t36;
    	let t37;
    	let t38;
    	let t39;
    	let t40;
    	let t41;
    	let t42;
    	let t43;
    	let t44;
    	let t45;
    	let br4;
    	let br5;
    	let t46;
    	let t47;
    	let pre;
    	let current;
    	let dispose;
    	let if_block0 = /*j*/ ctx[0] === 0 && create_if_block_13(ctx);
    	let if_block1 = /*j*/ ctx[0] === 1 && create_if_block_12(ctx);
    	let if_block2 = /*j*/ ctx[0] === 2 && create_if_block_11(ctx);
    	let if_block3 = /*j*/ ctx[0] === 3 && create_if_block_10(ctx);
    	let if_block4 = /*j*/ ctx[0] === 4 && create_if_block_9(ctx);
    	let if_block5 = /*j*/ ctx[0] === 5 && create_if_block_8(ctx);
    	let if_block6 = /*j*/ ctx[0] === 6 && create_if_block_7(ctx);
    	let if_block7 = /*j*/ ctx[0] === 7 && create_if_block_6(ctx);
    	let if_block8 = /*j*/ ctx[0] === 8 && create_if_block_5(ctx);
    	let if_block9 = /*j*/ ctx[0] === 9 && create_if_block_4(ctx);
    	let if_block10 = /*j*/ ctx[0] === 10 && create_if_block_3(ctx);
    	let if_block11 = /*j*/ ctx[0] === 11 && create_if_block_2(ctx);
    	let if_block12 = /*j*/ ctx[0] === 12 && create_if_block_1(ctx);
    	let if_block13 = /*j*/ ctx[0] === 13 && create_if_block$b(ctx);
    	const default_slot_template = /*$$slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			br0 = element("br");
    			t0 = space();
    			div14 = element("div");
    			div0 = element("div");
    			div0.textContent = "Table of Contents";
    			t2 = space();
    			div13 = element("div");
    			div1 = element("div");
    			div1.textContent = "Home";
    			t4 = space();
    			div2 = element("div");
    			div2.textContent = "A Simple Monad";
    			t6 = space();
    			div3 = element("div");
    			div3.textContent = "A Messaging Monad";
    			t8 = space();
    			div4 = element("div");
    			div4.textContent = "A Promises Monad";
    			t10 = space();
    			div5 = element("div");
    			div5.textContent = "A Transducer Monad";
    			t12 = space();
    			div6 = element("div");
    			div6.textContent = "Why Svelte";
    			t14 = space();
    			div7 = element("div");
    			div7.textContent = "Haskell Secrets";
    			t16 = space();
    			div8 = element("div");
    			div8.textContent = "React Game of Score";
    			t18 = space();
    			div9 = element("div");
    			div9.textContent = "Functional Cargo Cult";
    			t20 = space();
    			div10 = element("div");
    			div10.textContent = "Eradicating Bed Bugs";
    			t22 = space();
    			div11 = element("div");
    			div11.textContent = "Toggle Class";
    			t24 = space();
    			div12 = element("div");
    			div12.textContent = "Toggle Theme";
    			t26 = space();
    			div18 = element("div");
    			div17 = element("div");
    			div15 = element("div");
    			div15.textContent = "DAVID SCHALK's BLOG";
    			t28 = space();
    			div16 = element("div");
    			div16.textContent = "Escape from a Cargo Cult and Other Adventures";
    			t30 = space();
    			br1 = element("br");
    			br2 = element("br");
    			br3 = element("br");
    			t31 = space();
    			if (if_block0) if_block0.c();
    			t32 = space();
    			if (if_block1) if_block1.c();
    			t33 = space();
    			if (if_block2) if_block2.c();
    			t34 = space();
    			if (if_block3) if_block3.c();
    			t35 = space();
    			if (if_block4) if_block4.c();
    			t36 = space();
    			if (if_block5) if_block5.c();
    			t37 = space();
    			if (if_block6) if_block6.c();
    			t38 = space();
    			if (if_block7) if_block7.c();
    			t39 = space();
    			if (if_block8) if_block8.c();
    			t40 = space();
    			if (if_block9) if_block9.c();
    			t41 = space();
    			if (if_block10) if_block10.c();
    			t42 = space();
    			if (if_block11) if_block11.c();
    			t43 = space();
    			if (if_block12) if_block12.c();
    			t44 = space();
    			if (if_block13) if_block13.c();
    			t45 = space();
    			br4 = element("br");
    			br5 = element("br");
    			t46 = space();
    			if (default_slot) default_slot.c();
    			t47 = space();
    			pre = element("pre");
    			pre.textContent = "...";
    			add_location(br0, file$e, 73, 0, 1397);
    			attr_dev(div0, "class", "dropbtn svelte-1p5zo89");
    			add_location(div0, file$e, 78, 2, 1511);
    			attr_dev(div1, "class", "menu svelte-1p5zo89");
    			add_location(div1, file$e, 80, 0, 1589);
    			attr_dev(div2, "class", "menu svelte-1p5zo89");
    			add_location(div2, file$e, 81, 0, 1644);
    			attr_dev(div3, "class", "menu svelte-1p5zo89");
    			add_location(div3, file$e, 82, 0, 1709);
    			attr_dev(div4, "class", "menu svelte-1p5zo89");
    			add_location(div4, file$e, 83, 0, 1777);
    			attr_dev(div5, "class", "menu svelte-1p5zo89");
    			add_location(div5, file$e, 84, 0, 1844);
    			attr_dev(div6, "class", "menu svelte-1p5zo89");
    			add_location(div6, file$e, 85, 0, 1913);
    			attr_dev(div7, "class", "menu svelte-1p5zo89");
    			add_location(div7, file$e, 86, 0, 1974);
    			attr_dev(div8, "class", "menu svelte-1p5zo89");
    			add_location(div8, file$e, 87, 0, 2040);
    			attr_dev(div9, "class", "menu svelte-1p5zo89");
    			add_location(div9, file$e, 88, 0, 2110);
    			attr_dev(div10, "class", "menu svelte-1p5zo89");
    			add_location(div10, file$e, 89, 0, 2182);
    			attr_dev(div11, "class", "menu svelte-1p5zo89");
    			add_location(div11, file$e, 90, 0, 2253);
    			attr_dev(div12, "class", "menu svelte-1p5zo89");
    			add_location(div12, file$e, 91, 0, 2317);
    			attr_dev(div13, "class", "dropdown-content svelte-1p5zo89");
    			add_location(div13, file$e, 79, 2, 1558);
    			attr_dev(div14, "class", "dropdown svelte-1p5zo89");
    			add_location(div14, file$e, 77, 0, 1486);
    			set_style(div15, "font-size", "40px");
    			set_style(div15, "color", "#FFD700");
    			set_style(div15, "text-align", "center");
    			add_location(div15, file$e, 145, 0, 4959);
    			set_style(div16, "font-size", "24px");
    			set_style(div16, "color", "#FFCCAA");
    			set_style(div16, "font-style", "italic");
    			set_style(div16, "text-align", "center");
    			add_location(div16, file$e, 146, 0, 5052);
    			add_location(br1, file$e, 147, 0, 5192);
    			add_location(br2, file$e, 147, 4, 5196);
    			add_location(br3, file$e, 147, 8, 5200);
    			set_style(div17, "margin-left", "25%");
    			set_style(div17, "margin-right", "25%");
    			add_location(div17, file$e, 143, 0, 4905);
    			add_location(br4, file$e, 192, 0, 5655);
    			add_location(br5, file$e, 192, 4, 5659);
    			attr_dev(div18, "class", "margins");
    			add_location(div18, file$e, 141, 8, 4882);
    			add_location(pre, file$e, 195, 0, 5680);

    			dispose = [
    				listen_dev(div1, "click", /*click_handler*/ ctx[3], false, false, false),
    				listen_dev(div2, "click", /*click_handler_1*/ ctx[4], false, false, false),
    				listen_dev(div3, "click", /*click_handler_2*/ ctx[5], false, false, false),
    				listen_dev(div4, "click", /*click_handler_3*/ ctx[6], false, false, false),
    				listen_dev(div5, "click", /*click_handler_4*/ ctx[7], false, false, false),
    				listen_dev(div6, "click", /*click_handler_5*/ ctx[8], false, false, false),
    				listen_dev(div7, "click", /*click_handler_6*/ ctx[9], false, false, false),
    				listen_dev(div8, "click", /*click_handler_7*/ ctx[10], false, false, false),
    				listen_dev(div9, "click", /*click_handler_8*/ ctx[11], false, false, false),
    				listen_dev(div10, "click", /*click_handler_9*/ ctx[12], false, false, false),
    				listen_dev(div11, "click", /*click_handler_10*/ ctx[13], false, false, false),
    				listen_dev(div12, "click", /*click_handler_11*/ ctx[14], false, false, false)
    			];
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, br0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div14, anchor);
    			append_dev(div14, div0);
    			append_dev(div14, t2);
    			append_dev(div14, div13);
    			append_dev(div13, div1);
    			append_dev(div13, t4);
    			append_dev(div13, div2);
    			append_dev(div13, t6);
    			append_dev(div13, div3);
    			append_dev(div13, t8);
    			append_dev(div13, div4);
    			append_dev(div13, t10);
    			append_dev(div13, div5);
    			append_dev(div13, t12);
    			append_dev(div13, div6);
    			append_dev(div13, t14);
    			append_dev(div13, div7);
    			append_dev(div13, t16);
    			append_dev(div13, div8);
    			append_dev(div13, t18);
    			append_dev(div13, div9);
    			append_dev(div13, t20);
    			append_dev(div13, div10);
    			append_dev(div13, t22);
    			append_dev(div13, div11);
    			append_dev(div13, t24);
    			append_dev(div13, div12);
    			insert_dev(target, t26, anchor);
    			insert_dev(target, div18, anchor);
    			append_dev(div18, div17);
    			append_dev(div17, div15);
    			append_dev(div17, t28);
    			append_dev(div17, div16);
    			append_dev(div17, t30);
    			append_dev(div17, br1);
    			append_dev(div17, br2);
    			append_dev(div17, br3);
    			append_dev(div17, t31);
    			if (if_block0) if_block0.m(div17, null);
    			append_dev(div17, t32);
    			if (if_block1) if_block1.m(div17, null);
    			append_dev(div17, t33);
    			if (if_block2) if_block2.m(div17, null);
    			append_dev(div17, t34);
    			if (if_block3) if_block3.m(div17, null);
    			append_dev(div17, t35);
    			if (if_block4) if_block4.m(div17, null);
    			append_dev(div17, t36);
    			if (if_block5) if_block5.m(div17, null);
    			append_dev(div17, t37);
    			if (if_block6) if_block6.m(div17, null);
    			append_dev(div17, t38);
    			if (if_block7) if_block7.m(div17, null);
    			append_dev(div17, t39);
    			if (if_block8) if_block8.m(div17, null);
    			append_dev(div17, t40);
    			if (if_block9) if_block9.m(div17, null);
    			append_dev(div17, t41);
    			if (if_block10) if_block10.m(div17, null);
    			append_dev(div17, t42);
    			if (if_block11) if_block11.m(div17, null);
    			append_dev(div17, t43);
    			if (if_block12) if_block12.m(div17, null);
    			append_dev(div17, t44);
    			if (if_block13) if_block13.m(div17, null);
    			append_dev(div18, t45);
    			append_dev(div18, br4);
    			append_dev(div18, br5);
    			append_dev(div18, t46);

    			if (default_slot) {
    				default_slot.m(div18, null);
    			}

    			insert_dev(target, t47, anchor);
    			insert_dev(target, pre, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*j*/ ctx[0] === 0) {
    				if (!if_block0) {
    					if_block0 = create_if_block_13(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div17, t32);
    				} else {
    					transition_in(if_block0, 1);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*j*/ ctx[0] === 1) {
    				if (!if_block1) {
    					if_block1 = create_if_block_12(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div17, t33);
    				} else {
    					transition_in(if_block1, 1);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*j*/ ctx[0] === 2) {
    				if (!if_block2) {
    					if_block2 = create_if_block_11(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div17, t34);
    				} else {
    					transition_in(if_block2, 1);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (/*j*/ ctx[0] === 3) {
    				if (!if_block3) {
    					if_block3 = create_if_block_10(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(div17, t35);
    				} else {
    					transition_in(if_block3, 1);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}

    			if (/*j*/ ctx[0] === 4) {
    				if (!if_block4) {
    					if_block4 = create_if_block_9(ctx);
    					if_block4.c();
    					transition_in(if_block4, 1);
    					if_block4.m(div17, t36);
    				} else {
    					transition_in(if_block4, 1);
    				}
    			} else if (if_block4) {
    				group_outros();

    				transition_out(if_block4, 1, 1, () => {
    					if_block4 = null;
    				});

    				check_outros();
    			}

    			if (/*j*/ ctx[0] === 5) {
    				if (!if_block5) {
    					if_block5 = create_if_block_8(ctx);
    					if_block5.c();
    					transition_in(if_block5, 1);
    					if_block5.m(div17, t37);
    				} else {
    					transition_in(if_block5, 1);
    				}
    			} else if (if_block5) {
    				group_outros();

    				transition_out(if_block5, 1, 1, () => {
    					if_block5 = null;
    				});

    				check_outros();
    			}

    			if (/*j*/ ctx[0] === 6) {
    				if (!if_block6) {
    					if_block6 = create_if_block_7(ctx);
    					if_block6.c();
    					transition_in(if_block6, 1);
    					if_block6.m(div17, t38);
    				} else {
    					transition_in(if_block6, 1);
    				}
    			} else if (if_block6) {
    				group_outros();

    				transition_out(if_block6, 1, 1, () => {
    					if_block6 = null;
    				});

    				check_outros();
    			}

    			if (/*j*/ ctx[0] === 7) {
    				if (!if_block7) {
    					if_block7 = create_if_block_6(ctx);
    					if_block7.c();
    					transition_in(if_block7, 1);
    					if_block7.m(div17, t39);
    				} else {
    					transition_in(if_block7, 1);
    				}
    			} else if (if_block7) {
    				group_outros();

    				transition_out(if_block7, 1, 1, () => {
    					if_block7 = null;
    				});

    				check_outros();
    			}

    			if (/*j*/ ctx[0] === 8) {
    				if (!if_block8) {
    					if_block8 = create_if_block_5(ctx);
    					if_block8.c();
    					transition_in(if_block8, 1);
    					if_block8.m(div17, t40);
    				} else {
    					transition_in(if_block8, 1);
    				}
    			} else if (if_block8) {
    				group_outros();

    				transition_out(if_block8, 1, 1, () => {
    					if_block8 = null;
    				});

    				check_outros();
    			}

    			if (/*j*/ ctx[0] === 9) {
    				if (!if_block9) {
    					if_block9 = create_if_block_4(ctx);
    					if_block9.c();
    					transition_in(if_block9, 1);
    					if_block9.m(div17, t41);
    				} else {
    					transition_in(if_block9, 1);
    				}
    			} else if (if_block9) {
    				group_outros();

    				transition_out(if_block9, 1, 1, () => {
    					if_block9 = null;
    				});

    				check_outros();
    			}

    			if (/*j*/ ctx[0] === 10) {
    				if (!if_block10) {
    					if_block10 = create_if_block_3(ctx);
    					if_block10.c();
    					transition_in(if_block10, 1);
    					if_block10.m(div17, t42);
    				} else {
    					transition_in(if_block10, 1);
    				}
    			} else if (if_block10) {
    				group_outros();

    				transition_out(if_block10, 1, 1, () => {
    					if_block10 = null;
    				});

    				check_outros();
    			}

    			if (/*j*/ ctx[0] === 11) {
    				if (!if_block11) {
    					if_block11 = create_if_block_2(ctx);
    					if_block11.c();
    					transition_in(if_block11, 1);
    					if_block11.m(div17, t43);
    				} else {
    					transition_in(if_block11, 1);
    				}
    			} else if (if_block11) {
    				group_outros();

    				transition_out(if_block11, 1, 1, () => {
    					if_block11 = null;
    				});

    				check_outros();
    			}

    			if (/*j*/ ctx[0] === 12) {
    				if (!if_block12) {
    					if_block12 = create_if_block_1(ctx);
    					if_block12.c();
    					transition_in(if_block12, 1);
    					if_block12.m(div17, t44);
    				} else {
    					transition_in(if_block12, 1);
    				}
    			} else if (if_block12) {
    				group_outros();

    				transition_out(if_block12, 1, 1, () => {
    					if_block12 = null;
    				});

    				check_outros();
    			}

    			if (/*j*/ ctx[0] === 13) {
    				if (!if_block13) {
    					if_block13 = create_if_block$b(ctx);
    					if_block13.c();
    					transition_in(if_block13, 1);
    					if_block13.m(div17, null);
    				} else {
    					transition_in(if_block13, 1);
    				}
    			} else if (if_block13) {
    				group_outros();

    				transition_out(if_block13, 1, 1, () => {
    					if_block13 = null;
    				});

    				check_outros();
    			}

    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 2) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[1], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[1], dirty, null));
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			transition_in(if_block3);
    			transition_in(if_block4);
    			transition_in(if_block5);
    			transition_in(if_block6);
    			transition_in(if_block7);
    			transition_in(if_block8);
    			transition_in(if_block9);
    			transition_in(if_block10);
    			transition_in(if_block11);
    			transition_in(if_block12);
    			transition_in(if_block13);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			transition_out(if_block3);
    			transition_out(if_block4);
    			transition_out(if_block5);
    			transition_out(if_block6);
    			transition_out(if_block7);
    			transition_out(if_block8);
    			transition_out(if_block9);
    			transition_out(if_block10);
    			transition_out(if_block11);
    			transition_out(if_block12);
    			transition_out(if_block13);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div14);
    			if (detaching) detach_dev(t26);
    			if (detaching) detach_dev(div18);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    			if (if_block5) if_block5.d();
    			if (if_block6) if_block6.d();
    			if (if_block7) if_block7.d();
    			if (if_block8) if_block8.d();
    			if (if_block9) if_block9.d();
    			if (if_block10) if_block10.d();
    			if (if_block11) if_block11.d();
    			if (if_block12) if_block12.d();
    			if (if_block13) if_block13.d();
    			if (default_slot) default_slot.d(detaching);
    			if (detaching) detach_dev(t47);
    			if (detaching) detach_dev(pre);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { j = 0 } = $$props;
    	const writable_props = ["j"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Blog> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	const click_handler = () => $$invalidate(0, j = 0);
    	const click_handler_1 = () => $$invalidate(0, j = 1);
    	const click_handler_2 = () => $$invalidate(0, j = 2);
    	const click_handler_3 = () => $$invalidate(0, j = 3);
    	const click_handler_4 = () => $$invalidate(0, j = 4);
    	const click_handler_5 = () => $$invalidate(0, j = 5);
    	const click_handler_6 = () => $$invalidate(0, j = 6);
    	const click_handler_7 = () => $$invalidate(0, j = 7);
    	const click_handler_8 = () => $$invalidate(0, j = 8);
    	const click_handler_9 = () => $$invalidate(0, j = 9);
    	const click_handler_10 = () => $$invalidate(0, j = 10);
    	const click_handler_11 = () => $$invalidate(0, j = 11);

    	$$self.$set = $$props => {
    		if ("j" in $$props) $$invalidate(0, j = $$props.j);
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return { j };
    	};

    	$$self.$inject_state = $$props => {
    		if ("j" in $$props) $$invalidate(0, j = $$props.j);
    	};

    	return [
    		j,
    		$$scope,
    		$$slots,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5,
    		click_handler_6,
    		click_handler_7,
    		click_handler_8,
    		click_handler_9,
    		click_handler_10,
    		click_handler_11
    	];
    }

    class Blog extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, { j: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Blog",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get j() {
    		throw new Error("<Blog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set j(value) {
    		throw new Error("<Blog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.16.7 */

    function create_fragment$f(ctx) {
    	let current;
    	const blog = new Blog({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(blog.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(blog, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(blog.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(blog.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(blog, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
