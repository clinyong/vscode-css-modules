import styles1 from "./sample.css";
const styles2 = require("./sample.css");

console.log(styles1.body);
console.log(styles2.body);
console.log(styles1.side);
console.log(styles1.sidebarWithoutHeader);
console.log(styles1.sidebar_withoutHeader);

// issue-#22
const v = {a: {}};
v?.a; // don't match anything
styles1?. // support optional chain
const es1 = {};
es1. // don't match styles1
