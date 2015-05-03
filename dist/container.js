(function() {
  var BindingBuilder, Container, InstanceBuilder, global, original;

  BindingBuilder = (function() {
    function BindingBuilder(container, factoryName1) {
      this.container = container;
      this.factoryName = factoryName1;
    }

    BindingBuilder.prototype.needs = function(needsName) {
      this.needsName = needsName;
      return this;
    };

    BindingBuilder.prototype.give = function(implementation) {
      this.container.addContextualBinding(this.factoryName, this.needsName, implementation);
      return this;
    };

    return BindingBuilder;

  })();

  Container = (function() {
    function Container(parentContainer) {
      this.parentContainer = parentContainer;
      this.bindings = {};
      this.instances = {};
      this.contexts = {};
    }

    Container.prototype.bind = function(name, factory, shared) {
      if (shared == null) {
        shared = false;
      }
      return this.bindings[name] = {
        factory: factory,
        shared: shared
      };
    };

    Container.prototype.bound = function(name) {
      return this.bindings[name] != null;
    };

    Container.prototype.bindShared = function(name, concrete) {
      return this.bind(name, concrete, true);
    };

    Container.prototype.instance = function(name, instance) {
      return this.instances[name] = instance;
    };

    Container.prototype.make = function(name, parameters) {
      var context, factory, instance;
      if (this.instances[name]) {
        return this.instances[name];
      }
      factory = this.getFactory(name);
      context = this.getContext(name);
      instance = factory(context, parameters);
      if (this.isShared(name)) {
        this.instances[name] = instance;
      }
      return instance;
    };

    Container.prototype.getFactory = function(name) {
      var factory;
      if (this.bindings[name] != null) {
        factory = this.bindings[name].factory;
        if (typeof factory === "function") {
          return factory;
        }
        if (typeof factory === "string") {
          return this.getFactory(factory);
        }
      }
      if (this.parentContainer != null) {
        return this.parentContainer.getFactory(name);
      }
      throw new Error("Can't find factory for: " + name);
    };

    Container.prototype.isShared = function(name) {
      if (this.bindings[name] == null) {
        return false;
      }
      return this.bindings[name].shared;
    };

    Container.prototype.build = function(name) {
      return new InstanceBuilder(this, name);
    };

    Container.prototype.when = function(name) {
      return new BindingBuilder(this, name);
    };

    Container.prototype.addContextualBinding = function(factoryName, needs, implementation) {
      var context;
      context = this.getContext(factoryName);
      return context.bind(needs, implementation);
    };

    Container.prototype.getContext = function(name) {
      if (this.contexts[name] == null) {
        this.contexts[name] = new Container(this);
      }
      return this.contexts[name];
    };

    return Container;

  })();

  if (typeof exports === "undefined" || exports === null) {
    global = this;
    original = global.Container;
    global.Container = Container;
    Container.noConflict = function() {
      global.Container = original;
      return Container;
    };
  }

  if (typeof exports !== "undefined" && exports !== null) {
    exports.Container = Container;
  }

  if (typeof module !== "undefined" && module !== null) {
    module.exports = Container;
  }

  InstanceBuilder = (function() {
    function InstanceBuilder(parent, name1) {
      this.name = name1;
      this.container = new Container(parent);
    }

    InstanceBuilder.prototype.needs = function(needsName) {
      this.needsName = needsName;
      return this;
    };

    InstanceBuilder.prototype.give = function(implementation) {
      this.container.addContextualBinding(this.name, this.needsName, implementation);
      return this;
    };

    InstanceBuilder.prototype.make = function(parameters) {
      return this.container.make(this.name, parameters);
    };

    return InstanceBuilder;

  })();

}).call(this);

//# sourceMappingURL=./container.js.map