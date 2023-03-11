/**
 * 对于适配器模式理解
 */
// interface
var Duck = function() {};

Duck.prototype.fly = function() {
  throw new Error("this method must reload");
};
Duck.prototype.quack = function() {
  throw new Error("this method must reload");
};
var Turkey = function() {};

Turkey.prototype.fly = function() {
  throw new Error("this method must reload");
};

Turkey.prototype.quack = function() {
  throw new Error("this method must reload");
};
// impl

var MallarDuck = function() {
  Duck.apply(this);
};
MallarDuck.prototype = new Duck();

MallarDuck.prototype.fly = function() {
  console.log("MallarDuck fly");
};

MallarDuck.prototype.quack = function() {
  console.log("MallarDuck quack");
};

var WildTurkey = function() {
  Turkey.apply(this);
};
WildTurkey.prototype = new Turkey();

WildTurkey.prototype.fly = function() {
  console.log("WildTurkey fly");
};

WildTurkey.prototype.gobble = function() {
  console.log("WildTurkey gobble");
};

// adapter
var TurkeyAdapter = function(oTurkey) {
  Duck.apply(this);
  this.oTurkey = oTurkey;
};
TurkeyAdapter.prototype = new Duck();

TurkeyAdapter.prototype.quack = function() {
  this.oTurkey.gobble();
};

TurkeyAdapter.prototype.fly = function() {
  console.log("TurkeyAdapter can fly");
};

var testDuck = new MallarDuck();
var testTurkey = new WildTurkey();
var testAdapterTurkey = new TurkeyAdapter(testTurkey);

testDuck.fly();
testDuck.quack();

testTurkey.fly();
testTurkey.gobble();

testAdapterTurkey.fly();
testAdapterTurkey.quack();
