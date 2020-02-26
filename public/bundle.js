
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
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
    function create_slot(definition, ctx, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.ctx, definition[1](fn ? fn(ctx) : {})))
            : ctx.$$scope.ctx;
    }
    function get_slot_changes(definition, ctx, changed, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.changed || {}, definition[1](fn ? fn(changed) : {})))
            : ctx.$$scope.changed || {};
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    let running = false;
    function run_tasks() {
        tasks.forEach(task => {
            if (!task[0](now())) {
                tasks.delete(task);
                task[1]();
            }
        });
        running = tasks.size > 0;
        if (running)
            raf(run_tasks);
    }
    function loop(fn) {
        let task;
        if (!running) {
            running = true;
            raf(run_tasks);
        }
        return {
            promise: new Promise(fulfil => {
                tasks.add(task = [fn, fulfil]);
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
        else
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? undefined : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
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
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
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
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment.m(target, anchor);
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
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
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
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, value) => {
                if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_update);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
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

    function fade(node, { delay = 0, duration = 400 }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            css: t => `opacity: ${t * o}`
        };
    }

    /* src/Monad.svelte generated by Svelte v3.9.1 */

    const file = "src/Monad.svelte";

    // (108:1) {#if visible}
    function create_if_block(ctx) {
    	var div, div_transition, current;

    	return {
    		c: function create() {
    			div = element("div");
    			div.textContent = "A SIMPLE LITTLE MONAD";
    			set_style(div, "font-family", "Times New Roman");
    			set_style(div, "text-align", "center");
    			set_style(div, "color", "hsl(210, 90%, 90%)");
    			set_style(div, "font-size", "32px");
    			add_location(div, file, 108, 2, 2324);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
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
    			if (detaching) {
    				detach(div);
    				if (div_transition) div_transition.end();
    			}
    		}
    	};
    }

    function create_fragment(ctx) {
    	var t0, br, t1, span0, t3, span1, t5, span2, t7, p0, t9, pre0, t10, t11, p1, t13, pre1, t15, p2, t17, p3, t19, p4, t21, t22, t23, input, t24, p5, t25, t26, t27, t28_value = ctx.bonads(ctx.num) + "", t28, t29, span3, t31, pre2, t32, current, dispose;

    	var if_block =  create_if_block();

    	return {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			br = element("br");
    			t1 = space();
    			span0 = element("span");
    			span0.textContent = "Monad (from Greek μονάς monas, \"singularity\" in turn from μόνος monos, \"alone\")[1] refers, in cosmogony, to the Supreme Being, divinity or the totality of all things. A basic unit of perceptual reality is a \"monad\" in Gottfried Leibniz'";
    			t3 = space();
    			span1 = element("span");
    			span1.textContent = "Monadology";
    			t5 = space();
    			span2 = element("span");
    			span2.textContent = ", published in 1714. A single note in music theory is called a monad.";
    			t7 = space();
    			p0 = element("p");
    			p0.textContent = "Monads in the Haskell Programming Language were inspired by Category Theory monads. The \"monads\" discussed herein are inspired by Haskell monads. Here's the definition of the simple monad described in this module:";
    			t9 = space();
    			pre0 = element("pre");
    			t10 = text(ctx.steve);
    			t11 = space();
    			p1 = element("p");
    			p1.textContent = "In the following expression:";
    			t13 = space();
    			pre1 = element("pre");
    			pre1.textContent = "Monad(6)(v=>v+7)(v=>v*4)(v=>v-10)(\"stop\") // 42";
    			t15 = space();
    			p2 = element("p");
    			p2.textContent = "The expression \"Monad(6)\" creates a closure whose outer function contains \"x\" (initially equal to 6) and whose inner function \"foo\" is confined to the scope of the anonymous outer function.  whose scope is  returns \"foo\"; \"foo(v=>v+7) returns \"foo\" while also mutating \"x\" in its outer scope, making it 13. \"foo(v=>v*4) changes x to 52 and returns \"foo\". \"foo(v=>v-10)\" returns \"foo\" while mutating x again, making it 42. Finally, the expression \"foo('stop')\" causes foo to return the number 42.";
    			t17 = space();
    			p3 = element("p");
    			p3.textContent = "As in the Haskell programming language, the monads described above encapsulate sequences of computations. The similarity is greater when we avoid mutation, as we do in some of the more-complex definitions of \"Monad\" (or whatever we decide to call it).";
    			t19 = space();
    			p4 = element("p");
    			p4.textContent = "Anonymous monads never interfere with other monads. The demonstration below illustrates this by running seven anonymous monads in rapid succession. The number you enter is \"num\" in";
    			t21 = space();
    			t22 = text(ctx.bonadsD);
    			t23 = space();
    			input = element("input");
    			t24 = space();
    			p5 = element("p");
    			t25 = text("num is ");
    			t26 = text(ctx.num);
    			t27 = text(" so bonads(num) returns ");
    			t28 = text(t28_value);
    			t29 = space();
    			span3 = element("span");
    			span3.textContent = "Named monads retain their values, even after they encounter \"stop\" and return the value of x held in the Monad closure. The following examples illustrate this:";
    			t31 = space();
    			pre2 = element("pre");
    			t32 = text(ctx.axe);
    			add_location(br, file, 112, 1, 2488);
    			attr(span0, "class", "tao svelte-1dr4x6t");
    			add_location(span0, file, 113, 1, 2494);
    			set_style(span1, "font-style", "italic");
    			add_location(span1, file, 114, 0, 2758);
    			add_location(span2, file, 115, 0, 2813);
    			add_location(p0, file, 116, 0, 2897);
    			add_location(pre0, file, 117, 0, 3120);
    			add_location(p1, file, 119, 0, 3140);
    			add_location(pre1, file, 120, 0, 3178);
    			add_location(p2, file, 121, 0, 3239);
    			add_location(p3, file, 122, 0, 3744);
    			add_location(p4, file, 126, 0, 4008);
    			attr(input, "id", "one");
    			attr(input, "type", "number");
    			add_location(input, file, 128, 0, 4208);
    			add_location(p5, file, 129, 0, 4281);
    			attr(span3, "class", "tao svelte-1dr4x6t");
    			add_location(span3, file, 131, 0, 4341);
    			add_location(pre2, file, 132, 0, 4528);

    			dispose = [
    				listen(input, "input", ctx.input_input_handler),
    				listen(input, "input", ctx.bonads)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, t0, anchor);
    			insert(target, br, anchor);
    			insert(target, t1, anchor);
    			insert(target, span0, anchor);
    			insert(target, t3, anchor);
    			insert(target, span1, anchor);
    			insert(target, t5, anchor);
    			insert(target, span2, anchor);
    			insert(target, t7, anchor);
    			insert(target, p0, anchor);
    			insert(target, t9, anchor);
    			insert(target, pre0, anchor);
    			append(pre0, t10);
    			insert(target, t11, anchor);
    			insert(target, p1, anchor);
    			insert(target, t13, anchor);
    			insert(target, pre1, anchor);
    			insert(target, t15, anchor);
    			insert(target, p2, anchor);
    			insert(target, t17, anchor);
    			insert(target, p3, anchor);
    			insert(target, t19, anchor);
    			insert(target, p4, anchor);
    			insert(target, t21, anchor);
    			insert(target, t22, anchor);
    			insert(target, t23, anchor);
    			insert(target, input, anchor);

    			set_input_value(input, ctx.num);

    			insert(target, t24, anchor);
    			insert(target, p5, anchor);
    			append(p5, t25);
    			append(p5, t26);
    			append(p5, t27);
    			append(p5, t28);
    			insert(target, t29, anchor);
    			insert(target, span3, anchor);
    			insert(target, t31, anchor);
    			insert(target, pre2, anchor);
    			append(pre2, t32);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			{
    				if (!if_block) {
    					if_block = create_if_block();
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t0.parentNode, t0);
    				} else {
    									transition_in(if_block, 1);
    				}
    			}

    			if (changed.num) set_input_value(input, ctx.num);

    			if (!current || changed.num) {
    				set_data(t26, ctx.num);
    			}

    			if ((!current || changed.num) && t28_value !== (t28_value = ctx.bonads(ctx.num) + "")) {
    				set_data(t28, t28_value);
    			}
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

    			if (detaching) {
    				detach(t0);
    				detach(br);
    				detach(t1);
    				detach(span0);
    				detach(t3);
    				detach(span1);
    				detach(t5);
    				detach(span2);
    				detach(t7);
    				detach(p0);
    				detach(t9);
    				detach(pre0);
    				detach(t11);
    				detach(p1);
    				detach(t13);
    				detach(pre1);
    				detach(t15);
    				detach(p2);
    				detach(t17);
    				detach(p3);
    				detach(t19);
    				detach(p4);
    				detach(t21);
    				detach(t22);
    				detach(t23);
    				detach(input);
    				detach(t24);
    				detach(p5);
    				detach(t29);
    				detach(span3);
    				detach(t31);
    				detach(pre2);
    			}

    			run_all(dispose);
    		}
    	};
    }

    function Monad (x) {
    return function foo (func) {
      if (func === "stop") return x
      else  {
        x = func(x);
        return foo;
      }
    };
    }

    function instance($$self, $$props, $$invalidate) {

    let bonadsD = `function bonads(num) {
return [Monad(num)(sum(7))(prod(4))(v=>v-10)("stop"),
Monad(num-1)(sum(7))(prod(4))(v=>v-10)("stop"),
Monad(num-2)(sum(7))(prod(4))(v=>v-10)("stop"),
Monad(num-3)(sum(7))(prod(4))(v=>v-10)("stop"),
Monad(num-2)(sum(7))(prod(4))(v=>v-10)("stop"),
Monad(num-1)(sum(7))(prod(4))(v=>v-10)("stop"),
Monad(num-0)(sum(7))(prod(4))(v=>v-10)("stop")]}`;

    let axe = `
let mon = Monad(3);
let a = mon(x=>x**3)(x=>x+3)(x=>x**2)("stop");
console.log("a is", a)  // a is 900`;

    let steve = `function Monad (x) {
  return function foo (func) {
    if (func === "stop") return x
    else  {
      x = func(x);
      return foo;
    }
  };
}`;

    const prod = a => b => a*b;
    const sum = a => b => a+b;

    let num = 6;

    let bonads = function bonads(num) {
    return [Monad(num)(sum(7))(prod(4))(v=>v-10)("stop"),
    Monad(num-1)(sum(7))(prod(4))(v=>v-10)("stop"),
    Monad(num-2)(sum(7))(prod(4))(v=>v-10)("stop"),
    Monad(num-3)(sum(7))(prod(4))(v=>v-10)("stop"),
    Monad(num-2)(sum(7))(prod(4))(v=>v-10)("stop"),
    Monad(num-1)(sum(7))(prod(4))(v=>v-10)("stop"),
    Monad(num-0)(sum(7))(prod(4))(v=>v-10)("stop")]};


    let mona = bonads(num);
    console.log(mona);

    console.log("num is", num);

    	function input_input_handler() {
    		num = to_number(this.value);
    		$$invalidate('num', num);
    	}

    	return {
    		bonadsD,
    		axe,
    		steve,
    		num,
    		bonads,
    		input_input_handler
    	};
    }

    class Monad_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, []);
    	}
    }

    /* src/Monad2.svelte generated by Svelte v3.9.1 */

    const file$1 = "src/Monad2.svelte";

    // (308:0) {#if j === 2}
    function create_if_block$1(ctx) {
    	var div_1, div_1_transition, current;

    	return {
    		c: function create() {
    			div_1 = element("div");
    			div_1.textContent = "ASYNCHRONOUSLY CREATED STATE";
    			set_style(div_1, "font-family", "Times New Roman");
    			set_style(div_1, "text-align", "center");
    			set_style(div_1, "color", "hsl(210, 90%, 90%)");
    			set_style(div_1, "font-size", "38px");
    			add_location(div_1, file$1, 308, 1, 5867);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div_1, anchor);
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
    			if (detaching) {
    				detach(div_1);
    				if (div_1_transition) div_1_transition.end();
    			}
    		}
    	};
    }

    function create_fragment$1(ctx) {
    	var t0, br0, t1, p0, t3, br1, t4, div0, t6, div1, t7_value = ctx.O.c0 + "", t7, t8, t9_value = ctx.O.c1 + "", t9, t10, t11_value = ctx.O.c2 + "", t11, t12, br2, t13, span0, t15, span1, t16, t17_value = ctx.O.d0.join(', ') + "", t17, t18, t19_value = ctx.O.d1.join(', ') + "", t19, t20, t21_value = ctx.O.d2.join(', ') + "", t21, t22, t23, br3, t24, br4, t25, button, pre0, t26, t27, br5, br6, br7, t28, div2, t29, t30_value = ctx.O.d0 + "", t30, t31, t32_value = ctx.O.c0 + "", t32, t33, span2, t34_value = ctx.O.d0.reduce(func) == ctx.O.c0 + "", t34, t35, br8, t36, t37_value = ctx.O.d1 + "", t37, t38, t39_value = ctx.O.c1 + "", t39, t40, span3, t41_value = ctx.O.d1.reduce(func_1) == ctx.O.c1 + "", t41, t42, br9, t43, t44_value = ctx.O.d2 + "", t44, t45, t46_value = ctx.O.c2 + "", t46, t47, span4, t48_value = ctx.O.d2.reduce(func_2) == ctx.O.c2 + "", t48, t49, br10, t50, p1, t52, pre1, t53, t54, p2, pre2, t56, t57, p3, pre3, t59, t60, p4, t62, br11, t63, span5, t65, a, current, dispose;

    	var if_block =  create_if_block$1();

    	return {
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
    			t26 = text(ctx.candle);
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
    			t53 = text(ctx.mon);
    			t54 = space();
    			p2 = element("p");
    			p2.textContent = "Messages are sent to the Haskell WebSockets server requesting pseudo-random numbers between 1 and the integer specified at the end of the request. On the server, randomR from the System.Random library produces a number which is sent to the browser with prefix \"BE#$42\". Messages from the server are parsed in socket.onmessage. If the prefix is \"BE#$42\", the payload (a number) is sent to worker_OO, which sends back the number's prime decomposition.\n";
    			pre2 = element("pre");
    			t56 = text(ctx.onmessServer);
    			t57 = space();
    			p3 = element("p");
    			p3.textContent = "Messages from the web worker are processed in worker_OO.onmessage\n";
    			pre3 = element("pre");
    			t59 = text(ctx.onmessWorker);
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
    			add_location(br0, file$1, 313, 0, 6037);
    			add_location(p0, file$1, 314, 0, 6042);
    			add_location(br1, file$1, 315, 1, 6443);
    			set_style(div0, "color", "#BBBBFF");
    			set_style(div0, "font-size", "20px");
    			add_location(div0, file$1, 321, 0, 6453);
    			set_style(div1, "color", "#FFFFCD");
    			set_style(div1, "font-size", "20px");
    			add_location(div1, file$1, 322, 0, 6581);
    			add_location(br2, file$1, 325, 0, 6667);
    			set_style(span0, "color", "#CDCDFF");
    			set_style(span0, "font-size", "20px");
    			add_location(span0, file$1, 326, 0, 6672);
    			set_style(span1, "color", "#FFFFCD");
    			set_style(span1, "font-size", "20px");
    			add_location(span1, file$1, 327, 0, 6811);
    			add_location(br3, file$1, 329, 0, 6934);
    			add_location(br4, file$1, 330, 0, 6939);
    			add_location(pre0, file$1, 332, 0, 6974);
    			attr(button, "class", "svelte-14lwxew");
    			add_location(button, file$1, 331, 0, 6944);
    			add_location(br5, file$1, 335, 0, 7005);
    			add_location(br6, file$1, 335, 4, 7009);
    			add_location(br7, file$1, 335, 8, 7013);
    			set_style(span2, "font-size", "24px");
    			set_style(span2, "color", "#FF0B0B");
    			add_location(span2, file$1, 340, 41, 7111);
    			add_location(br8, file$1, 341, 0, 7201);
    			set_style(span3, "font-size", "24px");
    			set_style(span3, "color", "#FF0B0B");
    			add_location(span3, file$1, 342, 41, 7247);
    			add_location(br9, file$1, 343, 0, 7337);
    			set_style(span4, "font-size", "24px");
    			set_style(span4, "color", "#FF0B0B");
    			add_location(span4, file$1, 344, 41, 7383);
    			add_location(br10, file$1, 345, 0, 7473);
    			set_style(div2, "color", "#FFFFCD");
    			set_style(div2, "font-size", "20px");
    			add_location(div2, file$1, 339, 0, 7021);
    			add_location(p1, file$1, 350, 0, 7488);
    			add_location(pre1, file$1, 352, 0, 7663);
    			add_location(p2, file$1, 354, 0, 7681);
    			add_location(pre2, file$1, 355, 0, 8135);
    			add_location(p3, file$1, 356, 0, 8161);
    			add_location(pre3, file$1, 357, 0, 8231);
    			add_location(p4, file$1, 358, 0, 8257);
    			add_location(br11, file$1, 359, 0, 8411);
    			add_location(span5, file$1, 360, 0, 8416);
    			attr(a, "href", "https://github.com/dschalk/blog/");
    			attr(a, "target", "_blank");
    			add_location(a, file$1, 361, 0, 8474);
    			dispose = listen(button, "click", ctx.factors);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, t0, anchor);
    			insert(target, br0, anchor);
    			insert(target, t1, anchor);
    			insert(target, p0, anchor);
    			insert(target, t3, anchor);
    			insert(target, br1, anchor);
    			insert(target, t4, anchor);
    			insert(target, div0, anchor);
    			insert(target, t6, anchor);
    			insert(target, div1, anchor);
    			append(div1, t7);
    			append(div1, t8);
    			append(div1, t9);
    			append(div1, t10);
    			append(div1, t11);
    			insert(target, t12, anchor);
    			insert(target, br2, anchor);
    			insert(target, t13, anchor);
    			insert(target, span0, anchor);
    			insert(target, t15, anchor);
    			insert(target, span1, anchor);
    			append(span1, t16);
    			append(span1, t17);
    			append(span1, t18);
    			append(span1, t19);
    			append(span1, t20);
    			append(span1, t21);
    			append(span1, t22);
    			insert(target, t23, anchor);
    			insert(target, br3, anchor);
    			insert(target, t24, anchor);
    			insert(target, br4, anchor);
    			insert(target, t25, anchor);
    			insert(target, button, anchor);
    			append(button, pre0);
    			append(pre0, t26);
    			insert(target, t27, anchor);
    			insert(target, br5, anchor);
    			insert(target, br6, anchor);
    			insert(target, br7, anchor);
    			insert(target, t28, anchor);
    			insert(target, div2, anchor);
    			append(div2, t29);
    			append(div2, t30);
    			append(div2, t31);
    			append(div2, t32);
    			append(div2, t33);
    			append(div2, span2);
    			append(span2, t34);
    			append(div2, t35);
    			append(div2, br8);
    			append(div2, t36);
    			append(div2, t37);
    			append(div2, t38);
    			append(div2, t39);
    			append(div2, t40);
    			append(div2, span3);
    			append(span3, t41);
    			append(div2, t42);
    			append(div2, br9);
    			append(div2, t43);
    			append(div2, t44);
    			append(div2, t45);
    			append(div2, t46);
    			append(div2, t47);
    			append(div2, span4);
    			append(span4, t48);
    			append(div2, t49);
    			append(div2, br10);
    			insert(target, t50, anchor);
    			insert(target, p1, anchor);
    			insert(target, t52, anchor);
    			insert(target, pre1, anchor);
    			append(pre1, t53);
    			insert(target, t54, anchor);
    			insert(target, p2, anchor);
    			insert(target, pre2, anchor);
    			append(pre2, t56);
    			insert(target, t57, anchor);
    			insert(target, p3, anchor);
    			insert(target, pre3, anchor);
    			append(pre3, t59);
    			insert(target, t60, anchor);
    			insert(target, p4, anchor);
    			insert(target, t62, anchor);
    			insert(target, br11, anchor);
    			insert(target, t63, anchor);
    			insert(target, span5, anchor);
    			insert(target, t65, anchor);
    			insert(target, a, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			{
    				if (!if_block) {
    					if_block = create_if_block$1();
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t0.parentNode, t0);
    				} else {
    									transition_in(if_block, 1);
    				}
    			}

    			if ((!current || changed.O) && t7_value !== (t7_value = ctx.O.c0 + "")) {
    				set_data(t7, t7_value);
    			}

    			if ((!current || changed.O) && t9_value !== (t9_value = ctx.O.c1 + "")) {
    				set_data(t9, t9_value);
    			}

    			if ((!current || changed.O) && t11_value !== (t11_value = ctx.O.c2 + "")) {
    				set_data(t11, t11_value);
    			}

    			if ((!current || changed.O) && t17_value !== (t17_value = ctx.O.d0.join(', ') + "")) {
    				set_data(t17, t17_value);
    			}

    			if ((!current || changed.O) && t19_value !== (t19_value = ctx.O.d1.join(', ') + "")) {
    				set_data(t19, t19_value);
    			}

    			if ((!current || changed.O) && t21_value !== (t21_value = ctx.O.d2.join(', ') + "")) {
    				set_data(t21, t21_value);
    			}

    			if ((!current || changed.O) && t30_value !== (t30_value = ctx.O.d0 + "")) {
    				set_data(t30, t30_value);
    			}

    			if ((!current || changed.O) && t32_value !== (t32_value = ctx.O.c0 + "")) {
    				set_data(t32, t32_value);
    			}

    			if ((!current || changed.O) && t34_value !== (t34_value = ctx.O.d0.reduce(func) == ctx.O.c0 + "")) {
    				set_data(t34, t34_value);
    			}

    			if ((!current || changed.O) && t37_value !== (t37_value = ctx.O.d1 + "")) {
    				set_data(t37, t37_value);
    			}

    			if ((!current || changed.O) && t39_value !== (t39_value = ctx.O.c1 + "")) {
    				set_data(t39, t39_value);
    			}

    			if ((!current || changed.O) && t41_value !== (t41_value = ctx.O.d1.reduce(func_1) == ctx.O.c1 + "")) {
    				set_data(t41, t41_value);
    			}

    			if ((!current || changed.O) && t44_value !== (t44_value = ctx.O.d2 + "")) {
    				set_data(t44, t44_value);
    			}

    			if ((!current || changed.O) && t46_value !== (t46_value = ctx.O.c2 + "")) {
    				set_data(t46, t46_value);
    			}

    			if ((!current || changed.O) && t48_value !== (t48_value = ctx.O.d2.reduce(func_2) == ctx.O.c2 + "")) {
    				set_data(t48, t48_value);
    			}
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

    			if (detaching) {
    				detach(t0);
    				detach(br0);
    				detach(t1);
    				detach(p0);
    				detach(t3);
    				detach(br1);
    				detach(t4);
    				detach(div0);
    				detach(t6);
    				detach(div1);
    				detach(t12);
    				detach(br2);
    				detach(t13);
    				detach(span0);
    				detach(t15);
    				detach(span1);
    				detach(t23);
    				detach(br3);
    				detach(t24);
    				detach(br4);
    				detach(t25);
    				detach(button);
    				detach(t27);
    				detach(br5);
    				detach(br6);
    				detach(br7);
    				detach(t28);
    				detach(div2);
    				detach(t50);
    				detach(p1);
    				detach(t52);
    				detach(pre1);
    				detach(t54);
    				detach(p2);
    				detach(pre2);
    				detach(t57);
    				detach(p3);
    				detach(pre3);
    				detach(t60);
    				detach(p4);
    				detach(t62);
    				detach(br11);
    				detach(t63);
    				detach(span5);
    				detach(t65);
    				detach(a);
    			}

    			dispose();
    		}
    	};
    }

    function func(a,b) {
    	return a*b;
    }

    function func_1(a,b) {
    	return a*b;
    }

    function func_2(a,b) {
    	return a*b;
    }

    function instance$1($$self, $$props, $$invalidate) {

    var O = new Object();
    O.d0 = [2,3,4]; $$invalidate('O', O);
    O.d1 = [2,3,4]; $$invalidate('O', O);
    O.d2= [2,3,4]; $$invalidate('O', O);

    var M = -1;
    var Q = -1;

    O.generic = ["Nobody"]; $$invalidate('O', O);

    const Monad = function Monad ( AR = [], name = "generic", f_ = mFunc  )  {
    let ar = AR.slice();
    O[name] = ar; $$invalidate('O', O);
    let run;
    let x = O[name].pop();
    return run = (function run (x) {
    if (x != undefined && x === x  && x !== false
      && x.name !== "f_" && x.name !== "halt" ) {
        O[name] = O[name].concat(x); $$invalidate('O', O);
      }  return f_;
    })(x);
    };

    var mFunc = function mFunc_ (func) {
        if (func === 'halt' || func === 'S') return O[name];
        else if (typeof func !== "function") p = func(x);
        else if (x instanceof Promise) p = x.then(v => func(v));
        return run(p);
      };

    /* let a0 = *Monad([3])(cube)
    (add(3))(square)(div(100))
    (sqrt)(()=>this)(halt); */

    // var socket = new WebSocket("ws://localhost:3055")
    var socket = new WebSocket("ws://167.71.168.53:3055");

    socket.onclose = function (event) {
    console.log('<><><> ALERT - socket is closing. <><><> ', event);
    };
    socket.onmessage = function(e) {
    // console.log("WebSocket message is", e);
    var v = e.data.split(',');
    if (v[0] === "BE#$42") {
      Q = Q + 1;
      Monad([v[3]], "c"+Q);
      if (Q === 2) Q = -1;
      worker_OO.postMessage([v[3]]);
    }
    };
    login();

    function login() {
    console.log('00000000000000000000000000000000 Entering login', socket.readyState);
    setTimeout(function () {
      if (socket.readyState === 1) {
        console.log('readyState is', socket.readyState);
        var v = Math.random().toString().substring(5);
        var v2 = v.toString().substring(2);
        var combo = v + '<o>' + v2;
        socket.send('CC#$42' + combo);
        // socket.send(`GZ#$42,solo,${v}`);
        socket.send("BE#$42,solo,name,10000");
        socket.send("BE#$42,solo,name,100000");
        socket.send("BE#$42,solo,name,1000");
      } else {
        login();
      }
    }, 200);
    }
    const factors = function factors () {
    socket.send("BE#$42,solo,name,10000");
    socket.send("BE#$42,solo,name,100000");
    socket.send("BE#$42,solo,name,1000");
    };

    var worker_OO = new Worker('worker_OO.js');

    worker_OO.onmessage = e => {
      M = M + 1;
      Monad([e.data], "d"+M);
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

    	$$self.$$.update = ($$dirty = { j: 1 }) => {
    		if ($$dirty.j) ;
    	};

    	return {
    		O,
    		factors,
    		mon,
    		onmessServer,
    		onmessWorker,
    		candle
    	};
    }

    class Monad2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, []);
    	}
    }

    /* src/Monad3.svelte generated by Svelte v3.9.1 */

    const file$2 = "src/Monad3.svelte";

    // (248:2) {#if j === 3}
    function create_if_block$2(ctx) {
    	var div2, div0, t_1, div1, div2_transition, current;

    	return {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "A MONAD FOR PROMISE MANIPULATION";
    			t_1 = space();
    			div1 = element("div");
    			div1.textContent = "Computations Easily Resumed and Branched";
    			set_style(div0, "font-size", "32px");
    			add_location(div0, file$2, 249, 0, 6083);
    			set_style(div1, "font-size", "22px");
    			add_location(div1, file$2, 250, 0, 6155);
    			set_style(div2, "font-family", "Times New Roman");
    			set_style(div2, "text-align", "center");
    			set_style(div2, "color", "hsl(210, 90%, 90%)");
    			add_location(div2, file$2, 248, 1, 5972);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, div0);
    			append(div2, t_1);
    			append(div2, div1);
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
    			if (detaching) {
    				detach(div2);
    				if (div2_transition) div2_transition.end();
    			}
    		}
    	};
    }

    function create_fragment$2(ctx) {
    	var t0, h20, t1, t2_value = ctx.O.test + "", t2, t3, h21, t4, t5_value = ctx.O.test_2 + "", t5, t6, br0, t7, span0, t9, br1, br2, t10, button0, pre0, t12, p0, t13, br3, t14, p1, t16, pre1, t17, t18, p2, t20, pre2, t21, t22, p3, t24, pre3, t25, t26, br4, t27, button1, pre4, t29, br5, t30, h22, t31, t32_value = ctx.O.test + "", t32, t33, h23, t34, t35_value = ctx.O.test_2 + "", t35, t36, br6, t37, br7, t38, span1, t40, span2, t42, span3, t44, br8, t45, br9, t46, br10, current, dispose;

    	var if_block =  create_if_block$2();

    	return {
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
    			t17 = text(ctx.mon);
    			t18 = space();
    			p2 = element("p");
    			p2.textContent = "After monads encounter \"halt\", they can use the function resume() to continue processing data where they left off and (2) they can branch off in new monads created by branch(). Here are the definitions:";
    			t20 = space();
    			pre2 = element("pre");
    			t21 = text(ctx.fs);
    			t22 = space();
    			p3 = element("p");
    			p3.textContent = "This is the statement that produces the observed results when \"START\" is clicked.";
    			t24 = space();
    			pre3 = element("pre");
    			t25 = text(ctx.code);
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
    			add_location(h20, file$2, 254, 2, 6252);
    			add_location(h21, file$2, 255, 2, 6282);
    			add_location(br0, file$2, 255, 46, 6326);
    			attr(span0, "class", "tao");
    			add_location(span0, file$2, 256, 2, 6333);
    			add_location(br1, file$2, 257, 2, 6564);
    			add_location(br2, file$2, 257, 6, 6568);
    			attr(pre0, "class", "svelte-41wco8");
    			add_location(pre0, file$2, 259, 56, 6630);
    			set_style(button0, "text-align", "left");
    			attr(button0, "class", "svelte-41wco8");
    			add_location(button0, file$2, 259, 2, 6576);
    			add_location(p0, file$2, 264, 0, 6874);
    			add_location(br3, file$2, 265, 2, 6886);
    			add_location(p1, file$2, 266, 2, 6893);
    			attr(pre1, "class", "svelte-41wco8");
    			add_location(pre1, file$2, 267, 2, 6943);
    			add_location(p2, file$2, 268, 2, 6962);
    			attr(pre2, "class", "svelte-41wco8");
    			add_location(pre2, file$2, 269, 2, 7175);
    			add_location(p3, file$2, 270, 2, 7193);
    			attr(pre3, "class", "svelte-41wco8");
    			add_location(pre3, file$2, 271, 2, 7286);
    			add_location(br4, file$2, 271, 46, 7330);
    			attr(pre4, "class", "svelte-41wco8");
    			add_location(pre4, file$2, 272, 56, 7391);
    			set_style(button1, "text-align", "left");
    			attr(button1, "class", "svelte-41wco8");
    			add_location(button1, file$2, 272, 2, 7337);
    			add_location(br5, file$2, 279, 2, 7639);
    			add_location(h22, file$2, 280, 2, 7646);
    			add_location(h23, file$2, 281, 2, 7676);
    			add_location(br6, file$2, 282, 2, 7710);
    			add_location(br7, file$2, 284, 2, 7718);
    			attr(span1, "class", "tao");
    			add_location(span1, file$2, 285, 2, 7725);
    			set_style(span2, "color", "#AAFFAA");
    			add_location(span2, file$2, 286, 2, 7778);
    			add_location(span3, file$2, 287, 2, 7853);
    			add_location(br8, file$2, 288, 2, 8197);
    			add_location(br9, file$2, 289, 2, 8204);
    			add_location(br10, file$2, 290, 2, 8211);

    			dispose = [
    				listen(button0, "click", ctx.start),
    				listen(button1, "click", ctx.start)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, t0, anchor);
    			insert(target, h20, anchor);
    			append(h20, t1);
    			append(h20, t2);
    			insert(target, t3, anchor);
    			insert(target, h21, anchor);
    			append(h21, t4);
    			append(h21, t5);
    			insert(target, t6, anchor);
    			insert(target, br0, anchor);
    			insert(target, t7, anchor);
    			insert(target, span0, anchor);
    			insert(target, t9, anchor);
    			insert(target, br1, anchor);
    			insert(target, br2, anchor);
    			insert(target, t10, anchor);
    			insert(target, button0, anchor);
    			append(button0, pre0);
    			insert(target, t12, anchor);
    			insert(target, p0, anchor);
    			insert(target, t13, anchor);
    			insert(target, br3, anchor);
    			insert(target, t14, anchor);
    			insert(target, p1, anchor);
    			insert(target, t16, anchor);
    			insert(target, pre1, anchor);
    			append(pre1, t17);
    			insert(target, t18, anchor);
    			insert(target, p2, anchor);
    			insert(target, t20, anchor);
    			insert(target, pre2, anchor);
    			append(pre2, t21);
    			insert(target, t22, anchor);
    			insert(target, p3, anchor);
    			insert(target, t24, anchor);
    			insert(target, pre3, anchor);
    			append(pre3, t25);
    			insert(target, t26, anchor);
    			insert(target, br4, anchor);
    			insert(target, t27, anchor);
    			insert(target, button1, anchor);
    			append(button1, pre4);
    			insert(target, t29, anchor);
    			insert(target, br5, anchor);
    			insert(target, t30, anchor);
    			insert(target, h22, anchor);
    			append(h22, t31);
    			append(h22, t32);
    			insert(target, t33, anchor);
    			insert(target, h23, anchor);
    			append(h23, t34);
    			append(h23, t35);
    			insert(target, t36, anchor);
    			insert(target, br6, anchor);
    			insert(target, t37, anchor);
    			insert(target, br7, anchor);
    			insert(target, t38, anchor);
    			insert(target, span1, anchor);
    			insert(target, t40, anchor);
    			insert(target, span2, anchor);
    			insert(target, t42, anchor);
    			insert(target, span3, anchor);
    			insert(target, t44, anchor);
    			insert(target, br8, anchor);
    			insert(target, t45, anchor);
    			insert(target, br9, anchor);
    			insert(target, t46, anchor);
    			insert(target, br10, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			{
    				if (!if_block) {
    					if_block = create_if_block$2();
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t0.parentNode, t0);
    				} else {
    									transition_in(if_block, 1);
    				}
    			}

    			if ((!current || changed.O) && t2_value !== (t2_value = ctx.O.test + "")) {
    				set_data(t2, t2_value);
    			}

    			if ((!current || changed.O) && t5_value !== (t5_value = ctx.O.test_2 + "")) {
    				set_data(t5, t5_value);
    			}

    			if ((!current || changed.O) && t32_value !== (t32_value = ctx.O.test + "")) {
    				set_data(t32, t32_value);
    			}

    			if ((!current || changed.O) && t35_value !== (t35_value = ctx.O.test_2 + "")) {
    				set_data(t35, t35_value);
    			}
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

    			if (detaching) {
    				detach(t0);
    				detach(h20);
    				detach(t3);
    				detach(h21);
    				detach(t6);
    				detach(br0);
    				detach(t7);
    				detach(span0);
    				detach(t9);
    				detach(br1);
    				detach(br2);
    				detach(t10);
    				detach(button0);
    				detach(t12);
    				detach(p0);
    				detach(t13);
    				detach(br3);
    				detach(t14);
    				detach(p1);
    				detach(t16);
    				detach(pre1);
    				detach(t18);
    				detach(p2);
    				detach(t20);
    				detach(pre2);
    				detach(t22);
    				detach(p3);
    				detach(t24);
    				detach(pre3);
    				detach(t26);
    				detach(br4);
    				detach(t27);
    				detach(button1);
    				detach(t29);
    				detach(br5);
    				detach(t30);
    				detach(h22);
    				detach(t33);
    				detach(h23);
    				detach(t36);
    				detach(br6);
    				detach(t37);
    				detach(br7);
    				detach(t38);
    				detach(span1);
    				detach(t40);
    				detach(span2);
    				detach(t42);
    				detach(span3);
    				detach(t44);
    				detach(br8);
    				detach(t45);
    				detach(br9);
    				detach(t46);
    				detach(br10);
    			}

    			run_all(dispose);
    		}
    	};
    }

    function wait$1(ms) {
        return new Promise(r => setTimeout(r, ms));
      }

    async function squareP (x) {
          await wait$1(100);
          return x*x;
        }

    async function cubeP (x) {
          await wait$1(300);
          return x*x*x;
        }

    async function sqrtP (x) {
          await wait$1(900);
          return x**(1/2)
        }

    function instance$2($$self, $$props, $$invalidate) {

          let divP = a => async b => {
            await wait$1 (300);
            return b/a;
          };

          let addP = x => async y => {
            await wait$1(900);
            return x + y;
          };

          let multP = x => async y => {
            await wait$1(300);
            return x * y;
          };

        let O = new Object();

        let Monad = function Monad ( AR = [], name = "generic" )  {
          let p, run, f_;
          let  ar = AR.slice();
          O[name] = ar; $$invalidate('O', O);
          let x = O[name].pop();
          return run = (function run (x) {
            if (x instanceof Promise) x.then(y => {
              if (typeof y != "undefined" && y == y && y.name !== "f_") {
              O[name] = O[name].concat(y); $$invalidate('O', O);
              }
            });
            if (!(x instanceof Promise)) {
                if (x != undefined && x == x) {
                  O[name] = O[name].concat(x); $$invalidate('O', O);
                }
            }
            f_ = function f_ (func) {
              if (func === 'halt' || func === 'S') return O[name].slice();
              else if (typeof func !== "function") p = func;
              else if (x instanceof Promise) p = x.then(v => func(v));
              else p = func(x);
              return run(p);
            };
            return f_;
          })(x);
        };

        let branch = function branch (s,s2) {return Monad(O[s].slice()  , s2)};
        let resume = function resume (s) {return Monad(O[s], s)};

      /*  Monad([2], "test")(addP(1))(cubeP)(addP(3))(squareP)(divP(100))
        (() => branch("test", "test_2")(sqrtP)(cubeP)(()=>addP(O.test_2[2])
        (O.test_2[1]))(squareP)(divP(100))(sqrtP)(multP(14))
        (() => resume("test")(multP(4))(addP(6)))) */


      let mon = `   let Monad = function Monad ( AR = [], name = "generic"  )  {
      let f_, p, run;
      let ar = AR.slice();
      let name = name;
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

        let lok = false;

        let start = function start () {
          if (!lok) {
            lok = true;
            setTimeout(() => { const $$result = lok = false; return $$result; },3000 );
            $$invalidate('O', O = {});
            Monad([2], "test")(addP(1))(cubeP)(addP(3))(squareP)(divP(100))
            (() => branch("test", "test_2")(sqrtP)(cubeP)(()=>addP(O.test_2[2])
            (O.test_2[1]))(squareP)(divP(100))(sqrtP)(multP(14))
            (() => resume("test")(multP(4))(addP(6)))); }
          else {
            setTimeout(() => start(),300);
          }
        };

      let fs = `   let branch = function branch (s,s2) {return Monad(O[s].slice(-1)  , s2)}
    let resume = function resume (s) {return Monad(O[s], s)}`;
      let code = `    Monad([2], "test")(addP(1))(cubeP)(addP(3))(squareP)(divP(100))
      (() => branch("test", "test_2")(sqrtP)(cubeP)(()=>addP(O.test_2[2])
      (O.test_2[1]))(squareP)(divP(100))(sqrtP)(multP(14))
      (() => resume("test")(multP(4))(addP(6))))`;

    	$$self.$$.update = ($$dirty = { j: 1, O: 1, M: 1, N: 1, T: 1, Q: 1, lock: 1 }) => {
    		if ($$dirty.j) ;
    		if ($$dirty.O) ;
    		if ($$dirty.M) ;
    		if ($$dirty.N) ;
    		if ($$dirty.T) ;
    		if ($$dirty.Q) ;
    		if ($$dirty.lock) ;
    	};

    	return { O, mon, start, fs, code };
    }

    class Monad3 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, []);
    	}
    }

    /* src/Monad5.svelte generated by Svelte v3.9.1 */

    const file$3 = "src/Monad5.svelte";

    // (408:2) {#if j === 3}
    function create_if_block$3(ctx) {
    	var div2, div0, t_1, div1, div2_transition, current;

    	return {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "MORE PROMISE MANIPULATION";
    			t_1 = space();
    			div1 = element("div");
    			div1.textContent = "Computations Easily Resumed and Branched";
    			set_style(div0, "font-size", "32px");
    			add_location(div0, file$3, 409, 0, 8567);
    			set_style(div1, "font-size", "22px");
    			add_location(div1, file$3, 410, 0, 8632);
    			set_style(div2, "font-family", "Times New Roman");
    			set_style(div2, "text-align", "center");
    			set_style(div2, "color", "hsl(210, 90%, 90%)");
    			add_location(div2, file$3, 408, 1, 8456);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, div0);
    			append(div2, t_1);
    			append(div2, div1);
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
    			if (detaching) {
    				detach(div2);
    				if (div2_transition) div2_transition.end();
    			}
    		}
    	};
    }

    function create_fragment$3(ctx) {
    	var t0, br0, t1, p0, t3, p1, t5, button, t7, h30, t8, t9, t10, h31, t11, t12_value = ctx.B[ctx.sym1] + "", t12, t13, h32, t14, t15_value = ctx.B[ctx.sym2] + "", t15, t16, h33, t17, t18_value = ctx.B[ctx.sym3] + "", t18, t19, p2, t21, pre0, t22, t23, pre1, t24, t25, pre2, t26, t27, pre3, t28, t29, br1, t30, br2, t31, p3, t32, br3, current, dispose;

    	var if_block =  create_if_block$3();

    	return {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			br0 = element("br");
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "The ES6 Promises API doesn't provide a way to access prior Promise resolution values in chains of composed procedures or in units of state saved for possible future use. In the previous module, Monad() instances saved their array payloads in the object \"O\". By the naming convention, for any array \"O.ar\" in \"O\", \"ar = Monad(O.ar)\" reactivates the Monad() instance \"ar\" and \"ar2 = Monad(O.ar)\" initiates a branch.";
    			t3 = space();
    			p1 = element("p");
    			p1.textContent = "In this module, the object \"B\" contains the functions returned by instances of \"Mona()\", defined below. Instances of Mona() close over a function named \"f_\", giving f_() access to the array held in Mona() instance that spawned it. These little functions name \"f_\" have unique keys in \"B\", and can resume activity under their original names (corresponding to their keys) or initiate new branches. Clicking the button below calls start() which runs test_3() after any previously queued runs have finished .";
    			t5 = space();
    			button = element("button");
    			button.textContent = "test_3()";
    			t7 = space();
    			h30 = element("h3");
    			t8 = text("lok is ");
    			t9 = text(ctx.lok);
    			t10 = space();
    			h31 = element("h3");
    			t11 = text("B[sym1] is ");
    			t12 = text(t12_value);
    			t13 = space();
    			h32 = element("h3");
    			t14 = text("B[sym2] is ");
    			t15 = text(t15_value);
    			t16 = space();
    			h33 = element("h3");
    			t17 = text("B[sym3] is ");
    			t18 = text(t18_value);
    			t19 = space();
    			p2 = element("p");
    			p2.textContent = "Symbols are used as names and as the second parameter of Mona(). Mona() instances in object \"A\" populate and update object B with their arrays. Mona() instances in \"A\" and their arrays in \"B\" have identical object keys.";
    			t21 = space();
    			pre0 = element("pre");
    			t22 = text(ctx.syms);
    			t23 = space();
    			pre1 = element("pre");
    			t24 = text(ctx.t_3);
    			t25 = space();
    			pre2 = element("pre");
    			t26 = text(ctx.code);
    			t27 = space();
    			pre3 = element("pre");
    			t28 = text(ctx.funcs);
    			t29 = space();
    			br1 = element("br");
    			t30 = space();
    			br2 = element("br");
    			t31 = space();
    			p3 = element("p");
    			t32 = space();
    			br3 = element("br");
    			add_location(br0, file$3, 413, 2, 8728);
    			add_location(p0, file$3, 414, 0, 8733);
    			add_location(p1, file$3, 415, 0, 9156);
    			set_style(button, "text-align", "left");
    			attr(button, "class", "svelte-77grfh");
    			add_location(button, file$3, 417, 0, 9671);
    			add_location(h30, file$3, 421, 0, 9748);
    			add_location(h31, file$3, 422, 0, 9770);
    			add_location(h32, file$3, 423, 0, 9802);
    			add_location(h33, file$3, 424, 0, 9834);
    			add_location(p2, file$3, 426, 0, 9867);
    			set_style(pre0, "font-size", "18");
    			attr(pre0, "class", "svelte-77grfh");
    			add_location(pre0, file$3, 428, 0, 10096);
    			set_style(pre1, "font-size", "18");
    			attr(pre1, "class", "svelte-77grfh");
    			add_location(pre1, file$3, 429, 0, 10138);
    			set_style(pre2, "font-size", "18");
    			attr(pre2, "class", "svelte-77grfh");
    			add_location(pre2, file$3, 430, 0, 10180);
    			set_style(pre3, "font-size", "18");
    			attr(pre3, "class", "svelte-77grfh");
    			add_location(pre3, file$3, 431, 0, 10222);
    			add_location(br1, file$3, 434, 2, 10269);
    			add_location(br2, file$3, 436, 2, 10277);
    			add_location(p3, file$3, 439, 2, 10287);
    			add_location(br3, file$3, 442, 2, 10303);
    			dispose = listen(button, "click", ctx.start);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, t0, anchor);
    			insert(target, br0, anchor);
    			insert(target, t1, anchor);
    			insert(target, p0, anchor);
    			insert(target, t3, anchor);
    			insert(target, p1, anchor);
    			insert(target, t5, anchor);
    			insert(target, button, anchor);
    			insert(target, t7, anchor);
    			insert(target, h30, anchor);
    			append(h30, t8);
    			append(h30, t9);
    			insert(target, t10, anchor);
    			insert(target, h31, anchor);
    			append(h31, t11);
    			append(h31, t12);
    			insert(target, t13, anchor);
    			insert(target, h32, anchor);
    			append(h32, t14);
    			append(h32, t15);
    			insert(target, t16, anchor);
    			insert(target, h33, anchor);
    			append(h33, t17);
    			append(h33, t18);
    			insert(target, t19, anchor);
    			insert(target, p2, anchor);
    			insert(target, t21, anchor);
    			insert(target, pre0, anchor);
    			append(pre0, t22);
    			insert(target, t23, anchor);
    			insert(target, pre1, anchor);
    			append(pre1, t24);
    			insert(target, t25, anchor);
    			insert(target, pre2, anchor);
    			append(pre2, t26);
    			insert(target, t27, anchor);
    			insert(target, pre3, anchor);
    			append(pre3, t28);
    			insert(target, t29, anchor);
    			insert(target, br1, anchor);
    			insert(target, t30, anchor);
    			insert(target, br2, anchor);
    			insert(target, t31, anchor);
    			insert(target, p3, anchor);
    			insert(target, t32, anchor);
    			insert(target, br3, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			{
    				if (!if_block) {
    					if_block = create_if_block$3();
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t0.parentNode, t0);
    				} else {
    									transition_in(if_block, 1);
    				}
    			}

    			if (!current || changed.lok) {
    				set_data(t9, ctx.lok);
    			}

    			if ((!current || changed.B) && t12_value !== (t12_value = ctx.B[ctx.sym1] + "")) {
    				set_data(t12, t12_value);
    			}

    			if ((!current || changed.B) && t15_value !== (t15_value = ctx.B[ctx.sym2] + "")) {
    				set_data(t15, t15_value);
    			}

    			if ((!current || changed.B) && t18_value !== (t18_value = ctx.B[ctx.sym3] + "")) {
    				set_data(t18, t18_value);
    			}
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

    			if (detaching) {
    				detach(t0);
    				detach(br0);
    				detach(t1);
    				detach(p0);
    				detach(t3);
    				detach(p1);
    				detach(t5);
    				detach(button);
    				detach(t7);
    				detach(h30);
    				detach(t10);
    				detach(h31);
    				detach(t13);
    				detach(h32);
    				detach(t16);
    				detach(h33);
    				detach(t19);
    				detach(p2);
    				detach(t21);
    				detach(pre0);
    				detach(t23);
    				detach(pre1);
    				detach(t25);
    				detach(pre2);
    				detach(t27);
    				detach(pre3);
    				detach(t29);
    				detach(br1);
    				detach(t30);
    				detach(br2);
    				detach(t31);
    				detach(p3);
    				detach(t32);
    				detach(br3);
    			}

    			dispose();
    		}
    	};
    }

    function wait$2(ms) {
    return new Promise(r => setTimeout(r, ms));
    }

    async function squareP$1 (x) {
    await wait$2(300);
    return x*x;
    }

    async function cubeP$1 (x) {
    await wait$2(300);
    return x*x*x;
    }

    async function idP (x) {
    await wait$2(900);
    return x;
    }

    function instance$3($$self, $$props, $$invalidate) {

    let divP = a => async b => {
      await wait$2 (300);
      return b/a;
    };

    let doubleP = async a => {
      await wait$2 (300);
      return a+a;
    };

    let addP = x => async y => {
      await wait$2(900);
      return parseInt(x,10) + parseInt(y,10);
    };

    let multP = x => async y => {
      await wait$2(300);
      return x * y;
    };

    const sym1 = Symbol('sym1');
    const sym2 = Symbol('sym2');
    const sym3 = Symbol('sym3');

    let B = {};
    B[sym1] = []; $$invalidate('B', B);
    B[sym2] = []; $$invalidate('B', B);
    B[sym3] = []; $$invalidate('B', B);
    let Mona = function Mona ( AR = [], ar = [] )  {  
      let p, run, f_;
      B[ar] = AR.slice(); $$invalidate('B', B);
      let x = B[ar].slice(-1)[0] ;
      return run = (function run (x) {
      if (x instanceof Promise) {x.then(y => {
        if (!( y.name == "f_" || y == lok || y == NaN || y == undefined ||
          typeof y == "undefined" || y != y  ) ){B[ar] = B[ar].concat(y); $$invalidate('B', B);}
        else if (!(x.name == "f_" || x == lok || x instanceof Promise ||
          x == undefined || x == NaN)) {B[ar] = B[ar].concat(x); $$invalidate('B', B);
      }   }  );  }
        f_ = function f_ (func) {
          console.log("B[ar] is", B[ar]);
          if (func === 'halt' || func === 'h' || func == undefined ||
            typeof func == "undefined" || func == NaN ) {
            $$invalidate('B', B); 
            return B[ar].slice();
          }
          if (typeof func == "function" && x instanceof Promise) p = x.then(v => func(v));
          else if (typeof func != "function" && x instanceof Promise) p = x.then(v => v);
          else if (typeof func != "function") p = func;
          else p = func(x);
          return run(p);
        };
        return f_;
      })(x);
    };

      const A = {};

      A[sym1] = Mona([0], sym1);  A[sym2] = Mona([], sym2);  A[sym3] = Mona([], sym3);
    function test_3 () {
      $$invalidate('lok', lok = true);
      A[sym1] = Mona([0], sym1);  A[sym2] = Mona( [], sym2);  A[sym3] = Mona([], sym3);  A[sym1](addP(3))(cubeP$1)(addP(3))(squareP$1)(divP(100))(() => 
        branch(sym2,sym1)(idP)(squareP$1)(divP(27))(multP(7))(doubleP)(() => 
          branch(sym3,sym2)(idP)(() => B[sym1][1]+B[sym1][2]+B[sym1][3])
          (divP(10))(multP(7))(()=>2+3+4+5)(multP(3))(() => 
            branch(sym1,sym2)(divP(7))(addP(8))(multP(3))
            (() => B[sym1].reduce((a,b) => a+b))
            (addP(-23))(divP(24))(() => { const $$result = lok = false; $$invalidate('lok', lok); return $$result; })
          )
        )
      );  
    }

    function branch (a, b) {  // Transfers a copy of the last item in A[b] to A[a]
      let c = A[b]().slice(-1);
      return A[a](c);
    }

    let lok = false;

    function start () {
      if (!lok) {
        console.log("lok is false -- calling test_3");
        test_3();
      }
      else {
        console.log("lok is true -- setTimeout 300");
        setTimeout(() => start(),300);
      }
    }
    start();

    // let resume = function resume (s) {return Mona(A[s])}

    let syms = `const sym1 = Symbol('sym1');
const sym2 = Symbol('sym2');
const sym3 = Symbol('sym3');`;

    let t_3 = `function test_3 () {
  lok = true;
  A[sym1] = Mona([0], sym1);
  A[sym2] = Mona( [], sym2);
  A[sym3] = Mona([], sym3);
  A[sym1](addP(3))(cubeP)(addP(3))(squareP)(divP(100))(() => 
    branch(sym2,sym1)(idP)(squareP)(divP(27))(multP(7))(doubleP)(() => 
      branch(sym3,sym2)(idP)(() => B[sym1][1]+B[sym1][2]+B[sym1][3])
      (divP(10))(multP(7))(()=>2+3+4+5)(multP(3))(() => 
        branch(sym1,sym2)(divP(7))(addP(8))(multP(3))(() => B[sym1].reduce((a,b) => a+b))
        (addP(-23))(divP(24))(() => lok = false)
      )
    )
  )  
} `;
    let code = `let B = {};
B[sym1] = [];
B[sym2] = [];
B[sym3] = [];

$: B;

let Mona = function Mona ( AR = [], ar = [] )  {  
  let p, run, f_;
  B[ar] = AR.slice();
  let x = B[ar].slice(-1)[0] ;
  return run = (function run (x) {
  if (x instanceof Promise) {x.then(y => {
    if (!( y.name == "f_" || y == lok || y == NaN || y == undefined || 
    typeof y == "undefined" || y != y  ) ){B[ar] = B[ar].concat(y)}
    else if (!(x.name == "f_" || x == lok || x instanceof Promise || x == undefined ||
     x == NaN)) {B[ar] = B[ar].concat(x);
  }   }  )  }
    f_ = function f_ (func) {
      console.log("B[ar] is", B[ar]);
      if (func === 'halt' || func === 'h' || func == undefined ||
       typeof func == "undefined" || func == NaN ) {
        B[ar] = B[ar]; 
        return B[ar].slice();
      }
      if (typeof func == "function" && x instanceof Promise) p = x.then(v => func(v))
      else if (typeof func != "function" && x instanceof Promise) p = x.then(v => v)
      else if (typeof func != "function") p = func
      else p = func(x);
      return run(p);
    };
    return f_;
  })(x);
}

  const A = {};

  A[sym1] = Mona([0], sym1);
  A[sym2] = Mona([], sym2);
  A[sym3] = Mona([], sym3);

  $: B[sym1];
  $: B[sym2];

function test_3 () {
  lok = true;
  A[sym1] = Mona([0], sym1);
  A[sym2] = Mona( [], sym2);
  A[sym3] = Mona([], sym3);
  A[sym1](addP(3))(cubeP)(addP(3))(squareP)(divP(100))(() => 
    branch(sym2,sym1)(idP)(squareP)(divP(27))(multP(7))(doubleP)(() => 
      branch(sym3,sym2)(idP)(() => B[sym1][1]+B[sym1][2]+B[sym1][3])
      (divP(10))(multP(7))(()=>2+3+4+5)(multP(3))(() => 
        branch(sym1,sym2)(divP(7))(addP(8))(multP(3))
        (() => B[sym1].reduce((a,b) => a+b))
        (addP(-23))(divP(24))(() => lok = false)
      )
    )
  )  
}

test_3 ();

function branch (a, b) {  // Transfers a copy of the last item in A[b] to A[a]
  let c = A[b]().slice(-1);
  return A[a](c);
}

let lok = false;
$: lok;`;
    let funcs = `function wait(ms) {
return new Promise(r => setTimeout(r, ms));
}

async function pause (x) {
  await wait(1000)
  return x;
}

let pauseP = t => async x => {
  await wait(t*1000)
  return x;
}

async function pauseM (x) {
  await wait(600)
  return ret(x);
}

async function pauseX (x) {
  await wait(x);
}

async function squareP (x) {
  await wait(300)
  return x*x;
}

let divPinverse = a => async b => {
  await wait (300)
  return a/b;
}

let divP = a => async b => {
  await wait (300)
  return b/a;
}

let doubleP = async a => {
  await wait (300)
  return a+a;
}

let toInt = a => pareseInt(a, 10);

let addP_toInt = x => async y => {
  await wait(300)
  return toInt(x) + toInt(y);
}

let addP = x => async y => {
  await wait(900)
  return parseInt(x,10) + parseInt(y,10);
}

let multP = x => async y => {
  await wait(300)
  return x * y;
}

let powP = x => async y => {
  await wait(300)
  return y**x;
}

async function cubeP (x) {
  await wait(300)
  return x*x*x;
}

async function idP (x) {
  await wait(900)
  return x;
}
async function sqrtP (x) {
  await wait(900)
  return x**(1/2)
}`;

    	$$self.$$.update = ($$dirty = { j: 1, lock: 1, B: 1, lok: 1 }) => {
    		if ($$dirty.j) ;
    		if ($$dirty.lock) ;
    		if ($$dirty.B) ;
    		if ($$dirty.B) ;
    		if ($$dirty.B) ;
    		if ($$dirty.lok) ;
    	};

    	return {
    		sym1,
    		sym2,
    		sym3,
    		B,
    		lok,
    		start,
    		syms,
    		t_3,
    		code,
    		funcs
    	};
    }

    class Monad5 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, []);
    	}
    }

    /* src/Haskell.svelte generated by Svelte v3.9.1 */

    const file$4 = "src/Haskell.svelte";

    // (30:0) {#if visible}
    function create_if_block$4(ctx) {
    	var div, div_transition, current;

    	return {
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
    			insert(target, div, anchor);
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
    			if (detaching) {
    				detach(div);
    				if (div_transition) div_transition.end();
    			}
    		}
    	};
    }

    function create_fragment$4(ctx) {
    	var t0, p0, t2, p1, t4, p2, t6, p3, t8, span0, t10, a0, t12, br0, t13, pre, t15, p4, t17, span1, t19, a1, t21, br1, t22, br2, t23, span2, t25, a2, t27, span3, t29, a3, current;

    	var if_block =  create_if_block$4();

    	return {
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
    			attr(p2, "id", "large");
    			attr(p2, "class", "svelte-hw6ke3");
    			add_location(p2, file$4, 37, 0, 1593);
    			add_location(p3, file$4, 38, 0, 1627);
    			attr(span0, "class", "tao");
    			add_location(span0, file$4, 39, 0, 1874);
    			attr(a0, "href", "http://hackage.haskell.org/package/base-4.12.0.0/docs/Unsafe-Coerce.html");
    			attr(a0, "target", "_blank");
    			add_location(a0, file$4, 40, 0, 2005);
    			add_location(br0, file$4, 41, 0, 2126);
    			add_location(pre, file$4, 42, 0, 2133);
    			add_location(p4, file$4, 43, 0, 2160);
    			attr(span1, "class", "tao");
    			add_location(span1, file$4, 44, 0, 2722);
    			attr(a1, "href", "http://hackage.haskell.org/package/base-4.12.0.0/docs/src/GHC.IO.Unsafe.html");
    			attr(a1, "target", "_blank");
    			add_location(a1, file$4, 45, 0, 2778);
    			add_location(br1, file$4, 46, 0, 2905);
    			add_location(br2, file$4, 47, 0, 2912);
    			attr(span2, "class", "tao");
    			add_location(span2, file$4, 48, 0, 2919);
    			attr(a2, "href", "https://wiki.haskell.org/Unsafe_functions");
    			attr(a2, "target", "_blank");
    			add_location(a2, file$4, 49, 0, 3028);
    			add_location(span3, file$4, 50, 0, 3129);
    			attr(a3, "href", "https://wiki.haskell.org/Top_level_mutable_state");
    			attr(a3, "target", "_blank");
    			add_location(a3, file$4, 51, 0, 3217);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, t0, anchor);
    			insert(target, p0, anchor);
    			insert(target, t2, anchor);
    			insert(target, p1, anchor);
    			insert(target, t4, anchor);
    			insert(target, p2, anchor);
    			insert(target, t6, anchor);
    			insert(target, p3, anchor);
    			insert(target, t8, anchor);
    			insert(target, span0, anchor);
    			insert(target, t10, anchor);
    			insert(target, a0, anchor);
    			insert(target, t12, anchor);
    			insert(target, br0, anchor);
    			insert(target, t13, anchor);
    			insert(target, pre, anchor);
    			insert(target, t15, anchor);
    			insert(target, p4, anchor);
    			insert(target, t17, anchor);
    			insert(target, span1, anchor);
    			insert(target, t19, anchor);
    			insert(target, a1, anchor);
    			insert(target, t21, anchor);
    			insert(target, br1, anchor);
    			insert(target, t22, anchor);
    			insert(target, br2, anchor);
    			insert(target, t23, anchor);
    			insert(target, span2, anchor);
    			insert(target, t25, anchor);
    			insert(target, a2, anchor);
    			insert(target, t27, anchor);
    			insert(target, span3, anchor);
    			insert(target, t29, anchor);
    			insert(target, a3, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			{
    				if (!if_block) {
    					if_block = create_if_block$4();
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t0.parentNode, t0);
    				} else {
    									transition_in(if_block, 1);
    				}
    			}
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

    			if (detaching) {
    				detach(t0);
    				detach(p0);
    				detach(t2);
    				detach(p1);
    				detach(t4);
    				detach(p2);
    				detach(t6);
    				detach(p3);
    				detach(t8);
    				detach(span0);
    				detach(t10);
    				detach(a0);
    				detach(t12);
    				detach(br0);
    				detach(t13);
    				detach(pre);
    				detach(t15);
    				detach(p4);
    				detach(t17);
    				detach(span1);
    				detach(t19);
    				detach(a1);
    				detach(t21);
    				detach(br1);
    				detach(t22);
    				detach(br2);
    				detach(t23);
    				detach(span2);
    				detach(t25);
    				detach(a2);
    				detach(t27);
    				detach(span3);
    				detach(t29);
    				detach(a3);
    			}
    		}
    	};
    }

    function instance$4($$self) {

    	return {};
    }

    class Haskell extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, []);
    	}
    }

    /* src/Bugs.svelte generated by Svelte v3.9.1 */

    const file$5 = "src/Bugs.svelte";

    // (12:0) {#if visible}
    function create_if_block$5(ctx) {
    	var div, div_transition, current;

    	return {
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
    			insert(target, div, anchor);
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
    			if (detaching) {
    				detach(div);
    				if (div_transition) div_transition.end();
    			}
    		}
    	};
    }

    function create_fragment$5(ctx) {
    	var t0, p0, t2, span0, t4, span1, t6, h3, t8, ul, li0, t10, li1, t12, li2, t14, li3, t16, li4, t18, li5, t20, li6, t22, li7, t24, li8, t26, p1, t28, p2, t30, p3, t32, p4, t34, p5, t36, p6, t38, p7, current;

    	var if_block =  create_if_block$5();

    	return {
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
    			insert(target, t0, anchor);
    			insert(target, p0, anchor);
    			insert(target, t2, anchor);
    			insert(target, span0, anchor);
    			insert(target, t4, anchor);
    			insert(target, span1, anchor);
    			insert(target, t6, anchor);
    			insert(target, h3, anchor);
    			insert(target, t8, anchor);
    			insert(target, ul, anchor);
    			append(ul, li0);
    			append(ul, t10);
    			append(ul, li1);
    			append(ul, t12);
    			append(ul, li2);
    			append(ul, t14);
    			append(ul, li3);
    			append(ul, t16);
    			append(ul, li4);
    			append(ul, t18);
    			append(ul, li5);
    			append(ul, t20);
    			append(ul, li6);
    			append(ul, t22);
    			append(ul, li7);
    			append(ul, t24);
    			append(ul, li8);
    			insert(target, t26, anchor);
    			insert(target, p1, anchor);
    			insert(target, t28, anchor);
    			insert(target, p2, anchor);
    			insert(target, t30, anchor);
    			insert(target, p3, anchor);
    			insert(target, t32, anchor);
    			insert(target, p4, anchor);
    			insert(target, t34, anchor);
    			insert(target, p5, anchor);
    			insert(target, t36, anchor);
    			insert(target, p6, anchor);
    			insert(target, t38, anchor);
    			insert(target, p7, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			{
    				if (!if_block) {
    					if_block = create_if_block$5();
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t0.parentNode, t0);
    				} else {
    									transition_in(if_block, 1);
    				}
    			}
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

    			if (detaching) {
    				detach(t0);
    				detach(p0);
    				detach(t2);
    				detach(span0);
    				detach(t4);
    				detach(span1);
    				detach(t6);
    				detach(h3);
    				detach(t8);
    				detach(ul);
    				detach(t26);
    				detach(p1);
    				detach(t28);
    				detach(p2);
    				detach(t30);
    				detach(p3);
    				detach(t32);
    				detach(p4);
    				detach(t34);
    				detach(p5);
    				detach(t36);
    				detach(p6);
    				detach(t38);
    				detach(p7);
    			}
    		}
    	};
    }

    function instance$5($$self) {

    	return {};
    }

    class Bugs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, []);
    	}
    }

    /* src/Matrix.svelte generated by Svelte v3.9.1 */

    const file$6 = "src/Matrix.svelte";

    // (147:0) {#if visible}
    function create_if_block$6(ctx) {
    	var div, div_transition, current;

    	return {
    		c: function create() {
    			div = element("div");
    			div.textContent = "A LITTLE SVELTE MODULE";
    			set_style(div, "font-family", "Times New Roman");
    			set_style(div, "text-align", "center");
    			set_style(div, "color", "hsl(210, 90%, 90%)");
    			set_style(div, "font-size", "38px");
    			set_style(div, "text-align", "center");
    			add_location(div, file$6, 147, 1, 3955);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
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
    			if (detaching) {
    				detach(div);
    				if (div_transition) div_transition.end();
    			}
    		}
    	};
    }

    function create_fragment$6(ctx) {
    	var t0, br0, t1, br1, t2, div3, div1, button0, t4, br2, t5, br3, t6, div0, button1, t7, t8, br4, t9, button2, t11, br5, t12, br6, t13, div2, button3, t14_value = ctx.cache[ctx.j][0] + "", t14, t15, button4, t16_value = ctx.cache[ctx.j][1] + "", t16, t17, button5, t18_value = ctx.cache[ctx.j][2] + "", t18, t19, br7, t20, br8, t21, button6, t22_value = ctx.cache[ctx.j][3] + "", t22, t23, button7, t24_value = ctx.cache[ctx.j][4] + "", t24, t25, button8, t26_value = ctx.cache[ctx.j][5] + "", t26, t27, br9, t28, br10, t29, button9, t30_value = ctx.cache[ctx.j][6] + "", t30, t31, button10, t32_value = ctx.cache[ctx.j][7] + "", t32, t33, button11, t34_value = ctx.cache[ctx.j][8] + "", t34, t35, br11, t36, p0, t38, pre0, t39, t40, p1, t42, pre1, t43, t44, p2, current, dispose;

    	var if_block =  create_if_block$6();

    	return {
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
    			t7 = text(ctx.j);
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
    			p0.textContent = "This is the JavaScript code inside of the script tags except for the definitions of the variables \"code\" and \"html\", which are just the code and html cut and pasted inside of back quotes:";
    			t38 = space();
    			pre0 = element("pre");
    			t39 = text(ctx.code);
    			t40 = space();
    			p1 = element("p");
    			p1.textContent = "And here is the HTML code:";
    			t42 = space();
    			pre1 = element("pre");
    			t43 = text(ctx.html);
    			t44 = space();
    			p2 = element("p");
    			p2.textContent = "I'm new to Svelte and so far I am very impressed.";
    			add_location(br0, file$6, 152, 0, 4141);
    			add_location(br1, file$6, 153, 0, 4146);
    			add_location(button0, file$6, 157, 0, 4287);
    			add_location(br2, file$6, 160, 0, 4327);
    			add_location(br3, file$6, 161, 0, 4332);
    			add_location(button1, file$6, 162, 30, 4367);
    			set_style(div0, "text-indent", "20px");
    			add_location(div0, file$6, 162, 0, 4337);
    			add_location(br4, file$6, 163, 0, 4396);
    			add_location(button2, file$6, 164, 0, 4401);
    			add_location(br5, file$6, 167, 0, 4447);
    			add_location(br6, file$6, 168, 0, 4452);
    			set_style(div1, "text-align", "right");
    			set_style(div1, "margin-right", "2%");
    			set_style(div1, "width", "20%");
    			add_location(div1, file$6, 155, 20, 4221);
    			attr(button3, "id", "m0");
    			add_location(button3, file$6, 173, 0, 4551);
    			attr(button4, "id", "m1");
    			add_location(button4, file$6, 174, 0, 4613);
    			attr(button5, "id", "m2");
    			add_location(button5, file$6, 175, 0, 4675);
    			add_location(br7, file$6, 176, 0, 4737);
    			add_location(br8, file$6, 177, 0, 4742);
    			attr(button6, "id", "m3");
    			add_location(button6, file$6, 178, 0, 4747);
    			attr(button7, "id", "m4");
    			add_location(button7, file$6, 179, 0, 4809);
    			attr(button8, "id", "m5");
    			add_location(button8, file$6, 180, 0, 4871);
    			add_location(br9, file$6, 181, 0, 4933);
    			add_location(br10, file$6, 182, 0, 4938);
    			attr(button9, "id", "m6");
    			add_location(button9, file$6, 183, 0, 4943);
    			attr(button10, "id", "m7");
    			add_location(button10, file$6, 184, 0, 5005);
    			attr(button11, "id", "m8");
    			add_location(button11, file$6, 185, 0, 5067);
    			set_style(div2, "marginRight", "0%");
    			set_style(div2, "width", "80%");
    			add_location(div2, file$6, 171, 12, 4505);
    			set_style(div3, "display", "flex");
    			add_location(div3, file$6, 154, 20, 4171);
    			add_location(br11, file$6, 188, 0, 5143);
    			add_location(p0, file$6, 190, 0, 5149);
    			add_location(pre0, file$6, 191, 0, 5346);
    			add_location(p1, file$6, 192, 0, 5364);
    			add_location(pre1, file$6, 193, 0, 5400);
    			add_location(p2, file$6, 194, 0, 5418);

    			dispose = [
    				listen(button0, "click", ctx.back),
    				listen(button2, "click", ctx.forward),
    				listen(button3, "click", ctx.ob.push),
    				listen(button4, "click", ctx.ob.push),
    				listen(button5, "click", ctx.ob.push),
    				listen(button6, "click", ctx.ob.push),
    				listen(button7, "click", ctx.ob.push),
    				listen(button8, "click", ctx.ob.push),
    				listen(button9, "click", ctx.ob.push),
    				listen(button10, "click", ctx.ob.push),
    				listen(button11, "click", ctx.ob.push)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, t0, anchor);
    			insert(target, br0, anchor);
    			insert(target, t1, anchor);
    			insert(target, br1, anchor);
    			insert(target, t2, anchor);
    			insert(target, div3, anchor);
    			append(div3, div1);
    			append(div1, button0);
    			append(div1, t4);
    			append(div1, br2);
    			append(div1, t5);
    			append(div1, br3);
    			append(div1, t6);
    			append(div1, div0);
    			append(div0, button1);
    			append(button1, t7);
    			append(div1, t8);
    			append(div1, br4);
    			append(div1, t9);
    			append(div1, button2);
    			append(div1, t11);
    			append(div1, br5);
    			append(div1, t12);
    			append(div1, br6);
    			append(div3, t13);
    			append(div3, div2);
    			append(div2, button3);
    			append(button3, t14);
    			append(div2, t15);
    			append(div2, button4);
    			append(button4, t16);
    			append(div2, t17);
    			append(div2, button5);
    			append(button5, t18);
    			append(div2, t19);
    			append(div2, br7);
    			append(div2, t20);
    			append(div2, br8);
    			append(div2, t21);
    			append(div2, button6);
    			append(button6, t22);
    			append(div2, t23);
    			append(div2, button7);
    			append(button7, t24);
    			append(div2, t25);
    			append(div2, button8);
    			append(button8, t26);
    			append(div2, t27);
    			append(div2, br9);
    			append(div2, t28);
    			append(div2, br10);
    			append(div2, t29);
    			append(div2, button9);
    			append(button9, t30);
    			append(div2, t31);
    			append(div2, button10);
    			append(button10, t32);
    			append(div2, t33);
    			append(div2, button11);
    			append(button11, t34);
    			insert(target, t35, anchor);
    			insert(target, br11, anchor);
    			insert(target, t36, anchor);
    			insert(target, p0, anchor);
    			insert(target, t38, anchor);
    			insert(target, pre0, anchor);
    			append(pre0, t39);
    			insert(target, t40, anchor);
    			insert(target, p1, anchor);
    			insert(target, t42, anchor);
    			insert(target, pre1, anchor);
    			append(pre1, t43);
    			insert(target, t44, anchor);
    			insert(target, p2, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			{
    				if (!if_block) {
    					if_block = create_if_block$6();
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t0.parentNode, t0);
    				} else {
    									transition_in(if_block, 1);
    				}
    			}

    			if (!current || changed.j) {
    				set_data(t7, ctx.j);
    			}

    			if ((!current || changed.j) && t14_value !== (t14_value = ctx.cache[ctx.j][0] + "")) {
    				set_data(t14, t14_value);
    			}

    			if ((!current || changed.j) && t16_value !== (t16_value = ctx.cache[ctx.j][1] + "")) {
    				set_data(t16, t16_value);
    			}

    			if ((!current || changed.j) && t18_value !== (t18_value = ctx.cache[ctx.j][2] + "")) {
    				set_data(t18, t18_value);
    			}

    			if ((!current || changed.j) && t22_value !== (t22_value = ctx.cache[ctx.j][3] + "")) {
    				set_data(t22, t22_value);
    			}

    			if ((!current || changed.j) && t24_value !== (t24_value = ctx.cache[ctx.j][4] + "")) {
    				set_data(t24, t24_value);
    			}

    			if ((!current || changed.j) && t26_value !== (t26_value = ctx.cache[ctx.j][5] + "")) {
    				set_data(t26, t26_value);
    			}

    			if ((!current || changed.j) && t30_value !== (t30_value = ctx.cache[ctx.j][6] + "")) {
    				set_data(t30, t30_value);
    			}

    			if ((!current || changed.j) && t32_value !== (t32_value = ctx.cache[ctx.j][7] + "")) {
    				set_data(t32, t32_value);
    			}

    			if ((!current || changed.j) && t34_value !== (t34_value = ctx.cache[ctx.j][8] + "")) {
    				set_data(t34, t34_value);
    			}
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

    			if (detaching) {
    				detach(t0);
    				detach(br0);
    				detach(t1);
    				detach(br1);
    				detach(t2);
    				detach(div3);
    				detach(t35);
    				detach(br11);
    				detach(t36);
    				detach(p0);
    				detach(t38);
    				detach(pre0);
    				detach(t40);
    				detach(p1);
    				detach(t42);
    				detach(pre1);
    				detach(t44);
    				detach(p2);
    			}

    			run_all(dispose);
    		}
    	};
    }

    function instance$6($$self, $$props, $$invalidate) {
    	

      var cache = [[1,2,3,4,5,6,7,8,9]];
      var j = 0;
      var ob = {x: [], push: function push (e) {
         ob.x.push(parseInt(e.target.id.slice(1,2), 10));
         if (ob.x.length >1) {
             var d = exchange(ob.x[0], ob.x[1]);
             cache.splice(j+1,0,d);
             ob.x = []; $$invalidate('ob', ob);
             j+=1;
             return cache;   var j = 0;
            }
         }
      };

       function exchange (k,n) {
          var ar = cache[j].slice();
          var a = ar[k];
          ar[k] = ar[n];
          ar[n] = a;
          return ar;
       }

       var back = function back () {
          if (j > 0) { $$invalidate('j', j = j-=1); $$invalidate('j', j); }
          else $$invalidate('j', j);
       };

       var forward = function forward () {
          if (j+1 < cache.length) { $$invalidate('j', j = j+=1); $$invalidate('j', j); }
          else $$invalidate('j', j);
        };

         var cache = [[1,2,3,4,5,6,7,8,9]];
         var j = 0;
         var ob = {x: [], push: function push (e) {
            ob.x.push(parseInt(e.target.id.slice(1,2), 10));
            if (ob.x.length >1) {
                var d = exchange(ob.x[0], ob.x[1]);
                cache.splice(j+1,0,d);
                ob.x = []; $$invalidate('ob', ob);
                $$invalidate('j', j+=1);
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

    	return { cache, j, ob, back, forward, code, html };
    }

    class Matrix extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, []);
    	}
    }

    /* src/Transducer.svelte generated by Svelte v3.9.1 */

    const file$7 = "src/Transducer.svelte";

    // (393:0) {#if visible}
    function create_if_block$7(ctx) {
    	var div, div_transition, current;

    	return {
    		c: function create() {
    			div = element("div");
    			div.textContent = "TRANSDUCER SIMULATION";
    			set_style(div, "font-family", "Times New Roman");
    			set_style(div, "text-align", "center");
    			set_style(div, "color", "hsl(210, 90%, 90%)");
    			set_style(div, "font-size", "32px");
    			add_location(div, file$7, 393, 1, 8806);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
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
    			if (detaching) {
    				detach(div);
    				if (div_transition) div_transition.end();
    			}
    		}
    	};
    }

    function create_fragment$7(ctx) {
    	var t0, p0, t2, p1, t4, p2, t6, p3, t8, br0, br1, t9, div0, t10, t11_value = ctx.transducerResult.length + "", t11, t12, br2, br3, t13, div1, t15, br4, t16, div2, t17, t18_value = ctx.A_A.join(", ") + "", t18, t19, t20, br5, t21, br6, t22, div3, t24, br7, t25, div4, t26, t27_value = ctx.B_B.join(", ") + "", t27, t28, t29, br8, t30, br9, t31, div5, t33, br10, t34, div6, t35, t36_value = ctx.C_C.join(", ") + "", t36, t37_1, t38, br11, t39, br12, t40, div7, t42, br13, t43, div8, t44, t45_value = ctx.D_D.join(", ") + "", t45, t46, t47, br14, t48, br15, t49, button0, t51, button1, t53, br16, br17, t54, div9, t55, t56, t57, br18, t58, div10, t59, t60_value = ctx.ar74.join(", ") + "", t60, t61, t62, br19, t63, div11, t65, pre0, t66, t67, p4, t69, div12, t71, pre1, t73, p5, t75, div13, t77, pre2, t79, p6, t81, p7, t83, pre3, t84, t85, p8, t87, pre4, t88, t89, span0, t91, a, t93, span1, current, dispose;

    	var if_block =  create_if_block$7();

    	return {
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
    			t56 = text(ctx.size);
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
    			t66 = text(ctx.mon44);
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
    			t84 = text(ctx.callback);
    			t85 = space();
    			p8 = element("p");
    			p8.textContent = "And here's some of the code behind the transducer demonstration:";
    			t87 = space();
    			pre4 = element("pre");
    			t88 = text(ctx.call2);
    			t89 = space();
    			span0 = element("span");
    			span0.textContent = "The rest of the code can be found in the";
    			t91 = space();
    			a = element("a");
    			a.textContent = "Github repository";
    			t93 = space();
    			span1 = element("span");
    			span1.textContent = ".";
    			add_location(p0, file$7, 398, 0, 8970);
    			add_location(p1, file$7, 399, 0, 9381);
    			add_location(p2, file$7, 400, 0, 9627);
    			add_location(p3, file$7, 401, 0, 9962);
    			add_location(br0, file$7, 402, 0, 10070);
    			add_location(br1, file$7, 402, 4, 10074);
    			add_location(div0, file$7, 403, 0, 10079);
    			add_location(br2, file$7, 404, 0, 10133);
    			add_location(br3, file$7, 404, 4, 10137);
    			attr(div1, "class", "p svelte-1d81q6r");
    			add_location(div1, file$7, 405, 0, 10142);
    			add_location(br4, file$7, 406, 0, 10193);
    			attr(div2, "class", "q svelte-1d81q6r");
    			add_location(div2, file$7, 407, 0, 10198);
    			add_location(br5, file$7, 408, 0, 10239);
    			add_location(br6, file$7, 409, 0, 10244);
    			attr(div3, "class", "p svelte-1d81q6r");
    			add_location(div3, file$7, 410, 0, 10249);
    			add_location(br7, file$7, 411, 0, 10310);
    			attr(div4, "class", "q svelte-1d81q6r");
    			add_location(div4, file$7, 412, 0, 10315);
    			add_location(br8, file$7, 413, 0, 10357);
    			add_location(br9, file$7, 414, 0, 10362);
    			attr(div5, "class", "p svelte-1d81q6r");
    			add_location(div5, file$7, 415, 0, 10367);
    			add_location(br10, file$7, 416, 0, 10431);
    			attr(div6, "class", "q svelte-1d81q6r");
    			add_location(div6, file$7, 417, 0, 10436);
    			add_location(br11, file$7, 418, 0, 10478);
    			add_location(br12, file$7, 419, 0, 10483);
    			attr(div7, "class", "p svelte-1d81q6r");
    			add_location(div7, file$7, 420, 0, 10488);
    			add_location(br13, file$7, 421, 0, 10551);
    			attr(div8, "class", "q svelte-1d81q6r");
    			add_location(div8, file$7, 422, 0, 10556);
    			add_location(br14, file$7, 423, 0, 10598);
    			add_location(br15, file$7, 424, 0, 10603);
    			attr(button0, "class", "but");
    			add_location(button0, file$7, 425, 0, 10608);
    			attr(button1, "class", "but");
    			add_location(button1, file$7, 426, 0, 10668);
    			add_location(br16, file$7, 427, 0, 10728);
    			add_location(br17, file$7, 427, 4, 10732);
    			add_location(div9, file$7, 428, 0, 10737);
    			add_location(br18, file$7, 429, 0, 10769);
    			add_location(div10, file$7, 430, 0, 10774);
    			add_location(br19, file$7, 431, 0, 10811);
    			add_location(div11, file$7, 432, 0, 10816);
    			add_location(pre0, file$7, 433, 0, 11132);
    			add_location(p4, file$7, 434, 0, 11151);
    			set_style(div12, "color", "#BBFFBB");
    			add_location(div12, file$7, 435, 0, 11245);
    			add_location(pre1, file$7, 437, 0, 11305);
    			add_location(p5, file$7, 441, 0, 11411);
    			set_style(div13, "color", "#BBFFBB");
    			add_location(div13, file$7, 443, 0, 11538);
    			add_location(pre2, file$7, 445, 0, 11614);
    			add_location(p6, file$7, 454, 0, 11799);
    			add_location(p7, file$7, 455, 0, 12023);
    			add_location(pre3, file$7, 456, 0, 12162);
    			add_location(p8, file$7, 457, 0, 12184);
    			add_location(pre4, file$7, 458, 0, 12258);
    			add_location(span0, file$7, 459, 0, 12277);
    			attr(a, "href", "https://github.com/dschalk/blog");
    			add_location(a, file$7, 460, 0, 12333);
    			add_location(span1, file$7, 461, 0, 12399);

    			dispose = [
    				listen(button0, "click", ctx.increase),
    				listen(button1, "click", ctx.decrease)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, t0, anchor);
    			insert(target, p0, anchor);
    			insert(target, t2, anchor);
    			insert(target, p1, anchor);
    			insert(target, t4, anchor);
    			insert(target, p2, anchor);
    			insert(target, t6, anchor);
    			insert(target, p3, anchor);
    			insert(target, t8, anchor);
    			insert(target, br0, anchor);
    			insert(target, br1, anchor);
    			insert(target, t9, anchor);
    			insert(target, div0, anchor);
    			append(div0, t10);
    			append(div0, t11);
    			insert(target, t12, anchor);
    			insert(target, br2, anchor);
    			insert(target, br3, anchor);
    			insert(target, t13, anchor);
    			insert(target, div1, anchor);
    			insert(target, t15, anchor);
    			insert(target, br4, anchor);
    			insert(target, t16, anchor);
    			insert(target, div2, anchor);
    			append(div2, t17);
    			append(div2, t18);
    			append(div2, t19);
    			insert(target, t20, anchor);
    			insert(target, br5, anchor);
    			insert(target, t21, anchor);
    			insert(target, br6, anchor);
    			insert(target, t22, anchor);
    			insert(target, div3, anchor);
    			insert(target, t24, anchor);
    			insert(target, br7, anchor);
    			insert(target, t25, anchor);
    			insert(target, div4, anchor);
    			append(div4, t26);
    			append(div4, t27);
    			append(div4, t28);
    			insert(target, t29, anchor);
    			insert(target, br8, anchor);
    			insert(target, t30, anchor);
    			insert(target, br9, anchor);
    			insert(target, t31, anchor);
    			insert(target, div5, anchor);
    			insert(target, t33, anchor);
    			insert(target, br10, anchor);
    			insert(target, t34, anchor);
    			insert(target, div6, anchor);
    			append(div6, t35);
    			append(div6, t36);
    			append(div6, t37_1);
    			insert(target, t38, anchor);
    			insert(target, br11, anchor);
    			insert(target, t39, anchor);
    			insert(target, br12, anchor);
    			insert(target, t40, anchor);
    			insert(target, div7, anchor);
    			insert(target, t42, anchor);
    			insert(target, br13, anchor);
    			insert(target, t43, anchor);
    			insert(target, div8, anchor);
    			append(div8, t44);
    			append(div8, t45);
    			append(div8, t46);
    			insert(target, t47, anchor);
    			insert(target, br14, anchor);
    			insert(target, t48, anchor);
    			insert(target, br15, anchor);
    			insert(target, t49, anchor);
    			insert(target, button0, anchor);
    			insert(target, t51, anchor);
    			insert(target, button1, anchor);
    			insert(target, t53, anchor);
    			insert(target, br16, anchor);
    			insert(target, br17, anchor);
    			insert(target, t54, anchor);
    			insert(target, div9, anchor);
    			append(div9, t55);
    			append(div9, t56);
    			insert(target, t57, anchor);
    			insert(target, br18, anchor);
    			insert(target, t58, anchor);
    			insert(target, div10, anchor);
    			append(div10, t59);
    			append(div10, t60);
    			append(div10, t61);
    			insert(target, t62, anchor);
    			insert(target, br19, anchor);
    			insert(target, t63, anchor);
    			insert(target, div11, anchor);
    			insert(target, t65, anchor);
    			insert(target, pre0, anchor);
    			append(pre0, t66);
    			insert(target, t67, anchor);
    			insert(target, p4, anchor);
    			insert(target, t69, anchor);
    			insert(target, div12, anchor);
    			insert(target, t71, anchor);
    			insert(target, pre1, anchor);
    			insert(target, t73, anchor);
    			insert(target, p5, anchor);
    			insert(target, t75, anchor);
    			insert(target, div13, anchor);
    			insert(target, t77, anchor);
    			insert(target, pre2, anchor);
    			insert(target, t79, anchor);
    			insert(target, p6, anchor);
    			insert(target, t81, anchor);
    			insert(target, p7, anchor);
    			insert(target, t83, anchor);
    			insert(target, pre3, anchor);
    			append(pre3, t84);
    			insert(target, t85, anchor);
    			insert(target, p8, anchor);
    			insert(target, t87, anchor);
    			insert(target, pre4, anchor);
    			append(pre4, t88);
    			insert(target, t89, anchor);
    			insert(target, span0, anchor);
    			insert(target, t91, anchor);
    			insert(target, a, anchor);
    			insert(target, t93, anchor);
    			insert(target, span1, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			{
    				if (!if_block) {
    					if_block = create_if_block$7();
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t0.parentNode, t0);
    				} else {
    									transition_in(if_block, 1);
    				}
    			}

    			if ((!current || changed.transducerResult) && t11_value !== (t11_value = ctx.transducerResult.length + "")) {
    				set_data(t11, t11_value);
    			}

    			if ((!current || changed.A_A) && t18_value !== (t18_value = ctx.A_A.join(", ") + "")) {
    				set_data(t18, t18_value);
    			}

    			if ((!current || changed.B_B) && t27_value !== (t27_value = ctx.B_B.join(", ") + "")) {
    				set_data(t27, t27_value);
    			}

    			if ((!current || changed.C_C) && t36_value !== (t36_value = ctx.C_C.join(", ") + "")) {
    				set_data(t36, t36_value);
    			}

    			if ((!current || changed.D_D) && t45_value !== (t45_value = ctx.D_D.join(", ") + "")) {
    				set_data(t45, t45_value);
    			}

    			if (!current || changed.size) {
    				set_data(t56, ctx.size);
    			}

    			if ((!current || changed.ar74) && t60_value !== (t60_value = ctx.ar74.join(", ") + "")) {
    				set_data(t60, t60_value);
    			}
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

    			if (detaching) {
    				detach(t0);
    				detach(p0);
    				detach(t2);
    				detach(p1);
    				detach(t4);
    				detach(p2);
    				detach(t6);
    				detach(p3);
    				detach(t8);
    				detach(br0);
    				detach(br1);
    				detach(t9);
    				detach(div0);
    				detach(t12);
    				detach(br2);
    				detach(br3);
    				detach(t13);
    				detach(div1);
    				detach(t15);
    				detach(br4);
    				detach(t16);
    				detach(div2);
    				detach(t20);
    				detach(br5);
    				detach(t21);
    				detach(br6);
    				detach(t22);
    				detach(div3);
    				detach(t24);
    				detach(br7);
    				detach(t25);
    				detach(div4);
    				detach(t29);
    				detach(br8);
    				detach(t30);
    				detach(br9);
    				detach(t31);
    				detach(div5);
    				detach(t33);
    				detach(br10);
    				detach(t34);
    				detach(div6);
    				detach(t38);
    				detach(br11);
    				detach(t39);
    				detach(br12);
    				detach(t40);
    				detach(div7);
    				detach(t42);
    				detach(br13);
    				detach(t43);
    				detach(div8);
    				detach(t47);
    				detach(br14);
    				detach(t48);
    				detach(br15);
    				detach(t49);
    				detach(button0);
    				detach(t51);
    				detach(button1);
    				detach(t53);
    				detach(br16);
    				detach(br17);
    				detach(t54);
    				detach(div9);
    				detach(t57);
    				detach(br18);
    				detach(t58);
    				detach(div10);
    				detach(t62);
    				detach(br19);
    				detach(t63);
    				detach(div11);
    				detach(t65);
    				detach(pre0);
    				detach(t67);
    				detach(p4);
    				detach(t69);
    				detach(div12);
    				detach(t71);
    				detach(pre1);
    				detach(t73);
    				detach(p5);
    				detach(t75);
    				detach(div13);
    				detach(t77);
    				detach(pre2);
    				detach(t79);
    				detach(p6);
    				detach(t81);
    				detach(p7);
    				detach(t83);
    				detach(pre3);
    				detach(t85);
    				detach(p8);
    				detach(t87);
    				detach(pre4);
    				detach(t89);
    				detach(span0);
    				detach(t91);
    				detach(a);
    				detach(t93);
    				detach(span1);
    			}

    			run_all(dispose);
    		}
    	};
    }

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
    }

    function Monad$1 ( AR = [] )  {
    let p, run;
    let ar = AR.slice();
    let x = ar.pop();
    return run = (function run (x) {
      if (x === null || x === NaN ||
        x === undefined) x = f_('stop').pop();
      if (x instanceof Filt) {
        let z = ar.pop();
        if (x.filt(z)) x = z; else ar = [];
      }
      else if (x instanceof Promise) x.then(y =>
        {if (y != undefined && typeof y !== "boolean" && y === y &&
        y.name !== "f_" &&
        y.name !== "stop" ) {
        ar.push(y);
      }});
      else if (x != undefined && x === x  && x !== false
        && x.name !== "f_" && x.name !== "stop" ) {
        ar.push(x);
      }  function f_ (func) {
        if (func === 'stop' || func === 'S') return ar;
        else if (func === 'finish' || func === 'F') return Object.freeze(ar);
        else if (typeof func !== "function") p = func;
        else if (x instanceof Promise) p = x.then(v => func(v));
        else p = func(x);
        return run(p);
      }
      return f_;
    })(x)
    }

    function concat(xs, val) {return xs.concat(val);}

    function mapping(f) {
     return function(rf) {
        return (acc, val) => {
           return rf(acc, f(val));
        }
     }
    }

    function Filt (p) {this.p = p; this.filt = function filt (x) {return p(x)};}

    function instance$7($$self, $$props, $$invalidate) {

    let isOdd = function isOdd (x) {return new Filt(v => v % 2 === 1)};

    let fives = function fives (x) {return new Filt(v => v % 10 === 5)};

    let ar = "cowgirl";

    let cleanF = function cleanF (arthur = []) {
      $$invalidate('ar', ar = arthur);
      return ar.filter(
        a => a === 0 || a && typeof a !== "boolean" //
      ).reduce((a,b)=>a.concat(b),[])
    };

    let mon44 = `function Monad ( AR = [] )  {
  let f_, p, run;
  let ar = AR.slice();
  let x = ar.pop();
  return run = (function run (x) {
    if (x === null || x === NaN ||
      x === undefined) x = f_('stop').pop();
    if (x instanceof Filt) {
      let z = ar.pop();
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

    let compose = (...fns) =>
    fns.reduceRight((prevFn, nextFn) =>
    (...args) => nextFn(prevFn(...args)),
    value => value
    );
    let cube = function cube(v) { return v**3; };

    let size = 400;

    let ar74 = [...Array(size).keys()];

    let mapWRf = mapping(cube);
    let mapRes = ar74.reduce(mapWRf(concat), []);

    let isEven = x => x % 2 === 0;
    let not = x => !x;
    let isOdd2 = compose(not, isEven);

    let A_A = "H";

    let B_B = "s";

    let C_C = "G";

    let D_D = "I";

    let res1;
    // $: res1;

    let res2;
    // $: res2;

    let res3;

    let dotResult = [];

    let transducerResult;


     $$invalidate('A_A', A_A = dotResult = ar74
       .filter(v => (v % 2 === 1))
       .map(x => x**4)
       .map(x => x+3)
       .map(x => x-3)
       .filter(v => v % 10 === 5)
       .map(x => Math.sqrt(x))
       .map(v=>v*v)
       .map(v=>v+1000)); $$invalidate('dotResult', dotResult);

    let xform;

    let xform2;

    let xform3;

      let td1 = x => Monad$1([x])(isOdd)(v=>v**4)(v=>v+3)(v=>v-3)(fives)(Math.sqrt)('stop').pop();
      let td2 = y => Monad$1([y])(v=>v*v)(v=>v+1000)('stop').pop();

    res1 = ar74.map(x => td1(x));
    $$invalidate('B_B', B_B = res2 = res1.map(y => td2(y))); $$invalidate('res2', res2);
    $$invalidate('C_C', C_C = res3 = ar74.map(z => td2(td1(z)))); $$invalidate('res3', res3);


       $$invalidate('xform', xform = compose(
          tdFilter(x=>x%2===1),
          tdMap(x => x**4),
          tdMap(x => x+3),
          tdMap(x => x-3),
          tdFilter(x => x % 10 === 5),
          tdMap(x => Math.sqrt(x))
       ));
       $$invalidate('xform2', xform2 = compose(
          tdMap(x=>x*x),
          tdMap(x=>x+1000)
       ));

       $$invalidate('xform3', xform3 = compose(
          tdFilter(x=>x%2===1),
          tdMap(x => x**4),
          tdMap(x => x+3),
          tdMap(x => x-3),
          tdFilter(x => x % 10 === 5),
          tdMap(x => Math.sqrt(x)),
          tdMap(x=>x*x),
          tdMap(x=>x+1000)
       ));
       $$invalidate('D_D', D_D = transducerResult = ar74.reduce(xform3(concat),[] )); $$invalidate('transducerResult', transducerResult), $$invalidate('ar74', ar74), $$invalidate('xform3', xform3);

    let callback = `function increase () {
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
  let fives = function fives (x) {return new Filt(v => v % 10 === 5)}
  let isOdd = function isOdd (x) {return new Filt(v => v % 2 === 1)};

  let td1 = x => Monad([x])(isOdd)(v=>v**4)(v=>v+3)
    (v=>v-3)(fives)(Math.sqrt)('stop').pop()
  res1 = ar74.map(x => td1(x));
  let td2 = y => Monad([y])(v=>v*v)(v=>v+1000)('stop').pop()`;

    let call2 = `xform3 = compose(
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

      function increase () {
        $$invalidate('size', size = size + 10);
        $$invalidate('ar74', ar74 = [...Array(size).keys()]);
        res1 = ar74.map(x => td1(x));
         $$invalidate('A_A', A_A = dotResult = ar74
         .filter(v => (v % 2 === 1))
         .map(x => x**4)
         .map(x => x+3)
         .map(x => x-3)
         .filter(v => v % 10 === 5)
         .map(x => Math.sqrt(x))
         .map(v=>v*v)
         .map(v=>v+1000)); $$invalidate('dotResult', dotResult);
        $$invalidate('B_B', B_B = res2 = res1.map(y => td2(y))); $$invalidate('res2', res2);
        $$invalidate('C_C', C_C = res3 = ar74.map(z => td2(td1(z)))); $$invalidate('res3', res3);
        $$invalidate('D_D', D_D = transducerResult = ar74.reduce(xform3(concat),[] )); $$invalidate('transducerResult', transducerResult), $$invalidate('ar74', ar74), $$invalidate('xform3', xform3);
      }

    function decrease () {
      $$invalidate('size', size = size - 10);
      $$invalidate('ar74', ar74 = [...Array(size).keys()]);
      res1 = ar74.map(x => td1(x));
       $$invalidate('A_A', A_A = dotResult = ar74
       .filter(v => (v % 2 === 1))
       .map(x => x**4)
       .map(x => x+3)
       .map(x => x-3)
       .filter(v => v % 10 === 5)
       .map(x => Math.sqrt(x))
       .map(v=>v*v)
       .map(v=>v+1000)); $$invalidate('dotResult', dotResult);
      $$invalidate('B_B', B_B = res2 = res1.map(y => td2(y))); $$invalidate('res2', res2);
      $$invalidate('C_C', C_C = res3 = ar74.map(z => td2(td1(z)))); $$invalidate('res3', res3);
      $$invalidate('D_D', D_D = transducerResult = ar74.reduce(xform3(concat),[] )); $$invalidate('transducerResult', transducerResult), $$invalidate('ar74', ar74), $$invalidate('xform3', xform3);
    }
    increase();
    decrease();

    	$$self.$$.update = ($$dirty = { k: 1, ltTest: 1, ar: 1, cleanF: 1, size: 1, ar74: 1, dotResult: 1, A_A: 1, res2: 1, B_B: 1, res3: 1, C_C: 1, xform3: 1, transducerResult: 1, D_D: 1, res4: 1, test9: 1, td3: 1, xform: 1, xform2: 1, t37: 1 }) => {
    		if ($$dirty.k) ;
    		if ($$dirty.ltTest) ;
    		if ($$dirty.ar) ;
    		if ($$dirty.cleanF) ;
    		if ($$dirty.size) ;
    		if ($$dirty.ar74) ;
    		if ($$dirty.dotResult) { $$invalidate('A_A', A_A = dotResult); }
    		if ($$dirty.A_A) ;
    		if ($$dirty.cleanF || $$dirty.res2) { $$invalidate('B_B', B_B = cleanF(res2)); }
    		if ($$dirty.B_B) ;
    		if ($$dirty.cleanF || $$dirty.res3) { $$invalidate('C_C', C_C = cleanF(res3)); }
    		if ($$dirty.C_C) ;
    		if ($$dirty.ar74 || $$dirty.xform3) { $$invalidate('transducerResult', transducerResult = ar74.reduce(xform3(concat),[] )); }
    		if ($$dirty.transducerResult) { $$invalidate('D_D', D_D = transducerResult); }
    		if ($$dirty.D_D) ;
    		if ($$dirty.res3) ;
    		if ($$dirty.res4) ;
    		if ($$dirty.dotResult) ;
    		if ($$dirty.test9) ;
    		if ($$dirty.transducerResult) ;
    		if ($$dirty.td3) ;
    		if ($$dirty.xform) ;
    		if ($$dirty.xform2) ;
    		if ($$dirty.xform3) ;
    		if ($$dirty.t37) ;
    		if ($$dirty.dotResult) ;
    		if ($$dirty.res2) ;
    		if ($$dirty.res3) ;
    		if ($$dirty.transducerResult) ;
    		if ($$dirty.size) ;
    		if ($$dirty.ar74) ;
    	};

    	return {
    		mon44,
    		size,
    		ar74,
    		A_A,
    		B_B,
    		C_C,
    		D_D,
    		transducerResult,
    		callback,
    		call2,
    		increase,
    		decrease
    	};
    }

    class Transducer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, []);
    	}
    }

    /* src/ToggleClass.svelte generated by Svelte v3.9.1 */

    const file$8 = "src/ToggleClass.svelte";

    function create_fragment$8(ctx) {
    	var span0, t1, input, t2, span1, t4, span2, t5_value = ctx.num_a +1 + "", t5, t6, t7, br0, br1, t8, button0, t10, button1, t12, button2, t14, span3, t16, span4, t18, a, t20, span5, t22, pre, t23, t24, br2, br3, br4, t25, br5, br6, br7, t26, div, dispose;

    	return {
    		c: function create() {
    			span0 = element("span");
    			span0.textContent = "Elapsed time modulo";
    			t1 = space();
    			input = element("input");
    			t2 = space();
    			span1 = element("span");
    			span1.textContent = "is";
    			t4 = space();
    			span2 = element("span");
    			t5 = text(t5_value);
    			t6 = text(" seconds. Clicking selects a button. If you don't click, the buttons change every three seconds regardless of the elapsed time.");
    			t7 = space();
    			br0 = element("br");
    			br1 = element("br");
    			t8 = space();
    			button0 = element("button");
    			button0.textContent = "foo";
    			t10 = space();
    			button1 = element("button");
    			button1.textContent = "bar";
    			t12 = space();
    			button2 = element("button");
    			button2.textContent = "baz";
    			t14 = space();
    			span3 = element("span");
    			span3.textContent = "This module demonstrates manipulation of CSS classes in Svelte. Here is the most relevant code";
    			t16 = space();
    			span4 = element("span");
    			span4.textContent = "(the rest of the code is in the";
    			t18 = space();
    			a = element("a");
    			a.textContent = "Repository";
    			t20 = space();
    			span5 = element("span");
    			span5.textContent = "):";
    			t22 = space();
    			pre = element("pre");
    			t23 = text(ctx.code);
    			t24 = space();
    			br2 = element("br");
    			br3 = element("br");
    			br4 = element("br");
    			t25 = space();
    			br5 = element("br");
    			br6 = element("br");
    			br7 = element("br");
    			t26 = space();
    			div = element("div");
    			div.textContent = "_._._._";
    			add_location(span0, file$8, 72, 0, 1088);
    			attr(input, "class", "svelte-1ic2flp");
    			add_location(input, file$8, 73, 0, 1122);
    			add_location(span1, file$8, 74, 0, 1151);
    			add_location(span2, file$8, 75, 0, 1169);
    			add_location(br0, file$8, 76, 0, 1321);
    			add_location(br1, file$8, 76, 4, 1325);
    			attr(button0, "class", "svelte-1ic2flp");
    			toggle_class(button0, "active", ctx.current === 'foo');
    			add_location(button0, file$8, 77, 0, 1330);
    			attr(button1, "class", "svelte-1ic2flp");
    			toggle_class(button1, "active", ctx.current === 'bar');
    			add_location(button1, file$8, 82, 0, 1413);
    			attr(button2, "class", "svelte-1ic2flp");
    			toggle_class(button2, "active", ctx.current === 'baz');
    			add_location(button2, file$8, 87, 0, 1496);
    			add_location(span3, file$8, 91, 0, 1578);
    			add_location(span4, file$8, 92, 0, 1687);
    			attr(a, "href", "https://github.com/dschalk/blog");
    			attr(a, "target", "_blank");
    			add_location(a, file$8, 93, 0, 1734);
    			add_location(span5, file$8, 94, 0, 1812);
    			set_style(pre, "color", "#aaccff");
    			add_location(pre, file$8, 95, 0, 1828);
    			add_location(br2, file$8, 96, 0, 1871);
    			add_location(br3, file$8, 96, 4, 1875);
    			add_location(br4, file$8, 96, 8, 1879);
    			add_location(br5, file$8, 97, 0, 1884);
    			add_location(br6, file$8, 97, 4, 1888);
    			add_location(br7, file$8, 97, 8, 1892);
    			set_style(div, "text-align", "center");
    			add_location(div, file$8, 98, 0, 1897);

    			dispose = [
    				listen(input, "input", ctx.input_input_handler),
    				listen(button0, "click", ctx.click_handler),
    				listen(button1, "click", ctx.click_handler_1),
    				listen(button2, "click", ctx.click_handler_2)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, span0, anchor);
    			insert(target, t1, anchor);
    			insert(target, input, anchor);

    			set_input_value(input, ctx.mod);

    			insert(target, t2, anchor);
    			insert(target, span1, anchor);
    			insert(target, t4, anchor);
    			insert(target, span2, anchor);
    			append(span2, t5);
    			append(span2, t6);
    			insert(target, t7, anchor);
    			insert(target, br0, anchor);
    			insert(target, br1, anchor);
    			insert(target, t8, anchor);
    			insert(target, button0, anchor);
    			insert(target, t10, anchor);
    			insert(target, button1, anchor);
    			insert(target, t12, anchor);
    			insert(target, button2, anchor);
    			insert(target, t14, anchor);
    			insert(target, span3, anchor);
    			insert(target, t16, anchor);
    			insert(target, span4, anchor);
    			insert(target, t18, anchor);
    			insert(target, a, anchor);
    			insert(target, t20, anchor);
    			insert(target, span5, anchor);
    			insert(target, t22, anchor);
    			insert(target, pre, anchor);
    			append(pre, t23);
    			insert(target, t24, anchor);
    			insert(target, br2, anchor);
    			insert(target, br3, anchor);
    			insert(target, br4, anchor);
    			insert(target, t25, anchor);
    			insert(target, br5, anchor);
    			insert(target, br6, anchor);
    			insert(target, br7, anchor);
    			insert(target, t26, anchor);
    			insert(target, div, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (changed.mod && (input.value !== ctx.mod)) set_input_value(input, ctx.mod);

    			if ((changed.num_a) && t5_value !== (t5_value = ctx.num_a +1 + "")) {
    				set_data(t5, t5_value);
    			}

    			if (changed.current) {
    				toggle_class(button0, "active", ctx.current === 'foo');
    				toggle_class(button1, "active", ctx.current === 'bar');
    				toggle_class(button2, "active", ctx.current === 'baz');
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(span0);
    				detach(t1);
    				detach(input);
    				detach(t2);
    				detach(span1);
    				detach(t4);
    				detach(span2);
    				detach(t7);
    				detach(br0);
    				detach(br1);
    				detach(t8);
    				detach(button0);
    				detach(t10);
    				detach(button1);
    				detach(t12);
    				detach(button2);
    				detach(t14);
    				detach(span3);
    				detach(t16);
    				detach(span4);
    				detach(t18);
    				detach(a);
    				detach(t20);
    				detach(span5);
    				detach(t22);
    				detach(pre);
    				detach(t24);
    				detach(br2);
    				detach(br3);
    				detach(br4);
    				detach(t25);
    				detach(br5);
    				detach(br6);
    				detach(br7);
    				detach(t26);
    				detach(div);
    			}

    			run_all(dispose);
    		}
    	};
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let current = 'foo';
    	
    let { num_a, num_b, mod, car } = $$props;
    /* we don't need to declare `squared` and `cubed`
    	— Svelte does it for us
    $: squared = num * num;
    $: cubed = squared * num; */

    $$invalidate('num_a', num_a = 0);
    $$invalidate('num_b', num_b = 0);
    $$invalidate('mod', mod = 5);
    $$invalidate('car', car = ['foo', 'foo', 'foo', 'bar', 'bar', 'bar', 'baz', 'baz', 'baz']);

    setInterval(() => {
    	if (mod) {
    		$$invalidate('num_a', num_a = (num_a += 1) % mod); $$invalidate('num_a', num_a);
    		$$invalidate('num_b', num_b = (num_b += 1) % 9); $$invalidate('num_b', num_b);
    		$$invalidate('current', current = car[num_b]);
    	}	
    }, 1000);

    let code = `num_a = 0;
num_b = 0;
mod = 5;
car = ['foo', 'foo', 'foo', 'bar', 'bar', 'bar', 'baz', 'baz', 'baz']

setInterval(() => {
	if (mod) {
		num_a = (num_a += 1) % mod
		num_b = (num_b += 1) % 9
		current = car[num_b]
	}	
}, 1000)

<button
class:active={current === 'foo'}
on:click={() => num_b = 0}
>foo</button>

<button
class:active={current === 'bar'}
on:click={() => num_b = 4}
>bar</button>

<button
class:active={current === 'baz'}
on:click={() => num_b = 7}
>baz</button> `;

    	const writable_props = ['num_a', 'num_b', 'mod', 'car'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<ToggleClass> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		mod = this.value;
    		$$invalidate('mod', mod);
    	}

    	function click_handler() {
    		const $$result = num_b = 0;
    		$$invalidate('num_b', num_b);
    		return $$result;
    	}

    	function click_handler_1() {
    		const $$result = num_b = 4;
    		$$invalidate('num_b', num_b);
    		return $$result;
    	}

    	function click_handler_2() {
    		const $$result = num_b = 7;
    		$$invalidate('num_b', num_b);
    		return $$result;
    	}

    	$$self.$set = $$props => {
    		if ('num_a' in $$props) $$invalidate('num_a', num_a = $$props.num_a);
    		if ('num_b' in $$props) $$invalidate('num_b', num_b = $$props.num_b);
    		if ('mod' in $$props) $$invalidate('mod', mod = $$props.mod);
    		if ('car' in $$props) $$invalidate('car', car = $$props.car);
    	};

    	return {
    		current,
    		num_a,
    		num_b,
    		mod,
    		car,
    		code,
    		input_input_handler,
    		click_handler,
    		click_handler_1,
    		click_handler_2
    	};
    }

    class ToggleClass extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, ["num_a", "num_b", "mod", "car"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.num_a === undefined && !('num_a' in props)) {
    			console.warn("<ToggleClass> was created without expected prop 'num_a'");
    		}
    		if (ctx.num_b === undefined && !('num_b' in props)) {
    			console.warn("<ToggleClass> was created without expected prop 'num_b'");
    		}
    		if (ctx.mod === undefined && !('mod' in props)) {
    			console.warn("<ToggleClass> was created without expected prop 'mod'");
    		}
    		if (ctx.car === undefined && !('car' in props)) {
    			console.warn("<ToggleClass> was created without expected prop 'car'");
    		}
    	}

    	get num_a() {
    		throw new Error("<ToggleClass>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set num_a(value) {
    		throw new Error("<ToggleClass>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get num_b() {
    		throw new Error("<ToggleClass>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set num_b(value) {
    		throw new Error("<ToggleClass>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mod() {
    		throw new Error("<ToggleClass>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mod(value) {
    		throw new Error("<ToggleClass>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get car() {
    		throw new Error("<ToggleClass>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set car(value) {
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

    /* src/Stor.svelte generated by Svelte v3.9.1 */

    const file$9 = "src/Stor.svelte";

    function create_fragment$9(ctx) {
    	var h2, t0, t1;

    	return {
    		c: function create() {
    			h2 = element("h2");
    			t0 = text("loc is ");
    			t1 = text(ctx.$loc);
    			add_location(h2, file$9, 27, 0, 434);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, h2, anchor);
    			append(h2, t0);
    			append(h2, t1);
    		},

    		p: function update(changed, ctx) {
    			if (changed.$loc) {
    				set_data(t1, ctx.$loc);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(h2);
    			}
    		}
    	};
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let $count, $loc;

    	const count = writable(0); validate_store(count, 'count'); component_subscribe($$self, count, $$value => { $count = $$value; $$invalidate('$count', $count); });
    	console.log($count); // logs 0

    	count.set(1);
    	console.log($count); // logs 1

    	$count = 2; count.set($count);
    	console.log($count); // logs 2

    	const loc = writable(false); validate_store(loc, 'loc'); component_subscribe($$self, loc, $$value => { $loc = $$value; $$invalidate('$loc', $loc); });
    	console.log($loc); // logs false

    	loc.set(true);
    	console.log($loc); // logs true

    	$loc = false; loc.set($loc);
    	console.log($loc); // logs false

    	loc.set(true);
    	console.log($loc); // logs true

    	return { count, loc, $loc };
    }

    class Stor extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, []);
    	}
    }

    /* src/ToggleTheme.svelte generated by Svelte v3.9.1 */

    const file$a = "src/ToggleTheme.svelte";

    // (10:1) {#if dark}
    function create_if_block$8(ctx) {
    	var link;

    	return {
    		c: function create() {
    			link = element("link");
    			attr(link, "rel", "stylesheet");
    			attr(link, "href", "style.css");
    			add_location(link, file$a, 10, 1, 171);
    		},

    		m: function mount(target, anchor) {
    			insert(target, link, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(link);
    			}
    		}
    	};
    }

    function create_fragment$a(ctx) {
    	var if_block_anchor, t0, h1, t2, t3, button, current, dispose;

    	var if_block = (ctx.dark) && create_if_block$8();

    	var stor = new Stor({ $$inline: true });

    	return {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			t0 = space();
    			h1 = element("h1");
    			h1.textContent = "Hello World!";
    			t2 = space();
    			stor.$$.fragment.c();
    			t3 = space();
    			button = element("button");
    			button.textContent = "toggle theme";
    			add_location(h1, file$a, 14, 0, 235);
    			add_location(button, file$a, 17, 0, 267);
    			dispose = listen(button, "click", ctx.toggleTheme);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(document.head, null);
    			append(document.head, if_block_anchor);
    			insert(target, t0, anchor);
    			insert(target, h1, anchor);
    			insert(target, t2, anchor);
    			mount_component(stor, target, anchor);
    			insert(target, t3, anchor);
    			insert(target, button, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.dark) {
    				if (!if_block) {
    					if_block = create_if_block$8();
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
    			detach(if_block_anchor);

    			if (detaching) {
    				detach(t0);
    				detach(h1);
    				detach(t2);
    			}

    			destroy_component(stor, detaching);

    			if (detaching) {
    				detach(t3);
    				detach(button);
    			}

    			dispose();
    		}
    	};
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let dark = false;
    	const toggleTheme = () => { const $$result = dark = dark === false; $$invalidate('dark', dark); return $$result; };

    	return { dark, toggleTheme };
    }

    class ToggleTheme extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, []);
    	}
    }

    /* src/Home.svelte generated by Svelte v3.9.1 */

    const file$b = "src/Home.svelte";

    // (44:0) {#if visible}
    function create_if_block$9(ctx) {
    	var div, div_transition, current;

    	return {
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
    			insert(target, div, anchor);
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
    			if (detaching) {
    				detach(div);
    				if (div_transition) div_transition.end();
    			}
    		}
    	};
    }

    function create_fragment$b(ctx) {
    	var t0, p, t2, br0, t3, br1, t4, br2, t5, div, current;

    	var if_block =  create_if_block$9();

    	return {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			p = element("p");
    			p.textContent = "Each item in the menu on the left links to a Svelte component. Some components are supported by a modified Haskell Wai Websockets server.";
    			t2 = space();
    			br0 = element("br");
    			t3 = space();
    			br1 = element("br");
    			t4 = space();
    			br2 = element("br");
    			t5 = space();
    			div = element("div");
    			div.textContent = "...";
    			add_location(p, file$b, 49, 0, 879);
    			add_location(br0, file$b, 60, 0, 1038);
    			add_location(br1, file$b, 61, 0, 1043);
    			add_location(br2, file$b, 62, 0, 1048);
    			set_style(div, "text-align", "center");
    			add_location(div, file$b, 63, 0, 1053);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, t0, anchor);
    			insert(target, p, anchor);
    			insert(target, t2, anchor);
    			insert(target, br0, anchor);
    			insert(target, t3, anchor);
    			insert(target, br1, anchor);
    			insert(target, t4, anchor);
    			insert(target, br2, anchor);
    			insert(target, t5, anchor);
    			insert(target, div, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			{
    				if (!if_block) {
    					if_block = create_if_block$9();
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t0.parentNode, t0);
    				} else {
    									transition_in(if_block, 1);
    				}
    			}
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

    			if (detaching) {
    				detach(t0);
    				detach(p);
    				detach(t2);
    				detach(br0);
    				detach(t3);
    				detach(br1);
    				detach(t4);
    				detach(br2);
    				detach(t5);
    				detach(div);
    			}
    		}
    	};
    }

    function instance$b($$self, $$props, $$invalidate) {

    	return {};
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, []);
    	}
    }

    /* src/Score.svelte generated by Svelte v3.9.1 */

    const file$c = "src/Score.svelte";

    // (5:0) {#if visible}
    function create_if_block$a(ctx) {
    	var div, div_transition, current;

    	return {
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
    			insert(target, div, anchor);
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
    			if (detaching) {
    				detach(div);
    				if (div_transition) div_transition.end();
    			}
    		}
    	};
    }

    function create_fragment$c(ctx) {
    	var t0, br0, t1, p0, t3, p1, t5, p2, t7, a0, t9, span0, t11, a1, t13, br1, br2, t14, span1, t16, a2, t18, span2, t20, a3, t22, span3, t24, a4, t26, span4, t28, a5, t30, span5, t32, a6, t34, span6, current;

    	var if_block =  create_if_block$a();

    	return {
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
    			attr(a0, "href", "http://game.schalk.site");
    			attr(a0, "target", "_blank");
    			add_location(a0, file$c, 16, 0, 759);
    			add_location(span0, file$c, 17, 0, 839);
    			attr(a1, "href", "https://github.com/dschalk/score2");
    			attr(a1, "target", "_blank");
    			add_location(a1, file$c, 18, 0, 872);
    			add_location(br1, file$c, 19, 0, 964);
    			add_location(br2, file$c, 19, 4, 968);
    			add_location(span1, file$c, 20, 0, 973);
    			attr(a2, "href", "https://nodejs.org/en/about/");
    			attr(a2, "target", "_blank");
    			add_location(a2, file$c, 21, 0, 1004);
    			add_location(span2, file$c, 22, 0, 1072);
    			attr(a3, "href", "https://reactjs.org/");
    			attr(a3, "target", "_blank");
    			add_location(a3, file$c, 23, 0, 1090);
    			add_location(span3, file$c, 24, 0, 1151);
    			attr(a4, "href", "https://cycle.js.org");
    			attr(a4, "target", "_blank");
    			add_location(a4, file$c, 25, 0, 1207);
    			add_location(span4, file$c, 26, 0, 1272);
    			attr(a5, "href", "https://svelte.dev/");
    			attr(a5, "target", "_blank");
    			add_location(a5, file$c, 27, 0, 1314);
    			add_location(span5, file$c, 28, 0, 1375);
    			attr(a6, "href", "https://www.freecodecamp.org/news/a-realworld-comparison-of-front-end-frameworks-with-benchmarks-2019-update-4be0d3c78075/");
    			attr(a6, "target", "_blank");
    			add_location(a6, file$c, 29, 0, 1541);
    			add_location(span6, file$c, 30, 0, 1755);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, t0, anchor);
    			insert(target, br0, anchor);
    			insert(target, t1, anchor);
    			insert(target, p0, anchor);
    			insert(target, t3, anchor);
    			insert(target, p1, anchor);
    			insert(target, t5, anchor);
    			insert(target, p2, anchor);
    			insert(target, t7, anchor);
    			insert(target, a0, anchor);
    			insert(target, t9, anchor);
    			insert(target, span0, anchor);
    			insert(target, t11, anchor);
    			insert(target, a1, anchor);
    			insert(target, t13, anchor);
    			insert(target, br1, anchor);
    			insert(target, br2, anchor);
    			insert(target, t14, anchor);
    			insert(target, span1, anchor);
    			insert(target, t16, anchor);
    			insert(target, a2, anchor);
    			insert(target, t18, anchor);
    			insert(target, span2, anchor);
    			insert(target, t20, anchor);
    			insert(target, a3, anchor);
    			insert(target, t22, anchor);
    			insert(target, span3, anchor);
    			insert(target, t24, anchor);
    			insert(target, a4, anchor);
    			insert(target, t26, anchor);
    			insert(target, span4, anchor);
    			insert(target, t28, anchor);
    			insert(target, a5, anchor);
    			insert(target, t30, anchor);
    			insert(target, span5, anchor);
    			insert(target, t32, anchor);
    			insert(target, a6, anchor);
    			insert(target, t34, anchor);
    			insert(target, span6, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			{
    				if (!if_block) {
    					if_block = create_if_block$a();
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t0.parentNode, t0);
    				} else {
    									transition_in(if_block, 1);
    				}
    			}
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

    			if (detaching) {
    				detach(t0);
    				detach(br0);
    				detach(t1);
    				detach(p0);
    				detach(t3);
    				detach(p1);
    				detach(t5);
    				detach(p2);
    				detach(t7);
    				detach(a0);
    				detach(t9);
    				detach(span0);
    				detach(t11);
    				detach(a1);
    				detach(t13);
    				detach(br1);
    				detach(br2);
    				detach(t14);
    				detach(span1);
    				detach(t16);
    				detach(a2);
    				detach(t18);
    				detach(span2);
    				detach(t20);
    				detach(a3);
    				detach(t22);
    				detach(span3);
    				detach(t24);
    				detach(a4);
    				detach(t26);
    				detach(span4);
    				detach(t28);
    				detach(a5);
    				detach(t30);
    				detach(span5);
    				detach(t32);
    				detach(a6);
    				detach(t34);
    				detach(span6);
    			}
    		}
    	};
    }

    class Score extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$c, safe_not_equal, []);
    	}
    }

    /* src/Cargo.svelte generated by Svelte v3.9.1 */

    const file$d = "src/Cargo.svelte";

    // (18:0) {#if visible}
    function create_if_block$b(ctx) {
    	var div, div_transition, current;

    	return {
    		c: function create() {
    			div = element("div");
    			div.textContent = "FUNCTIONAL PROGRAMMING";
    			set_style(div, "font-family", "Times New Roman");
    			set_style(div, "text-align", "center");
    			set_style(div, "color", "hsl(210, 90%, 90%)");
    			set_style(div, "font-size", "32px");
    			add_location(div, file$d, 18, 1, 196);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
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
    			if (detaching) {
    				detach(div);
    				if (div_transition) div_transition.end();
    			}
    		}
    	};
    }

    function create_fragment$d(ctx) {
    	var t0, p0, p1, t3, a0, t5, p2, t7, p3, t9, p4, t11, p5, t13, h3, t15, a1, t17, br0, br1, t18, a2, t20, br2, br3, br4, t21, div, current;

    	var if_block =  create_if_block$b();

    	return {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			p0 = element("p");
    			p0.textContent = "\"Functional programming\" means different things to different people. Applied to JavaScript, I wish it meant making good use JavaScript functions. \n\n\n";
    			p1 = element("p");
    			p1.textContent = "Mimicking features of the Haskell programming language vaguely hoping Haskell's reliability, ease of maintenance, and other conveniences will come your way reminds me of the cargo cults. \"The name derives from the belief which began among Melanesians in the late 19th and early 20th centuries that various ritualistic acts such as the building of an airplane runway will result in the appearance of material wealth, particularly highly desirable Western goods (i.e., \"cargo\"), via Western airplanes.\"";
    			t3 = space();
    			a0 = element("a");
    			a0.textContent = "Cargo Cult";
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
    			a1 = element("a");
    			a1.textContent = "Cargo Cult Programming video presentation";
    			t17 = space();
    			br0 = element("br");
    			br1 = element("br");
    			t18 = space();
    			a2 = element("a");
    			a2.textContent = "Cargo Cult Science -- Richard Feynman's 1974 Caltech lecture";
    			t20 = space();
    			br2 = element("br");
    			br3 = element("br");
    			br4 = element("br");
    			t21 = space();
    			div = element("div");
    			div.textContent = "...";
    			add_location(p0, file$d, 22, 0, 359);
    			add_location(p1, file$d, 25, 0, 512);
    			attr(a0, "href", "https://en.wikipedia.org/wiki/Cargo_cult");
    			attr(a0, "target", "_blank");
    			add_location(a0, file$d, 28, 0, 1025);
    			add_location(p2, file$d, 30, 0, 1110);
    			add_location(p3, file$d, 32, 0, 2019);
    			add_location(p4, file$d, 35, 0, 2744);
    			add_location(p5, file$d, 36, 0, 3160);
    			attr(h3, "class", "svelte-hw6ke3");
    			add_location(h3, file$d, 38, 0, 3719);
    			attr(a1, "href", "https://www.youtube.com/watch?v=nm22duia0jU");
    			attr(a1, "target", "_blank");
    			add_location(a1, file$d, 40, 0, 3740);
    			add_location(br0, file$d, 41, 0, 3856);
    			add_location(br1, file$d, 41, 4, 3860);
    			attr(a2, "href", "https://www.youtube.com/watch?v=yvfAtIJbatg");
    			attr(a2, "target", "_blank");
    			add_location(a2, file$d, 42, 0, 3865);
    			add_location(br2, file$d, 44, 0, 4003);
    			add_location(br3, file$d, 44, 4, 4007);
    			add_location(br4, file$d, 44, 8, 4011);
    			set_style(div, "text-align", "center");
    			add_location(div, file$d, 45, 0, 4016);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, t0, anchor);
    			insert(target, p0, anchor);
    			insert(target, p1, anchor);
    			insert(target, t3, anchor);
    			insert(target, a0, anchor);
    			insert(target, t5, anchor);
    			insert(target, p2, anchor);
    			insert(target, t7, anchor);
    			insert(target, p3, anchor);
    			insert(target, t9, anchor);
    			insert(target, p4, anchor);
    			insert(target, t11, anchor);
    			insert(target, p5, anchor);
    			insert(target, t13, anchor);
    			insert(target, h3, anchor);
    			insert(target, t15, anchor);
    			insert(target, a1, anchor);
    			insert(target, t17, anchor);
    			insert(target, br0, anchor);
    			insert(target, br1, anchor);
    			insert(target, t18, anchor);
    			insert(target, a2, anchor);
    			insert(target, t20, anchor);
    			insert(target, br2, anchor);
    			insert(target, br3, anchor);
    			insert(target, br4, anchor);
    			insert(target, t21, anchor);
    			insert(target, div, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			{
    				if (!if_block) {
    					if_block = create_if_block$b();
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t0.parentNode, t0);
    				} else {
    									transition_in(if_block, 1);
    				}
    			}
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

    			if (detaching) {
    				detach(t0);
    				detach(p0);
    				detach(p1);
    				detach(t3);
    				detach(a0);
    				detach(t5);
    				detach(p2);
    				detach(t7);
    				detach(p3);
    				detach(t9);
    				detach(p4);
    				detach(t11);
    				detach(p5);
    				detach(t13);
    				detach(h3);
    				detach(t15);
    				detach(a1);
    				detach(t17);
    				detach(br0);
    				detach(br1);
    				detach(t18);
    				detach(a2);
    				detach(t20);
    				detach(br2);
    				detach(br3);
    				detach(br4);
    				detach(t21);
    				detach(div);
    			}
    		}
    	};
    }

    class Cargo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$d, safe_not_equal, []);
    	}
    }

    /* src/Blog.svelte generated by Svelte v3.9.1 */

    const file$e = "src/Blog.svelte";

    // (218:0) {#if j === 0}
    function create_if_block_12(ctx) {
    	var div, t_1, current;

    	var home = new Home({ $$inline: true });

    	return {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Home";
    			t_1 = space();
    			home.$$.fragment.c();
    			attr(div, "class", "show svelte-15w100o");
    			add_location(div, file$e, 218, 0, 6148);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			insert(target, t_1, anchor);
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
    			if (detaching) {
    				detach(div);
    				detach(t_1);
    			}

    			destroy_component(home, detaching);
    		}
    	};
    }

    // (222:0) {#if j === 1}
    function create_if_block_11(ctx) {
    	var div, t_1, current;

    	var monad = new Monad_1({ $$inline: true });

    	return {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Simple Monad";
    			t_1 = space();
    			monad.$$.fragment.c();
    			attr(div, "class", "show svelte-15w100o");
    			add_location(div, file$e, 222, 0, 6206);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			insert(target, t_1, anchor);
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
    			if (detaching) {
    				detach(div);
    				detach(t_1);
    			}

    			destroy_component(monad, detaching);
    		}
    	};
    }

    // (226:0) {#if j === 2}
    function create_if_block_10(ctx) {
    	var div, t_1, current;

    	var monad2 = new Monad2({ $$inline: true });

    	return {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Messages Monad";
    			t_1 = space();
    			monad2.$$.fragment.c();
    			attr(div, "class", "show svelte-15w100o");
    			add_location(div, file$e, 226, 0, 6273);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			insert(target, t_1, anchor);
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
    			if (detaching) {
    				detach(div);
    				detach(t_1);
    			}

    			destroy_component(monad2, detaching);
    		}
    	};
    }

    // (230:0) {#if j === 3}
    function create_if_block_9(ctx) {
    	var div, t_1, current;

    	var monad3 = new Monad3({ $$inline: true });

    	return {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Promises Monad";
    			t_1 = space();
    			monad3.$$.fragment.c();
    			attr(div, "class", "show svelte-15w100o");
    			add_location(div, file$e, 230, 0, 6343);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			insert(target, t_1, anchor);
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
    			if (detaching) {
    				detach(div);
    				detach(t_1);
    			}

    			destroy_component(monad3, detaching);
    		}
    	};
    }

    // (234:0) {#if j === 14}
    function create_if_block_8(ctx) {
    	var div, t_1, current;

    	var monad5 = new Monad5({ $$inline: true });

    	return {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Promises II";
    			t_1 = space();
    			monad5.$$.fragment.c();
    			attr(div, "class", "show svelte-15w100o");
    			add_location(div, file$e, 234, 0, 6414);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			insert(target, t_1, anchor);
    			mount_component(monad5, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(monad5.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(monad5.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    				detach(t_1);
    			}

    			destroy_component(monad5, detaching);
    		}
    	};
    }

    // (238:0) {#if j === 4}
    function create_if_block_7(ctx) {
    	var div, t_1, current;

    	var transducer = new Transducer({ $$inline: true });

    	return {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Transducer Monad";
    			t_1 = space();
    			transducer.$$.fragment.c();
    			attr(div, "class", "show svelte-15w100o");
    			add_location(div, file$e, 238, 0, 6481);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			insert(target, t_1, anchor);
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
    			if (detaching) {
    				detach(div);
    				detach(t_1);
    			}

    			destroy_component(transducer, detaching);
    		}
    	};
    }

    // (242:0) {#if j === 5}
    function create_if_block_6(ctx) {
    	var div, t_1, current;

    	var matrix = new Matrix({ $$inline: true });

    	return {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Why Svelte";
    			t_1 = space();
    			matrix.$$.fragment.c();
    			attr(div, "class", "show svelte-15w100o");
    			add_location(div, file$e, 242, 0, 6557);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			insert(target, t_1, anchor);
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
    			if (detaching) {
    				detach(div);
    				detach(t_1);
    			}

    			destroy_component(matrix, detaching);
    		}
    	};
    }

    // (246:0) {#if j === 6}
    function create_if_block_5(ctx) {
    	var div, t_1, current;

    	var haskell = new Haskell({ $$inline: true });

    	return {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Haskell Tip";
    			t_1 = space();
    			haskell.$$.fragment.c();
    			attr(div, "class", "show svelte-15w100o");
    			add_location(div, file$e, 246, 0, 6623);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			insert(target, t_1, anchor);
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
    			if (detaching) {
    				detach(div);
    				detach(t_1);
    			}

    			destroy_component(haskell, detaching);
    		}
    	};
    }

    // (250:0) {#if j === 7}
    function create_if_block_4(ctx) {
    	var div, t_1, current;

    	var score = new Score({ $$inline: true });

    	return {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Game of Score";
    			t_1 = space();
    			score.$$.fragment.c();
    			attr(div, "class", "show svelte-15w100o");
    			add_location(div, file$e, 250, 0, 6691);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			insert(target, t_1, anchor);
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
    			if (detaching) {
    				detach(div);
    				detach(t_1);
    			}

    			destroy_component(score, detaching);
    		}
    	};
    }

    // (254:0) {#if j === 8}
    function create_if_block_3(ctx) {
    	var div, t_1, current;

    	var cargo = new Cargo({ $$inline: true });

    	return {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Cargo Cult";
    			t_1 = space();
    			cargo.$$.fragment.c();
    			attr(div, "class", "show svelte-15w100o");
    			add_location(div, file$e, 254, 0, 6759);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			insert(target, t_1, anchor);
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
    			if (detaching) {
    				detach(div);
    				detach(t_1);
    			}

    			destroy_component(cargo, detaching);
    		}
    	};
    }

    // (258:0) {#if j === 9}
    function create_if_block_2(ctx) {
    	var div, t_1, current;

    	var bugs = new Bugs({ $$inline: true });

    	return {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Bed Bugs";
    			t_1 = space();
    			bugs.$$.fragment.c();
    			attr(div, "class", "show svelte-15w100o");
    			add_location(div, file$e, 258, 0, 6824);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			insert(target, t_1, anchor);
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
    			if (detaching) {
    				detach(div);
    				detach(t_1);
    			}

    			destroy_component(bugs, detaching);
    		}
    	};
    }

    // (262:0) {#if j === 10}
    function create_if_block_1(ctx) {
    	var div, t_1, current;

    	var toggleclass = new ToggleClass({ $$inline: true });

    	return {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Toggle Class";
    			t_1 = space();
    			toggleclass.$$.fragment.c();
    			attr(div, "class", "show svelte-15w100o");
    			add_location(div, file$e, 262, 0, 6887);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			insert(target, t_1, anchor);
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
    			if (detaching) {
    				detach(div);
    				detach(t_1);
    			}

    			destroy_component(toggleclass, detaching);
    		}
    	};
    }

    // (266:0) {#if j === 11}
    function create_if_block$c(ctx) {
    	var div, t_1, current;

    	var toggletheme = new ToggleTheme({ $$inline: true });

    	return {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Toggle Theme";
    			t_1 = space();
    			toggletheme.$$.fragment.c();
    			attr(div, "class", "show svelte-15w100o");
    			add_location(div, file$e, 266, 0, 6961);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			insert(target, t_1, anchor);
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
    			if (detaching) {
    				detach(div);
    				detach(t_1);
    			}

    			destroy_component(toggletheme, detaching);
    		}
    	};
    }

    function create_fragment$e(ctx) {
    	var div0, t1, div4, div1, t3, div2, t5, div3, t7, div22, div5, t9, div21, br0, t10, div6, t12, br1, t13, div7, t15, div8, t17, br2, t18, div9, t20, br3, t21, div10, t23, br4, t24, div11, t26, br5, t27, div12, t29, br6, t30, div13, t32, br7, t33, div14, t35, br8, t36, div15, t38, br9, t39, div16, t41, br10, t42, div17, t44, br11, t45, div18, t47, br12, t48, div19, t50, br13, t51, div20, t53, br14, t54, div23, br15, t55, t56, t57, t58, t59, t60, t61, t62, t63, t64, t65, t66, t67, t68, br16, br17, t69, t70, br18, br19, t71, br20, br21, t72, br22, br23, current, dispose;

    	var if_block0 = (ctx.j === 0) && create_if_block_12();

    	var if_block1 = (ctx.j === 1) && create_if_block_11();

    	var if_block2 = (ctx.j === 2) && create_if_block_10();

    	var if_block3 = (ctx.j === 3) && create_if_block_9();

    	var if_block4 = (ctx.j === 14) && create_if_block_8();

    	var if_block5 = (ctx.j === 4) && create_if_block_7();

    	var if_block6 = (ctx.j === 5) && create_if_block_6();

    	var if_block7 = (ctx.j === 6) && create_if_block_5();

    	var if_block8 = (ctx.j === 7) && create_if_block_4();

    	var if_block9 = (ctx.j === 8) && create_if_block_3();

    	var if_block10 = (ctx.j === 9) && create_if_block_2();

    	var if_block11 = (ctx.j === 10) && create_if_block_1();

    	var if_block12 = (ctx.j === 11) && create_if_block$c();

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, null);

    	return {
    		c: function create() {
    			div0 = element("div");
    			div0.textContent = "Functions In JavaScript";
    			t1 = space();
    			div4 = element("div");
    			div1 = element("div");
    			div1.textContent = "David E. Schalk";
    			t3 = space();
    			div2 = element("div");
    			div2.textContent = "fp3216@protonmail.com";
    			t5 = space();
    			div3 = element("div");
    			div3.textContent = "https://github.com/dschalk";
    			t7 = space();
    			div22 = element("div");
    			div5 = element("div");
    			div5.textContent = "Table of Contents";
    			t9 = space();
    			div21 = element("div");
    			br0 = element("br");
    			t10 = space();
    			div6 = element("div");
    			div6.textContent = "Home";
    			t12 = space();
    			br1 = element("br");
    			t13 = space();
    			div7 = element("div");
    			div7.textContent = "Composable Closures";
    			t15 = space();
    			div8 = element("div");
    			div8.textContent = "A/K/A \"Monads\"";
    			t17 = space();
    			br2 = element("br");
    			t18 = space();
    			div9 = element("div");
    			div9.textContent = "A Simple Monad";
    			t20 = space();
    			br3 = element("br");
    			t21 = space();
    			div10 = element("div");
    			div10.textContent = "A Messaging Monad";
    			t23 = space();
    			br4 = element("br");
    			t24 = space();
    			div11 = element("div");
    			div11.textContent = "A Promises Monad";
    			t26 = space();
    			br5 = element("br");
    			t27 = space();
    			div12 = element("div");
    			div12.textContent = "Another Promises Monad";
    			t29 = space();
    			br6 = element("br");
    			t30 = space();
    			div13 = element("div");
    			div13.textContent = "A Transducer Monad";
    			t32 = space();
    			br7 = element("br");
    			t33 = space();
    			div14 = element("div");
    			div14.textContent = "Why Svelte";
    			t35 = space();
    			br8 = element("br");
    			t36 = space();
    			div15 = element("div");
    			div15.textContent = "Haskell Secrets";
    			t38 = space();
    			br9 = element("br");
    			t39 = space();
    			div16 = element("div");
    			div16.textContent = "React Game of Score";
    			t41 = space();
    			br10 = element("br");
    			t42 = space();
    			div17 = element("div");
    			div17.textContent = "Functional Cargo Cult";
    			t44 = space();
    			br11 = element("br");
    			t45 = space();
    			div18 = element("div");
    			div18.textContent = "Eradicating Bed Bugs";
    			t47 = space();
    			br12 = element("br");
    			t48 = space();
    			div19 = element("div");
    			div19.textContent = "Toggle Class";
    			t50 = space();
    			br13 = element("br");
    			t51 = space();
    			div20 = element("div");
    			div20.textContent = "Toggle Theme";
    			t53 = space();
    			br14 = element("br");
    			t54 = space();
    			div23 = element("div");
    			br15 = element("br");
    			t55 = space();
    			if (if_block0) if_block0.c();
    			t56 = space();
    			if (if_block1) if_block1.c();
    			t57 = space();
    			if (if_block2) if_block2.c();
    			t58 = space();
    			if (if_block3) if_block3.c();
    			t59 = space();
    			if (if_block4) if_block4.c();
    			t60 = space();
    			if (if_block5) if_block5.c();
    			t61 = space();
    			if (if_block6) if_block6.c();
    			t62 = space();
    			if (if_block7) if_block7.c();
    			t63 = space();
    			if (if_block8) if_block8.c();
    			t64 = space();
    			if (if_block9) if_block9.c();
    			t65 = space();
    			if (if_block10) if_block10.c();
    			t66 = space();
    			if (if_block11) if_block11.c();
    			t67 = space();
    			if (if_block12) if_block12.c();
    			t68 = space();
    			br16 = element("br");
    			br17 = element("br");
    			t69 = space();

    			if (default_slot) default_slot.c();
    			t70 = space();
    			br18 = element("br");
    			br19 = element("br");
    			t71 = space();
    			br20 = element("br");
    			br21 = element("br");
    			t72 = space();
    			br22 = element("br");
    			br23 = element("br");
    			set_style(div0, "font-size", "56px");
    			set_style(div0, "color", "#FFD700");
    			set_style(div0, "text-align", "center");
    			attr(div0, "class", "svelte-15w100o");
    			add_location(div0, file$e, 121, 0, 2130);
    			set_style(div1, "font-size", "24px");
    			attr(div1, "class", "svelte-15w100o");
    			add_location(div1, file$e, 124, 0, 2248);
    			attr(div2, "class", "svelte-15w100o");
    			add_location(div2, file$e, 125, 0, 2303);
    			attr(div3, "class", "svelte-15w100o");
    			add_location(div3, file$e, 126, 0, 2336);
    			attr(div4, "class", "stat svelte-15w100o");
    			add_location(div4, file$e, 123, 0, 2229);
    			attr(div5, "class", "dropbtn svelte-15w100o");
    			add_location(div5, file$e, 131, 2, 2408);
    			add_location(br0, file$e, 133, 2, 2488);
    			attr(div6, "class", "menu svelte-15w100o");
    			add_location(div6, file$e, 134, 0, 2493);
    			add_location(br1, file$e, 135, 2, 2550);
    			attr(div7, "class", "large svelte-15w100o");
    			add_location(div7, file$e, 136, 0, 2555);
    			attr(div8, "class", "large svelte-15w100o");
    			add_location(div8, file$e, 137, 0, 2600);
    			add_location(br2, file$e, 138, 2, 2642);
    			attr(div9, "class", "menu svelte-15w100o");
    			add_location(div9, file$e, 139, 0, 2647);
    			add_location(br3, file$e, 140, 2, 2714);
    			attr(div10, "class", "menu svelte-15w100o");
    			add_location(div10, file$e, 141, 0, 2719);
    			add_location(br4, file$e, 142, 2, 2789);
    			attr(div11, "class", "menu svelte-15w100o");
    			add_location(div11, file$e, 143, 0, 2794);
    			add_location(br5, file$e, 144, 2, 2863);
    			attr(div12, "class", "menu svelte-15w100o");
    			add_location(div12, file$e, 145, 0, 2868);
    			add_location(br6, file$e, 146, 2, 2944);
    			attr(div13, "class", "menu svelte-15w100o");
    			add_location(div13, file$e, 147, 0, 2949);
    			add_location(br7, file$e, 148, 2, 3020);
    			attr(div14, "class", "menu svelte-15w100o");
    			add_location(div14, file$e, 149, 0, 3025);
    			add_location(br8, file$e, 150, 2, 3088);
    			attr(div15, "class", "menu svelte-15w100o");
    			add_location(div15, file$e, 151, 0, 3093);
    			add_location(br9, file$e, 152, 2, 3161);
    			attr(div16, "class", "menu svelte-15w100o");
    			add_location(div16, file$e, 153, 0, 3166);
    			add_location(br10, file$e, 154, 2, 3238);
    			attr(div17, "class", "menu svelte-15w100o");
    			add_location(div17, file$e, 155, 0, 3243);
    			add_location(br11, file$e, 156, 2, 3317);
    			attr(div18, "class", "menu svelte-15w100o");
    			add_location(div18, file$e, 157, 0, 3322);
    			add_location(br12, file$e, 158, 2, 3395);
    			attr(div19, "class", "menu svelte-15w100o");
    			add_location(div19, file$e, 159, 0, 3400);
    			add_location(br13, file$e, 160, 2, 3466);
    			attr(div20, "class", "menu svelte-15w100o");
    			add_location(div20, file$e, 161, 0, 3471);
    			add_location(br14, file$e, 162, 2, 3537);
    			attr(div21, "class", "dropdown-content svelte-15w100o");
    			add_location(div21, file$e, 132, 2, 2455);
    			attr(div22, "class", "dropdown svelte-15w100o");
    			add_location(div22, file$e, 130, 0, 2383);
    			add_location(br15, file$e, 215, 1, 6128);
    			set_style(div23, "margin-left", "25%");
    			set_style(div23, "margin-right", "25%");
    			attr(div23, "class", "svelte-15w100o");
    			add_location(div23, file$e, 213, 0, 6073);
    			add_location(br16, file$e, 271, 0, 7028);
    			add_location(br17, file$e, 271, 4, 7032);

    			add_location(br18, file$e, 274, 0, 7047);
    			add_location(br19, file$e, 274, 4, 7051);
    			add_location(br20, file$e, 275, 0, 7056);
    			add_location(br21, file$e, 275, 4, 7060);
    			add_location(br22, file$e, 276, 0, 7065);
    			add_location(br23, file$e, 276, 4, 7069);

    			dispose = [
    				listen(div6, "click", ctx.click_handler),
    				listen(div9, "click", ctx.click_handler_1),
    				listen(div10, "click", ctx.click_handler_2),
    				listen(div11, "click", ctx.click_handler_3),
    				listen(div12, "click", ctx.click_handler_4),
    				listen(div13, "click", ctx.click_handler_5),
    				listen(div14, "click", ctx.click_handler_6),
    				listen(div15, "click", ctx.click_handler_7),
    				listen(div16, "click", ctx.click_handler_8),
    				listen(div17, "click", ctx.click_handler_9),
    				listen(div18, "click", ctx.click_handler_10),
    				listen(div19, "click", ctx.click_handler_11),
    				listen(div20, "click", ctx.click_handler_12)
    			];
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div0, anchor);
    			insert(target, t1, anchor);
    			insert(target, div4, anchor);
    			append(div4, div1);
    			append(div4, t3);
    			append(div4, div2);
    			append(div4, t5);
    			append(div4, div3);
    			insert(target, t7, anchor);
    			insert(target, div22, anchor);
    			append(div22, div5);
    			append(div22, t9);
    			append(div22, div21);
    			append(div21, br0);
    			append(div21, t10);
    			append(div21, div6);
    			append(div21, t12);
    			append(div21, br1);
    			append(div21, t13);
    			append(div21, div7);
    			append(div21, t15);
    			append(div21, div8);
    			append(div21, t17);
    			append(div21, br2);
    			append(div21, t18);
    			append(div21, div9);
    			append(div21, t20);
    			append(div21, br3);
    			append(div21, t21);
    			append(div21, div10);
    			append(div21, t23);
    			append(div21, br4);
    			append(div21, t24);
    			append(div21, div11);
    			append(div21, t26);
    			append(div21, br5);
    			append(div21, t27);
    			append(div21, div12);
    			append(div21, t29);
    			append(div21, br6);
    			append(div21, t30);
    			append(div21, div13);
    			append(div21, t32);
    			append(div21, br7);
    			append(div21, t33);
    			append(div21, div14);
    			append(div21, t35);
    			append(div21, br8);
    			append(div21, t36);
    			append(div21, div15);
    			append(div21, t38);
    			append(div21, br9);
    			append(div21, t39);
    			append(div21, div16);
    			append(div21, t41);
    			append(div21, br10);
    			append(div21, t42);
    			append(div21, div17);
    			append(div21, t44);
    			append(div21, br11);
    			append(div21, t45);
    			append(div21, div18);
    			append(div21, t47);
    			append(div21, br12);
    			append(div21, t48);
    			append(div21, div19);
    			append(div21, t50);
    			append(div21, br13);
    			append(div21, t51);
    			append(div21, div20);
    			append(div21, t53);
    			append(div21, br14);
    			insert(target, t54, anchor);
    			insert(target, div23, anchor);
    			append(div23, br15);
    			append(div23, t55);
    			if (if_block0) if_block0.m(div23, null);
    			append(div23, t56);
    			if (if_block1) if_block1.m(div23, null);
    			append(div23, t57);
    			if (if_block2) if_block2.m(div23, null);
    			append(div23, t58);
    			if (if_block3) if_block3.m(div23, null);
    			append(div23, t59);
    			if (if_block4) if_block4.m(div23, null);
    			append(div23, t60);
    			if (if_block5) if_block5.m(div23, null);
    			append(div23, t61);
    			if (if_block6) if_block6.m(div23, null);
    			append(div23, t62);
    			if (if_block7) if_block7.m(div23, null);
    			append(div23, t63);
    			if (if_block8) if_block8.m(div23, null);
    			append(div23, t64);
    			if (if_block9) if_block9.m(div23, null);
    			append(div23, t65);
    			if (if_block10) if_block10.m(div23, null);
    			append(div23, t66);
    			if (if_block11) if_block11.m(div23, null);
    			append(div23, t67);
    			if (if_block12) if_block12.m(div23, null);
    			insert(target, t68, anchor);
    			insert(target, br16, anchor);
    			insert(target, br17, anchor);
    			insert(target, t69, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			insert(target, t70, anchor);
    			insert(target, br18, anchor);
    			insert(target, br19, anchor);
    			insert(target, t71, anchor);
    			insert(target, br20, anchor);
    			insert(target, br21, anchor);
    			insert(target, t72, anchor);
    			insert(target, br22, anchor);
    			insert(target, br23, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.j === 0) {
    				if (!if_block0) {
    					if_block0 = create_if_block_12();
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div23, t56);
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

    			if (ctx.j === 1) {
    				if (!if_block1) {
    					if_block1 = create_if_block_11();
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div23, t57);
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

    			if (ctx.j === 2) {
    				if (!if_block2) {
    					if_block2 = create_if_block_10();
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div23, t58);
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

    			if (ctx.j === 3) {
    				if (!if_block3) {
    					if_block3 = create_if_block_9();
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(div23, t59);
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

    			if (ctx.j === 14) {
    				if (!if_block4) {
    					if_block4 = create_if_block_8();
    					if_block4.c();
    					transition_in(if_block4, 1);
    					if_block4.m(div23, t60);
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

    			if (ctx.j === 4) {
    				if (!if_block5) {
    					if_block5 = create_if_block_7();
    					if_block5.c();
    					transition_in(if_block5, 1);
    					if_block5.m(div23, t61);
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

    			if (ctx.j === 5) {
    				if (!if_block6) {
    					if_block6 = create_if_block_6();
    					if_block6.c();
    					transition_in(if_block6, 1);
    					if_block6.m(div23, t62);
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

    			if (ctx.j === 6) {
    				if (!if_block7) {
    					if_block7 = create_if_block_5();
    					if_block7.c();
    					transition_in(if_block7, 1);
    					if_block7.m(div23, t63);
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

    			if (ctx.j === 7) {
    				if (!if_block8) {
    					if_block8 = create_if_block_4();
    					if_block8.c();
    					transition_in(if_block8, 1);
    					if_block8.m(div23, t64);
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

    			if (ctx.j === 8) {
    				if (!if_block9) {
    					if_block9 = create_if_block_3();
    					if_block9.c();
    					transition_in(if_block9, 1);
    					if_block9.m(div23, t65);
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

    			if (ctx.j === 9) {
    				if (!if_block10) {
    					if_block10 = create_if_block_2();
    					if_block10.c();
    					transition_in(if_block10, 1);
    					if_block10.m(div23, t66);
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

    			if (ctx.j === 10) {
    				if (!if_block11) {
    					if_block11 = create_if_block_1();
    					if_block11.c();
    					transition_in(if_block11, 1);
    					if_block11.m(div23, t67);
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

    			if (ctx.j === 11) {
    				if (!if_block12) {
    					if_block12 = create_if_block$c();
    					if_block12.c();
    					transition_in(if_block12, 1);
    					if_block12.m(div23, null);
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

    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, null),
    					get_slot_context(default_slot_template, ctx, null)
    				);
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
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div0);
    				detach(t1);
    				detach(div4);
    				detach(t7);
    				detach(div22);
    				detach(t54);
    				detach(div23);
    			}

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

    			if (detaching) {
    				detach(t68);
    				detach(br16);
    				detach(br17);
    				detach(t69);
    			}

    			if (default_slot) default_slot.d(detaching);

    			if (detaching) {
    				detach(t70);
    				detach(br18);
    				detach(br19);
    				detach(t71);
    				detach(br20);
    				detach(br21);
    				detach(t72);
    				detach(br22);
    				detach(br23);
    			}

    			run_all(dispose);
    		}
    	};
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { j = 0 } = $$props;

    	const writable_props = ['j'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Blog> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	function click_handler() {
    		const $$result = j = 0;
    		$$invalidate('j', j);
    		return $$result;
    	}

    	function click_handler_1() {
    		const $$result = j = 1;
    		$$invalidate('j', j);
    		return $$result;
    	}

    	function click_handler_2() {
    		const $$result = j = 2;
    		$$invalidate('j', j);
    		return $$result;
    	}

    	function click_handler_3() {
    		const $$result = j = 3;
    		$$invalidate('j', j);
    		return $$result;
    	}

    	function click_handler_4() {
    		const $$result = j = 14;
    		$$invalidate('j', j);
    		return $$result;
    	}

    	function click_handler_5() {
    		const $$result = j = 4;
    		$$invalidate('j', j);
    		return $$result;
    	}

    	function click_handler_6() {
    		const $$result = j = 5;
    		$$invalidate('j', j);
    		return $$result;
    	}

    	function click_handler_7() {
    		const $$result = j = 6;
    		$$invalidate('j', j);
    		return $$result;
    	}

    	function click_handler_8() {
    		const $$result = j = 7;
    		$$invalidate('j', j);
    		return $$result;
    	}

    	function click_handler_9() {
    		const $$result = j = 8;
    		$$invalidate('j', j);
    		return $$result;
    	}

    	function click_handler_10() {
    		const $$result = j = 9;
    		$$invalidate('j', j);
    		return $$result;
    	}

    	function click_handler_11() {
    		const $$result = j = 10;
    		$$invalidate('j', j);
    		return $$result;
    	}

    	function click_handler_12() {
    		const $$result = j = 11;
    		$$invalidate('j', j);
    		return $$result;
    	}

    	$$self.$set = $$props => {
    		if ('j' in $$props) $$invalidate('j', j = $$props.j);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	return {
    		j,
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
    		click_handler_11,
    		click_handler_12,
    		$$slots,
    		$$scope
    	};
    }

    class Blog extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$e, safe_not_equal, ["j"]);
    	}

    	get j() {
    		throw new Error("<Blog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set j(value) {
    		throw new Error("<Blog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.9.1 */

    function create_fragment$f(ctx) {
    	var current;

    	var blog = new Blog({ $$inline: true });

    	return {
    		c: function create() {
    			blog.$$.fragment.c();
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
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$f, safe_not_equal, []);
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
